import def = require("raml-definition-system");
import builder = require("../parser/ast.core/builder");
import typeSystem = def.rt;
import tsInterfaces = typeSystem.tsInterfaces;
import _ = require("underscore");
import ll = require("../parser/lowLevelAST");
import hlImpl = require("../parser/highLevelImpl");

export type IPropertyInfo = tsInterfaces.IPropertyInfo;
export type IParsedType = tsInterfaces.IParsedType;
export type ITypeFacet = tsInterfaces.ITypeFacet;
export type IExample = tsInterfaces.IExample;
export type IAnnotation = tsInterfaces.IAnnotation;
export type IConstraint = tsInterfaces.IConstraint;
export type ElementSourceInfo = tsInterfaces.ElementSourceInfo;

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

    constructor(protected _original:IPropertyInfo,
                protected _name:string,
                protected _type:TypeEntry,
                protected isFacet=false,
                protected _required?:boolean){

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

    original():IParsedType;

    isUnion():boolean;

    isBuiltIn():boolean;

    isExternal():boolean;

    schema():string;

    isIntersection():boolean;

    addSuperType(type:TypeEntry):void;

    superTypes():TypeEntry[];

    clone():TypeEntry;

    possibleBuiltInTypes(occured:{[key:string]:boolean}):string[];

    branchingRegistry(): BranchingRegistry;

    allFacets():ITypeFacet[];

    declaredFacets():ITypeFacet[];

    isRecursionPoint():boolean;

    examples():IExample[]

    meta():ITypeFacet[];

    schemaPath():string;

    id():string;
}

export class AbstractTypeEntry implements TypeEntry{


    constructor(protected _original:IParsedType,protected _superTypes:TypeEntry[]){
        this._id = ""+(globalId++);
    }

    protected _branchingRegistry:BranchingRegistry;

    private _id:string;

    id(){
        return this._id;
    }

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
            let et = _.find([this._original].concat(this._original.allSuperTypes()),x=>
                (<IParsedType>x).kind()=="external");
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

    original():IParsedType{
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

    declaredFacets() {
        let result:ITypeFacet[] = [];
        if(this._original){
            result = this._original.declaredFacets();
            result = result.filter(x=>x.kind()!=tsInterfaces.MetaInformationKind.Example
                && x.kind()!=tsInterfaces.MetaInformationKind.Examples);
        }

        return result;
    }

    allFacets(){
        let meta = this.meta();
        let result = meta.filter(x=>x.kind()!=tsInterfaces.MetaInformationKind.FacetDeclaration);
        return result;
    }

    isRecursionPoint():boolean{
        return false;
    }

    examples():IExample[]{
        if(this._original){
            const examples = <IExample[]>this._original.examples();
            return examples;
        }
        return [];
    }

    meta(){
        let result:ITypeFacet[] = [];
        if(this._original){
            result = this._original.allFacets();
        }
        else{
            for(let st of this.superTypes()){
                st.allFacets().forEach(x=>result.push(x));
            }
        }
        result = result.filter(x=>x.kind()!=tsInterfaces.MetaInformationKind.Example
                                && x.kind()!=tsInterfaces.MetaInformationKind.Examples);
        return result;
    }

    schemaPath():string{
        let schPath = _.find(this.meta(),x=>x.kind()==tsInterfaces.MetaInformationKind.SchemaPath);
        return schPath && schPath.value();
    }

    sourceMap():ElementSourceInfo{
        let sourceMap = _.find(this.declaredFacets(),x=>x.kind()==tsInterfaces.MetaInformationKind.SchemaPath);
        if(sourceMap){
            return sourceMap.value();
        }
        return null;
    }
}

var globalId = 0;

export class GeneralTypeEntry extends AbstractTypeEntry{

    protected facets:PropertyEntry[] = [];

