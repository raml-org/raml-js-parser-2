/// <reference path="../../typings/main.d.ts" />
var universe = require("../parser/tools/universe");
import coreApi = require("../parser/wrapped-ast/parserCoreApi");
import core = require("../parser/wrapped-ast/parserCore");
import proxy = require("../parser/ast.core/LowLevelASTProxy");
import def = require("raml-definition-system");
import hl = require("../parser/highLevelAST");
import ll = require("../parser/lowLevelAST");
import hlImpl = require("../parser/highLevelImpl");
import builder = require("../parser/ast.core/builder");

import typeSystem = def.rt;
import nominals = typeSystem.nominalTypes;
import universeHelpers = require("../parser/tools/universeHelpers")
import universes = require("../parser/tools/universe")
import util = require("../util/index")
import _ = require("underscore");


export interface BranchingData{

    branchingOption(branchId:number):number;

    typeMap():TypeMap;
}

export interface TypeMap{

    addType(t:TypeEntry):void;

    removeType(t:TypeEntry):void;

    hasType(t:TypeEntry):boolean;
}

export interface BranchingRegistry{

    nextBranchId(optionsCount:number):number;

    possibleBranches(tm?:TypeMap):BranchingData[];
}

export interface Entry{

    append(te:GeneralTypeEntry,bd:BranchingData):void;
}

export class PropertyEntry implements Entry{

    constructor(protected _original:typeSystem.IPropertyInfo, protected _name:string,
                protected _type:TypeEntry,protected isFacet=false, protected _required?:boolean){

    }

    name():string{
        return this._original ? this._original.name() : this._name;
    }

    append(te:GeneralTypeEntry,bd:BranchingData):void{
        let etp = new GeneralTypeEntry(this._type.original(),[],null,[], [], this._type.name());
        this._type.append(etp,bd);
        let newPropEntry = new PropertyEntry(this._original,this._name,etp,this.isFacet,this.required());
        if(this.isFacet){
            te.addFacet(newPropEntry);
        }
        else {
            te.addProperty(newPropEntry);
        }
    }

    type():TypeEntry{
        return this._type;
    }

    required():boolean{
        if(this._required!=null){
            return this._required;
        }
        return this._original.required();
    }
}


export interface TypeEntry extends Entry{

    name():string;

    original():typeSystem.IParsedType;

    isUnion():boolean;

    isBuiltIn():boolean;

    isExternal():boolean;

    schema():string;

    isIntersection():boolean;

    addSuperType(type:TypeEntry):void;

    superTypes():TypeEntry[];

    clone():TypeEntry;

    possibleBuiltInTypes():string[];

    branchingRegistry(): BranchingRegistry;

    allFacets(): typeSystem.ITypeFacet[];

    isRecursionPoint():boolean;

    examples():typeSystem.IExample[]
}

export class AbstractTypeEntry implements TypeEntry{


    constructor(protected _original:typeSystem.IParsedType,protected _superTypes:TypeEntry[]){}

    protected _branchingRegistry:BranchingRegistry;

    branchingRegistry(): BranchingRegistry {
        return this._branchingRegistry;
    }

    setBranchingRegistry(value: BranchingRegistry) {
        this._branchingRegistry = value;
    }

    name():string{
        return this._original && this._original.name();
    }

    isUnion():boolean{
        return false;
    }

    isBuiltIn():boolean{
        return false;
    }

    isExternal():boolean{
        if(this._original){
            return this._original.isExternal();
        }
        for(let st of this.superTypes()){
            if(st.isExternal()){
                return true;
            }
        }
        return false;
    }

    schema():string{
        if(this._original){
            let et = _.find([this._original].concat(this._original.allSuperTypes()),x=>x.kind()=="external");
            if(et) {
                return (<any>et).schema();
            }
            return null;
        }
        for(let st of this.superTypes()){
            let sch = st.schema();
            if(sch){
                return sch;
            }
        }
        return null;
    }

    isIntersection():boolean{
        return false;
    }

    addSuperType(type:TypeEntry):void{
        this._superTypes = this._superTypes || [];
        this._superTypes.push(type);
    }

    superTypes():TypeEntry[]{
        return this._superTypes;
    }

    original():typeSystem.IParsedType{
        return this._original;
    }

    append(te:GeneralTypeEntry,bd:BranchingData):void{
        // if(!te._original){
        //     te._original = this.original();
        // }
    }

    clone():TypeEntry{
        throw new Error("not implemented");
    }

    possibleBuiltInTypes():string[]{
        throw new Error("not implemented");
    }

    allFacets(){
        if(this._original){
            return this._original.allFacets();
        }
        else{
            let result:typeSystem.ITypeFacet[] = [];
            for(let st of this.superTypes()){
                st.allFacets().forEach(x=>result.push(x));
            }
            return result;
        }
    }

    isRecursionPoint():boolean{
        return false;
    }

    examples():typeSystem.IExample[]{
        return this._original != null ? this._original.examples() : [];
    }
}

export class GeneralTypeEntry extends AbstractTypeEntry{

    protected facets:PropertyEntry[] = [];

    constructor(
        _original:typeSystem.IParsedType,
        _superTypes:TypeEntry[]=[],
        protected _componentType: TypeEntry,
        protected _properties: PropertyEntry[]=[],
        protected _facets: PropertyEntry[]=[],
        protected _name:string){
        super(_original,_superTypes);
    }

    private _isRecursionPoint:boolean;

    private _depth:number;

    setDepth(d:number){
        this._depth = d;
    }

    depth(){
        return this._depth;
    }

    clone(ct?:TypeEntry):GeneralTypeEntry{
        return new GeneralTypeEntry(this._original,[],ct, [], [], this.name());
    }

    possibleBuiltInTypes():string[]{
        let result:string[] = [];
        // if(this.original()&&!this.original().isUnion()) {
        //     let possibleTypes = [this.original()].concat(this.original().allSuperTypes()).filter(x => x.isBuiltin());
        //     for (let o of this.original().allOptions()) {
        //         possibleTypes = possibleTypes.concat([o].concat(o.allSuperTypes()).filter(x => x.isBuiltin()));
        //     }
        //     possibleTypes = _.unique(possibleTypes);
        //     let map:{[key:string]:typeSystem.IParsedType} = {};
        //     possibleTypes.forEach(x=>map[x.name()]=x);
        //     possibleTypes.forEach(x=>{
        //         x.allSuperTypes().forEach(y=>delete map[y.name()]);
        //     });
        //     result = _.unique(Object.keys(map));
        // }
        // else {
            for(let st of this.superTypes()){
                if(!st.isUnion()) {
                    result = result.concat(st.possibleBuiltInTypes());
                }
            }
            let map:{[key:string]:boolean} = {};
            result.forEach(x=>map[x]=true);
            result.forEach(x=>{
                let t = typeSystem.builtInTypes().get(x);
                if(t) {
                    t.allSuperTypes().forEach(y => delete map[y.name()]);
                }
            });
            delete map["unknown"];
            result = Object.keys(map);
       // }
        return result;
    }

    componentType():TypeEntry{
        return this._componentType;
    }

    setComponentType(componentType:TypeEntry){
            this._componentType = componentType;
    }

    properties():PropertyEntry[]{
        return this._properties;
    }

    definedFacets():PropertyEntry[]{
        return this._facets;
    }

    addProperty(propertyEntry:PropertyEntry){
        this._properties.push(propertyEntry);
    }

    addFacet(propertyEntry:PropertyEntry){
        this._facets.push(propertyEntry);
    }