    constructor(
        _original:IParsedType,
        _superTypes:TypeEntry[]=[],
        protected _componentType: TypeEntry,
        protected _properties: PropertyEntry[]=[],
        protected _facets: PropertyEntry[]=[],
        protected _name:string){
        super(_original,_superTypes);
    }

    private _isRecursionPoint:boolean;

    private _depth:number;

    private metadataSource:TypeEntry;

    setDepth(d:number){
        this._depth = d;
    }

    depth(){
        return this._depth;
    }

    clone(ct?:TypeEntry):GeneralTypeEntry{
        return new GeneralTypeEntry(this._original,[],ct, [], [], this.name());
    }

    possibleBuiltInTypes(occured:{[key:string]:boolean}={}):string[]{
        if(this.name()){
            if(occured[this.name()]){
                return [];
            }
            occured[this.name()] = true;
        }
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
                    result = result.concat(st.possibleBuiltInTypes(occured));
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
        if(bd.typeMap().hasType(this)&&this.depth()==0){//isRecursionPoint()){
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

    constructor(protected _original:IParsedType){
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
        original:IParsedType,
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

    possibleBuiltInTypes(occured:{[key:string]:boolean}={}):string[]{
        let result:string[] = [];
        if(this.name()){
            if(occured[this.name()]){
                return [];
            }
            occured[this.name()] = true;
        }
        this._options.forEach(x=>result=result.concat(x.possibleBuiltInTypes(occured)));
        result = _.unique(result);
        return result;
    }

    options():TypeEntry[]{
        return this._options;
    }
}

export class IntersectionTypeEntry extends AbstractTypeEntry{

    constructor(original:IParsedType, protected options:TypeEntry[]){
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

    possibleBuiltInTypes(occured:{[key:string]:boolean}={}):string[]{
        if(this.name()){
            if(occured[this.name()]){
                return [];
            }
            occured[this.name()] = true;
        }
        let possibleTypes = this.options.map(x=>x.possibleBuiltInTypes(occured));
        let result = possibleTypes[0];
        for(let i = 1 ; i < possibleTypes.length ; i++){
            result = _.intersection(result,possibleTypes[i]);
        }
        return result;
    }
}

function createHierarchyEntry(t:IParsedType,
                              typeExpansionRecursionDepth:number,
                              isAnnotationType=false,
                              occured:{[key:string]:TypeEntry}={},
                              branchingRegistry?:BranchingRegistry,
                              path?:string):TypeEntry{

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
        if(typeExpansionRecursionDepth<=0) {
            return occured[t.name()];
        }
        else{
            d = typeExpansionRecursionDepth;
            typeExpansionRecursionDepth--;
        }
    }
    if(t.isUnion()&&t.superTypes().length==0){
        let options = t.options();
        let optionEntries:TypeEntry[] = [];
        for(let o of options){
            optionEntries.push(createHierarchyEntry(
                o,typeExpansionRecursionDepth,false,occured,branchingRegistry));
        }
        let branchId = branchingRegistry.nextBranchId(optionEntries.length);
        let unionSuperType = new UnionTypeEntry(t, optionEntries, branchId);
        return unionSuperType;
    }
    let result = new GeneralTypeEntry(t, [],null,[], [], t.name());
    result.setDepth(d);
    if(t.name()!=null && !occured[t.name()]) {
        occured[t.name()] = result;
    }


    let superTypeEntries:TypeEntry[] = [];
    if(typeExpansionRecursionDepth==-1){
        const allSuperTypes:IParsedType[] = t.superTypes();
        let superTypes = allSuperTypes.filter(x=>!x.isUnion());
        for (let st of superTypes) {
            let ste = createHierarchyEntry(
                st, typeExpansionRecursionDepth, false,occured, branchingRegistry);
            superTypeEntries.push(ste);
        }
    }
    else {
        const allSuperTypes:IParsedType[] = t.allSuperTypes();
        let superTypes = allSuperTypes.filter(x=>!x.isUnion());
        for (let st of superTypes) {
            if (st.isBuiltin()) {
                let ste = createHierarchyEntry(
                    st, typeExpansionRecursionDepth, false,occured, branchingRegistry);
                superTypeEntries.push(ste);
            }
        }
    }
    let options = t.allOptions();
    let properties = typeExpansionRecursionDepth>=0 ? t.properties() : t.declaredProperties();
    if(options.length>1){
        let optionEntries:TypeEntry[] = [];
        for(let o of options){
            optionEntries.push(createHierarchyEntry(
                o,typeExpansionRecursionDepth,false,occured,branchingRegistry));
        }
        let branchId = branchingRegistry.nextBranchId(optionEntries.length);
        let unionSuperType = new UnionTypeEntry(t, optionEntries, branchId);
        superTypeEntries.push(unionSuperType);
    }
    if(t.isArray()){
        let ct = t.componentType();
        if(ct) {
            let componentTypeEntry = createHierarchyEntry(
                ct,typeExpansionRecursionDepth, false,occured);
            result.setComponentType(componentTypeEntry);
        }
    }
    let propertyEntries:PropertyEntry[] = [];
    if(properties.length>0){
        for(let p of properties){
            let pt = p.range();
            let owner = p.declaredAt();
            let pte:TypeEntry;
            let d = typeExpansionRecursionDepth;
            if(owner.name() && (!t.name()||owner.name() != t.name()) && occured[owner.name()]){
                if(typeExpansionRecursionDepth<=0) {
                    pte = occured[owner.name()];
                }
                else{
                    d--;
                }
            }
            if(!pte) {
                pte = createHierarchyEntry(
                    pt, d, false, occured, branchingRegistry);
            }
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
    let definedFacets = typeExpansionRecursionDepth>=0 ? t.allDefinedFacets() : t.definedFacets();
    if(definedFacets.length>0){
        for(let p of definedFacets){
            let pt = p.range();
            let owner = p.declaredAt();
            let pte:TypeEntry;
            let d = typeExpansionRecursionDepth;
            if(owner.name() && (!t.name()||owner.name() != t.name()) && occured[owner.name()]){
                if(typeExpansionRecursionDepth<=0) {
                    pte = occured[owner.name()];
                }
                else{
                    d--;
                }
            }
            if(!pte) {
                pte = createHierarchyEntry(
                    pt, d, false, occured, branchingRegistry);
            }
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

    let entries:GeneralTypeEntry[] = [];
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
        let n = t.id();
        if(n){
            this.map[n] = t;
        }
    }

    removeType(t:TypeEntry):void{
        let n = t.id();
        if(n){
            delete this.map[n];
        }
    }

    hasType(t:TypeEntry):boolean{
        let n = t.id();
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

let appendSourceFromExtras = function (result: any, te: TypeEntry) {
    if (!result.sourceMap) {
        let src = te.original().getExtra("SOURCE");
        if (src) {
            let llSrc: ll.ILowLevelASTNode;
            if (hlImpl.LowLevelWrapperForTypeSystem.isInstance(src)) {
                llSrc = src.node();
            }
            else if (hlImpl.ASTNodeImpl.isInstance(src)) {
                llSrc = src.lowLevel();
            }
            else if(src.obj && src.obj.sourceMap){
                result.sourceMap = src.obj.sourceMap;
            }
            if (llSrc) {
                result.sourceMap = {
                    path: llSrc.unit().path()
                };
            }
        }
    }
};

export function dump(te:TypeEntry,expand:boolean,displayName?:string,defaultSource?:any):any{

    let result:any = {};
    let name = te.name();
    if(name){
        result.name = name;
        if(te.isRecursionPoint()){
            result = {
                type: [ "any" ]
            };
            if(displayName!=null){
                result.displayName = displayName;
            }
            appendSourceFromExtras(result, te);
            return result;
        }
    }
    const superTypes = te.superTypes();
    if(te.isBuiltIn()) {
        result = {
            type: [ name ],
            typePropertyKind: "TYPE_EXPRESSION"
        }
    }
    else if(te.isExternal()) {
        if(!expand && superTypes[0].name() && te.original().allSuperTypes().length>3){
            result.type = [ superTypes[0].name() ];
        }
        else {
            let sch = te.schema();
            if (sch) {
                sch = sch.trim();
                result.type = [sch];
                if(te.schemaPath()){
                    result.schemaPath = te.schemaPath();
                }
                var canBeJson = (sch[0] === "{" && sch[sch.length - 1] === "}");
                var canBeXml= (sch[0] === "<" && sch[sch.length - 1] === ">");

                if (canBeJson) {
                    result.typePropertyKind = "JSON";
                } else if (canBeXml) {
                    result.typePropertyKind = "XML";
                }
            }
        }
    }
    else if(te.isUnion()){
        result.typePropertyKind = "TYPE_EXPRESSION";
        let ute = <UnionTypeEntry>te;
        let options = ute.options();
        if(options.length>0){
            result.type = [ "union" ];
            let anyOf:any[] = [];
            result.anyOf = anyOf;
            for(let o of options){
                if(!expand && o.name()){
                    anyOf.push(o.name());
                }
                else {
                    let dumpedOption = dump(o, expand);
                    appendSourceFromExtras(dumpedOption, ute);
                    anyOf.push(dumpedOption);
                }
            }
        }
    }
    else {
        if(superTypes.length&&superTypes[0].name()){
            result.typePropertyKind = "TYPE_EXPRESSION";
        }
        else{
            result.typePropertyKind = "INPLACE";
        }
        let gte = <GeneralTypeEntry>te;
        if(expand) {
            let type = gte.possibleBuiltInTypes();
            if (type.length > 0) {
                result.type = type;
            }
        }
        else{
            let type: any[] = [];
            for(let st of superTypes){
                if(st.name()){
                    type.push(st.name());
                }
                else{
                    const dumped = dump(st,expand);
                    dumped.name = "type";
                    type.push(dumped);
                }
            }
            result.type = type;
        }
        let properties = gte.properties();
        if (properties && properties.length > 0) {
            let props: any[] = [];
            result.properties = props;
            for (let p of properties) {
                let dumpedPropertyType = dump(p.type(),expand,p.name());
                appendSourceFromExtras(dumpedPropertyType, gte);
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
                let dumpedFacetType = dump(f.type(),expand,f.name());
                appendSourceFromExtras(dumpedFacetType, gte);
                dumpedFacetType.name = f.name();
                facetArr.push(dumpedFacetType);
            }
        }
        let ct = gte.componentType();
        if(ct){
            if(!expand && ct.name()){
                result.items = [ ct.name() ];
            }
            else {
                let dumpedComponentType = dump(ct, expand);
                appendSourceFromExtras(dumpedComponentType, gte);
                if (!ct.isUnion()&&!dumpedComponentType.name) {
                    dumpedComponentType.name = "items";
                }
                result.items = [dumpedComponentType];
            }
        }
        dumpFacets(te, result, expand);
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
            if(e.displayName()!=null){
                eObj.displayName = e.displayName();
            }
            if(e.description()){
                eObj.description = e.description();
            }
            let annotations = e.annotations();
            let aArr = dumpAnnotations(annotations, eObj);
            examplesArr.push(eObj);
        }
    }
    let annotations = te.original() && te.original().annotations();
    dumpAnnotations(annotations,result);
    dumpMeta(te,result, expand);
    appendSourceFromExtras(result, te);
    if(result.displayName==null){
        result.displayName = displayName||result.name;
    }
    return result;
}

function dumpAnnotations(
    annotations:IAnnotation[],
    obj:any) {
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

export function dumpFacets(te: TypeEntry, result: any, expand:boolean) {
    let customFacets:ITypeFacet[];
    if(te.original()){
        if(expand){
            customFacets = te.original().allCustomFacets();
        }
        else{
            customFacets = te.original().customFacets();
        }
    }
    if(customFacets && customFacets.length>0) {
        let facetsObj:{ name: string, value: any}[] = [];
        result.fixedFacets = facetsObj;
        customFacets.forEach(x => {
            try {
                let val = x.value();
                if (typeof val == 'object') {
                    JSON.stringify(val);
                }
                facetsObj.push({
                    name: x.facetName(),
                    value: val
                });
            }
            catch (e) {
                console.log('Error while dumping ' + x.facetName());
                console.log(e);
            }
        });
    }
    let builtInTypes = te.possibleBuiltInTypes({});
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
    let facetsMap:{[key:string]:ITypeFacet[]} = {};
    const facets = expand ? te.allFacets() : te.declaredFacets();
    for (let f of facets) {
        if(f.kind()==tsInterfaces.MetaInformationKind.DiscriminatorValue){
            if(!(<any>f).isStrict()){
                continue;
            }
        }
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
            val = fArr[0].value();
        }
        else {
            val = mergeFacetValues(fArr);
        }
        if (typeof val == "string" || typeof val == "number" || typeof val == "boolean") {
            result[fn] = val;
        }
    }
}


export function dumpType(t:IParsedType,typeExpansionRecursionDepth=0,isAnnotationType=false){
    let he = createHierarchyEntry(t,typeExpansionRecursionDepth,isAnnotationType);
    const expand = typeExpansionRecursionDepth>=0;
    if(expand) {
        he = expandHierarchy(he, he.branchingRegistry());
    }
    let result = dump(he,expand);
    return result;
}


function mergeFacetValues(arr:ITypeFacet[]):any{
    if(arr.length==0){
        return null;
    }
    let c : IConstraint;
    for(let f of arr){
        if(!c){
            if(!f.isConstraint()){
                return f.value();
            }
            c = <IConstraint>f;
            continue;
        }
        if(!f.isConstraint()){
            continue;
        }
        c = c.composeWith(<IConstraint>f);
    }
    if(!c){
        return arr[0].value();
    }
    return c.value();

}

function dumpMeta(te:TypeEntry,result:any,expand:boolean){

    const meta = expand ? te.meta() : te.declaredFacets();
    for(let m of meta){
        let name = m.facetName();
        if (MetaNamesProvider.getInstance().hasProperty(name)) {
            if (!result.hasOwnProperty(name)) {
                result[name] = m.value();
            }
        }
        else if(name=="closed"){
            result["additionalProperties"] = m.value();
        }
    }
}

class MetaNamesProvider{

    private static instance:MetaNamesProvider = new MetaNamesProvider();

    public static getInstance():MetaNamesProvider{
        if(!MetaNamesProvider.instance){
            MetaNamesProvider.instance = new MetaNamesProvider();
        }
        return MetaNamesProvider.instance;
    }

    constructor(){
        this.init();
    }

    private map:{[key:string]:boolean} = {};

    private init(){
        let types = [
            def.getUniverse("RAML10").type(def.universesInfo.Universe10.TypeDeclaration.name),
            def.getUniverse("RAML10").type(def.universesInfo.Universe10.StringTypeDeclaration.name),
            def.getUniverse("RAML10").type(def.universesInfo.Universe10.FileTypeDeclaration.name)
        ];
        for(let t of types) {
            for (let p of t.properties()) {
                if (p.nameId() != def.universesInfo.Universe10.TypeDeclaration.properties.schema.name) {
                    this.map[p.nameId()] = true;
                }
            }
        }
        this.map["sourceMap"] = true;
        this.map["__METADATA__"] = true;
    }

    public hasProperty(n:string):boolean{
        return this.map.hasOwnProperty(n);
    }
}