    append(te:GeneralTypeEntry,bd:BranchingData):void{

        if (this._original && this._original.kind() != "union") {
            te._original = this._original;
        }
        if (this.isExternal()) {
            return;
        }
        if(bd.typeMap().hasType(this)&&this.depth()==0){
            te.setIsRecursionPoint();
            return;
        }
        bd.typeMap().addType(this);
        try {
            if (this._componentType) {
                let ct = expandHierarchy(
                    this._componentType, this._componentType.branchingRegistry(), bd.typeMap());
                //if(!te.componentType()) {
                    te.setComponentType(ct);
                // }
                // else{
                //     let cType = new GeneralTypeEntry(null,[],null,[],[],null);
                //     te.componentType().append(cType,null);
                //     ct.append(cType,null);
                //     te.setComponentType(cType);
                // }
            }
            if (this._properties.length > 0) {
                let pMap:{[key:string]:PropertyEntry[]} = {};
                for (let p of this._properties) {
                    let pName = p.name();
                    let pArr = pMap[pName];
                    if(!pArr){
                        pArr = [];
                        pMap[pName] = pArr;
                    }
                    pArr.push(p);
                }
                for (let pName of Object.keys(pMap)) {
                    let pArr = pMap[pName];
                    if(pArr.length==1) {
                        pArr[0].append(te, bd);
                    }
                    else{
                        let pType = new GeneralTypeEntry(null,[],null,[], [], null);
                        let required = false;
                        pArr.forEach(x=>{
                            pType.addSuperType(x.type());
                            required = required || x.required();
                        });
                        let mergedProp = new PropertyEntry(null,pName,pType,false,required);
                        mergedProp.append(te, bd);
                    }
                }
            }
            if (this._facets.length > 0) {
                for (let f of this._facets) {
                    f.append(te, bd);
                }
            }
            for (let st of this.superTypes()) {
                st.append(te, bd);
                te.addSuperType(st);
            }
        }
        finally {
            bd.typeMap().removeType(this);
        }
    }

    name(){
        return this._name || super.name();
    }

    isRecursionPoint():boolean{
        return this._isRecursionPoint;
    }

    setIsRecursionPoint(val:boolean=true){
        this._isRecursionPoint = val;
    }
}

export class BuiltInTypeEntry extends AbstractTypeEntry{

    constructor(protected _original:typeSystem.IParsedType){
        super(_original,[]);
    }

    possibleBuiltInTypes():string[]{
        return [ this._original.name() ];
    }

    isBuiltIn():boolean{
        return true;
    }

    append(te:GeneralTypeEntry,bd:BranchingData):void{
        te.addSuperType(this);
    }

}

export class UnionTypeEntry extends AbstractTypeEntry{

    constructor(
        original:typeSystem.IParsedType,
        protected _options:TypeEntry[],
        protected _branchId:number){
        super(original,[]);
    }

    isUnion():boolean{
        return true;
    }

    branchId():number{
        return this._branchId;
    }

    append(te:GeneralTypeEntry,bd:BranchingData):void{
        let optionId = bd.branchingOption(this._branchId);
        let option = this._options[optionId];
        option.append(te,bd);
    }

    clone():TypeEntry{
        throw new Error("Not implemented");
    }

    possibleBuiltInTypes():string[]{
        let result:string[] = [];
        this._options.forEach(x=>result=result.concat(x.possibleBuiltInTypes()));
        result = _.unique(result);
        return result;
    }

    options():TypeEntry[]{
        return this._options;
    }
}

export class IntersectionTypeEntry extends AbstractTypeEntry{

    constructor(original:typeSystem.IParsedType, protected options:TypeEntry[]){
        super(original,[]);
    }

    isIntersection():boolean{
        return true;
    }

    append(te:TypeEntry,bd:BranchingData):void{
        throw new Error("not implemented");
    }

    clone():TypeEntry{
        throw new Error("Not implemented");
    }

    possibleBuiltInTypes():string[]{
        let possibleTypes = this.options.map(x=>x.possibleBuiltInTypes());
        let result = possibleTypes[0];
        for(let i = 1 ; i < possibleTypes.length ; i++){
            result = _.intersection(result,possibleTypes[i]);
        }
        return result;
    }
}

function createHierarchyEntry(t:typeSystem.IParsedType,
                              typeExpansionRecursionDepth:number,
                              occured:{[key:string]:TypeEntry}={},
                              branchingRegistry?:BranchingRegistry):TypeEntry{

    let isNewTree = false;
    if(!branchingRegistry){
        isNewTree = true;
        branchingRegistry = new BasicBranchingRegistry();
    }

    if(t.isBuiltin()){
        let result = occured[t.name()];
        if(!result){
            result = new BuiltInTypeEntry(t);
            occured[t.name()] = result;
        }
        return result;
    }
    let d = 0;
    if(t.name() && occured[t.name()]){
        if(typeExpansionRecursionDepth==0) {
            return occured[t.name()];
        }
        else{
            d = typeExpansionRecursionDepth;
            typeExpansionRecursionDepth--;
        }
    }
    let result = new GeneralTypeEntry(t, [],null,[], [], t.name());
    result.setDepth(d);
    if(!occured[t.name()]) {
        occured[t.name()] = result;
    }
    let superTypes = t.allSuperTypes().filter(x=>!x.isUnion());
    let superTypeEntries:TypeEntry[] = [];
    for(let st of superTypes){
        if(st.isBuiltin()){
            let ste = createHierarchyEntry(
                st,typeExpansionRecursionDepth,occured,branchingRegistry);
            superTypeEntries.push(ste);
        }
    }
    let options = t.allOptions();
    let properties = t.properties();
    if(options.length>1){
        let optionEntries:TypeEntry[] = [];
        for(let o of options){
            optionEntries.push(createHierarchyEntry(
                o,typeExpansionRecursionDepth,occured,branchingRegistry));
        }
        let branchId = branchingRegistry.nextBranchId(optionEntries.length);
        let unionSuperType = new UnionTypeEntry(t, optionEntries, branchId);
        superTypeEntries.push(unionSuperType);
    }
    if(t.isArray()){
        let ct = t.componentType();
        if(ct) {
            let componentTypeEntry = createHierarchyEntry(
                ct,typeExpansionRecursionDepth, occured);
            result.setComponentType(componentTypeEntry);
        }
    }
    let propertyEntries:PropertyEntry[] = [];
    if(properties.length>0){
        for(let p of properties){
            let pt = p.range();
            let pte = createHierarchyEntry(
                pt,typeExpansionRecursionDepth,occured,branchingRegistry);
            let pe = new PropertyEntry(p,null,pte);
            propertyEntries.push(pe);
        }
    }
    for(let st of superTypeEntries) {
        result.addSuperType(st);
    }
    for(let pe of propertyEntries){
        result.addProperty(pe);
    }
    let definedFacets = t.allDefinedFacets();
    if(definedFacets.length>0){
        for(let p of definedFacets){
            let pt = p.range();
            let pte = createHierarchyEntry(
                pt,typeExpansionRecursionDepth,occured,branchingRegistry);
            let fe = new PropertyEntry(p,null,pte,true);
            result.addFacet(fe);
        }
    }
    if(isNewTree){
        result.setBranchingRegistry(branchingRegistry);
    }
    return result;
}

function expandHierarchy(e:TypeEntry,reg:BranchingRegistry,typeMap?:TypeMap):TypeEntry{

    if(!reg){
        return e;
    }

    let entries:TypeEntry[] = [];
    for(let bd of reg.possibleBranches(typeMap)){
        let branchEntry = new GeneralTypeEntry(null,[],null,[], [], e.name());
        e.append(branchEntry,bd);
        entries.push(branchEntry);
    }
    if(entries.length==1){
        return entries[0];
    }
    let result = new UnionTypeEntry(e.original(),entries,-1);
    return result;
}

class BasicTypeMap implements TypeMap{

    private map:{[key:string]:TypeEntry} = {};

    addType(t:TypeEntry):void{
        let n = t.name();
        if(n){
            this.map[n] = t;
        }
    }

    removeType(t:TypeEntry):void{
        let n = t.name();
        if(n){
            delete this.map[n];
        }
    }

    hasType(t:TypeEntry):boolean{
        let n = t.name();
        return this.map[n] !== undefined;
    }
}

class BasicBranchingData implements BranchingData{

    constructor(private arr:number[],private _typeMap:TypeMap = new BasicTypeMap()){}

    branchingOption(branchId:number){
        if(branchId>this.arr.length-1){
            throw new Error("Branch index exceeds total branches count");
        }
        return this.arr[branchId];
    }

    typeMap(){
        return this._typeMap;
    }
}


class BasicBranchingRegistry implements BranchingRegistry{

    private arr:number[] = [];

    nextBranchId(optionsCount:number):number{
        let result = this.arr.length;
        this.arr.push(optionsCount);
        return result;
    }

    possibleBranches(typeMap:TypeMap):BranchingData[]{
        let steps:number[] = [];
        let ranks:number[] = [];
        let count = 1;
        let rank = 1;
        let l = this.arr.length;
        for(let i = 0 ; i < l ; i++){
            steps.push(count);
            ranks.push(rank);
            count *= this.arr[i];
            rank *= this.arr[l-1-i];
        }
        ranks = ranks.reverse();
        let sequences:number[][]= [];
        for(let i = 0 ; i < count ; i++){
            sequences.push([]);
        }
        // 2,3,3
        // r l c ------------------
        // 9 2 1 000000000111111111
        // 3 3 2 000111222000111222
        // 1 3 6 123123123123123123
        for(let i = 0 ; i < l ; i++){
            let ind = 0;
            let currentOptionsCount = this.arr[i];
            for(let j0 = 0 ; j0 < steps[i] ; j0++ ){
                for(let j1 = 0 ; j1 < currentOptionsCount ; j1++){
                    for(let j2 = 0 ; j2 < ranks[i] ; j2++){
                        sequences[ind++].push(j1);
                    }
                }
            }
        }
        let result = sequences.map(x=>new BasicBranchingData(x,typeMap));
        return result;
    }
}

export function dump(te:TypeEntry):any{

    let result:any = {};
    let name = te.name();
    if(name){
        result.name = name;
        if(te.isRecursionPoint()){
            return {
                type: [ name ]
            };
        }
    }
    if(te.isBuiltIn()) {
        result = {
            type: [ name ]
        }
    }
    else if(te.isExternal()) {
        let sch = te.schema();
        if(sch) {
            result.type = [ sch ];
        }
    }
    else if(te.isUnion()){
        let ute = <UnionTypeEntry>te;
        let options = ute.options();
        if(options.length>0){
            let anyOf:any[] = [];
            result.anyOf = anyOf;
            for(let o of options){
                let dumpedOption = dump(o);
                anyOf.push(dumpedOption);
            }
        }
    }
    else {
        let gte = <GeneralTypeEntry>te;
        let type = te.possibleBuiltInTypes();
        if(type.length>0) {
            result.type = type;
        }
        let properties = gte.properties();
        if (properties && properties.length > 0) {
            let props: any[] = [];
            result.properties = props;
            for (let p of properties) {
                let dumpedPropertyType = dump(p.type());
                dumpedPropertyType.name = p.name();
                dumpedPropertyType.required = p.required();
                props.push(dumpedPropertyType);
            }
        }
        let facets = gte.definedFacets();
        if (facets && facets.length > 0) {
            let facetArr: any[] = [];
            result.facets = facetArr;
            for (let f of facets) {
                let dumpedFacetType = dump(f.type());
                dumpedFacetType.name = f.name();
                facetArr.push(dumpedFacetType);
            }
        }
        let ct = gte.componentType();
        if(ct){
            let dumpedComponentType = dump(ct);
            result.items = dumpedComponentType;
        }
        dumpFacets(te, result);
    }
    let examples = te.examples();
    if(examples.length > 0){
        let simplified:any[] = [];
        let examplesArr:any[] = [];
        result.examples = examplesArr;
        result.simplifiedExamples = simplified;
        for(let e of examples){
            let val = e.value();
            let needStringify = false;
            if(Array.isArray(val)){
                for(let c of val){
                    if(Array.isArray(c) || (typeof val == "object")){
                        needStringify = true;
                        break;
                    }
                }
            }
            else if(typeof val == "object"){
                needStringify = true;
            }
            let simpleValue = needStringify ? JSON.stringify(val) : val;
            simplified.push(simpleValue);
            let eObj:any = {
                strict: e.strict(),
                value: val
            };
            if(e.name()){
                eObj.name = e.name();
            }
            let annotations = e.annotations();
            let aArr = dumpAnnotations(annotations, eObj);
            examplesArr.push(eObj);
        }
    }
    let annotations = te.original() && te.original().annotations();
    dumpAnnotations(annotations,result);
    return result;
}

function dumpAnnotations(annotations:typeSystem.IAnnotation[], obj:any) {
    if (annotations && annotations.length > 0) {
        let aArr: any[] = [];
        obj.annotations = aArr;
        annotations.forEach(x => {
            aArr.push({
                name: x.name(),
                value: x.value()
            })
        })
    }
};

export function dumpFacets(te: TypeEntry, result: any) {
    let customFacets = te.original() && te.original().allCustomFacets();
    if(customFacets && customFacets.length>0) {
        let facetsObj:any = {};
        result.fixedFacets = facetsObj;
        customFacets.forEach(x => {
            try {
                let val = x.value();
                if (typeof val == 'object') {
                    JSON.stringify(val);
                }
                facetsObj[x.facetName()] = val;
            }
            catch (e) {
                console.log('Error while dumping ' + x.facetName());
                console.log(e);
            }
        });
    }
    let builtInTypes = te.possibleBuiltInTypes();
    let types:def.ITypeDefinition[] = [];
    for(let tn of builtInTypes){
        let t = typeSystem.builtInTypes().get(tn);
        if(t) {
            let ts = builder.mapType(t);
            ts.forEach(x => types.push(x));
        }
    }
    let propMap:any = {};
    types.forEach(x=>{
        x.properties().forEach(p=>propMap[p.nameId()]=true);
    });
    let facetsMap:{[key:string]:typeSystem.ITypeFacet[]} = {};
    for (let f of te.allFacets()) {
        let fn = f.facetName();
        if (propMap[fn]) {
            let fArr = facetsMap[fn];
            if (!fArr) {
                fArr = [];
                facetsMap[fn] = fArr;
            }
            fArr.push(f);
        }
    }
    for (let fn of Object.keys(facetsMap)) {
        let fArr = facetsMap[fn];
        let val: any;
        if (fArr.length == 1) {
            let val = fArr[0].value();
        }
        else {
            val = mergeFacetValues(fArr);
        }
        if (typeof val == "string" || typeof val == "number" || typeof val == "boolean") {
            result[fn] = val;
        }
    }
}


export function dumpType(t:typeSystem.IParsedType,typeExpansionRecursionDepth=0){
    let he = createHierarchyEntry(t,typeExpansionRecursionDepth);
    let ee = expandHierarchy(he,he.branchingRegistry());
    let result = dump(ee);
    return result;
}


function mergeFacetValues(arr:typeSystem.ITypeFacet[]):any{
    if(arr.length==0){
        return null;
    }
    let c : typeSystem.IConstraint;
    for(let f of arr){
        if(!c){
            if(!f.isConstraint()){
                return f.value();
            }
            c = <typeSystem.IConstraint>f;
            continue;
        }
        if(!f.isConstraint()){
            continue;
        }
        c = c.composeWith(<typeSystem.IConstraint>f);
    }
    if(!c){
        return arr[0].value();
    }
    return c.value();

}