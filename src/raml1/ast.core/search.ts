/// <reference path="../../../typings/main.d.ts" />

import defs=require("raml-definition-system")
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")
import _=require("underscore")

import def=require( "raml-definition-system");
// import high=require("../highLevelAST");
import hlimpl=require("../highLevelImpl")
import universes=require("../tools/universe")
import ramlServices=def
import path=require("path")
import nominalTypes=defs.rt.nominalTypes;
export type ITypeDefinition=hl.ITypeDefinition


export var declRoot = function (h:hl.IHighLevelNode):hl.IHighLevelNode {
    var declRoot = h;
    while (true) {
        if (declRoot.definition().key()==universes.Universe10.Library) {
            break;
        }
        var np = declRoot.parent();
        if (!np) {
            break;
        }
        declRoot=np;
    }
    return declRoot;

};
export function globalDeclarations(h:hl.IHighLevelNode):hl.IHighLevelNode[]{

    var decl = declRoot(h);
    return findDeclarations(decl);

}
function mark(h:hl.IHighLevelNode,rs:hl.IHighLevelNode[]){
    var n:any=h.lowLevel();
    n=n._node?n._node:n;
    if (n['mark']){
        return rs;
    }
    n['mark']=rs;
    return null;
}

function unmark(h:hl.IHighLevelNode){
    var n:any=h.lowLevel();
    n=n._node?n._node:n;
    delete n['mark'];
}
export function findDeclarations(h:hl.IHighLevelNode):hl.IHighLevelNode[]{
    var rs:hl.IHighLevelNode[]=[];
    var q=mark(h,rs);
    if (q){
        //throw new Error()
        //return q;
    }
    try {
        h.elements().forEach(x=> {
            if (x.definition().key()== universes.Universe10.UsesDeclaration) {
                var mm=x.attr("value");
                var unit=h.root().lowLevel().unit().resolve(mm.value());
                if (unit!=null) {
                    unit.highLevel().children().forEach(x=> {
                        if (x.isElement()) {
                            rs.push(x.asElement());
                        }
                    })
                }
            }
            else {
                rs.push(x);
            }
        });
        return rs;
    }finally{
        unmark(h)
    }
}
function getIndent2(offset:number,text:string):string{
    var spaces="";
    for (var i=offset-1;i>=0;i--){
        var c=text.charAt(i);
        if (c==' '||c=='\t'){
            if (spaces){
                spaces+=c;
            }
            else{
                spaces=c;
            }
        }
        else if (c=='\r'||c=='\n'){
            return spaces;
        }

    }
}
function deepFindNode(n:hl.IParseResult,offset:number,end:number, goToOtherUnits=true):hl.IParseResult{
    if (n==null){
        return null;
    }
    if (n.lowLevel()) {
        //var node:ASTNode=<ASTNode>n;
        if (n.lowLevel().start() <= offset && n.lowLevel().end() >= end) {
            if (n instanceof  hlimpl.ASTNodeImpl){
                var hn=<hlimpl.ASTNodeImpl>n;
                var all= goToOtherUnits ? hn.children() : hn.directChildren();
                for(var i=0;i<all.length;i++){

                    if (!goToOtherUnits && all[i].lowLevel().unit() != n.lowLevel().unit()) {
                        continue;
                    }

                    var node=deepFindNode(all[i],offset,end, goToOtherUnits);
                    if (node){
                        return node;
                    }
                }
                return n;
            }
            else if (n instanceof  hlimpl.ASTPropImpl){
                var attr=<hlimpl.ASTPropImpl>n;
                if (!attr.property().isKey()) {
                    var vl = attr.value();
                    if (vl instanceof hlimpl.StructuredValue) {
                        var st = <hlimpl.StructuredValue>vl;
                        var hl = st.toHighLevel2();
                        if (hl) {
                            if (!goToOtherUnits && hl.lowLevel().unit() != n.lowLevel().unit()) {
                                return null;
                            }
                        }
                        var node = deepFindNode(hl, offset, end, goToOtherUnits);
                        if (node) {
                            return node;
                        }

                    }
                    return attr;
                }
                return null;
            }
            return null;
        }
    }
    return null;
}


function getValueAt(text:string,offset:number):string{
    var sp=-1;
    for (var i=offset-1;i>=0;i--){
        var c=text.charAt(i);
        if (c=='\r'||c=='\n'||c==' '||c=='\t'||c=='"'||c=='\''||c==':'){
            sp=i+1;
            break;
        }
    }
    var ep=-1;
    for (var i=offset;i<text.length;i++){
        var c=text.charAt(i);
        if (c=='\r'||c=='\n'||c==' '||c=='\t'||c=='"'||c=='\''||c==':'){
            ep=i;
            break;
        }
    }
    if (sp!=-1&&ep!=-1){
        return text.substring(sp,ep);
    }
    return "";
}
export function extractName(cleaned:string,offset:number):string{
    var txt="";
    for (var i=offset;i>=0;i--){
        var c=cleaned[i];
        if (c==' '||c=='\r'||c=='\n'||c=='|'||c=='['||c==']'||c==':'||c=='('||c==')'){
            break;
        }
        txt=c+txt;
    }
    for (var i=offset+1;i<cleaned.length;i++){
        var c=cleaned[i];
        if (c==' '||c=='\r'||c=='\n'||c=='|'||c=='['||c==']'||c==':'||c=='('||c==')'){
            break;
        }
        txt=txt+c;
    }
    return txt;
}
var searchInTheValue = function (offset:number,content: string,attr:hl.IAttribute, hlnode:hl.IHighLevelNode,p:hl.IProperty=attr.property()):hl.IParseResult {
    var targets = referenceTargets(<def.Property>p,hlnode);
    var txt=extractName(content,offset);
    var t:hl.IHighLevelNode = _.find(targets, x=>hlimpl.qName(x, hlnode) == txt)
    if (t) {
        //TODO EXTRACT COMMON OPEN NODE FUNC
        return t;
        //ed.setSelectedBufferRange();
    }
    if (p instanceof defs.UserDefinedProp){
        var up=p;
        return (<defs.UserDefinedProp>up)._node;
    }
    return null;
};
export interface FindUsagesResult{
    node:hl.IHighLevelNode
    results:hl.IParseResult[]
}
export function findUsages(unit:ll.ICompilationUnit, offset:number):FindUsagesResult{
    var decl=findDeclaration(unit,offset);
    if (decl){
        if (decl instanceof hlimpl.ASTNodeImpl){
            var hnode=<hlimpl.ASTNodeImpl>decl;
            return {node:hnode,results:hnode.findReferences()};
        }
        if (decl instanceof hlimpl.ASTPropImpl){
            //var prop=<hlimpl.ASTPropImpl>decl;
            //return {node:prop,results:prop.findReferences()};
        }
    }
    var node = deepFindNode(hlimpl.fromUnit(unit), offset,offset, false);
    if (node instanceof hlimpl.ASTNodeImpl){
        return {node:<hlimpl.ASTNodeImpl>node,results:(<hlimpl.ASTNodeImpl>node).findReferences()};
    }
    if (node instanceof hlimpl.ASTPropImpl){
        var prop=<hlimpl.ASTPropImpl>node;
        if (prop.property().canBeValue()){
            return {node:<hlimpl.ASTNodeImpl>prop.parent(),results:(<hlimpl.ASTNodeImpl>prop.parent()).findReferences()};

        }
    }

    return {node: null,results:[]};
}
export function referenceTargets(p0:hl.IProperty,c:hl.IHighLevelNode):hl.IHighLevelNode[]{
    var p=<def.Property>p0;
    if (p.getAdapter(ramlServices.RAMLPropertyService).isTypeExpr()){
        var definitionNodes = globalDeclarations(c).filter(node=>{
            var nc=node.definition().key();
            if (nc===universes.Universe08.GlobalSchema
                ||nc===universes.Universe10.GlobalSchema){
                return true;
            }
            return node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name);
        })
        return definitionNodes;
    }
    if (p.getAdapter(ramlServices.RAMLPropertyService).isDescriminating()){
        var subTypes=nodesDeclaringType(p.range(),c);
        return subTypes;
    }
    if (p.isReference()){
        var rt=p.referencesTo();
        var subTypes=nodesDeclaringType(rt,c);
        return subTypes;
    }
    if (p.range().hasValueTypeInHierarchy()){
        var vt=p.range().getAdapter(ramlServices.RAMLService);
        if(vt.globallyDeclaredBy().length>0){
            var definitionNodes = globalDeclarations(c).filter(z=>_.find( vt.globallyDeclaredBy(),x=>x==z.definition())!=null);
            return definitionNodes;
        }
    }
    return [];
}
export function enumValues(p:def.Property,c:hl.IHighLevelNode):string[]{
    if (c) {
        var rs:string[]=[];
        //TODO FIXME it is very very weird idea but I need to get it working right now

        if (p.getAdapter(ramlServices.RAMLPropertyService).isTypeExpr())
        {
            var definitionNodes = globalDeclarations(c).filter(node=>{
                var nc=node.definition().key();
                if (nc===universes.Universe08.GlobalSchema
                    ||nc===universes.Universe10.GlobalSchema){
                    return true;
                }
                return (node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name))

                //return true;
            })
            rs= definitionNodes.map(x=>hlimpl.qName(x,c));
            var de=c.definition().universe().type(universes.Universe10.TypeDeclaration.name);
            if (de){
                var subTypes = de.allSubTypes();
                rs=rs.concat( subTypes.map(x=>(x).getAdapter(ramlServices.RAMLService).descriminatorValue()));
            }
            return rs;
        }
        else{
            var rangeKey= p.range().key();
            if (rangeKey==universes.Universe08.SchemaString
                ||rangeKey==universes.Universe10.SchemaString){
                if (p.range().universe().version()=="RAML10"){
                    if (p.range().hasValueTypeInHierarchy()){
                        var definitionNodes = globalDeclarations(c).filter(node=>{
                            if (node.definition().key()==universes.Universe10.GlobalSchema){
                                return true;
                            }
                            return node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)
                        })
                        rs= definitionNodes.map(x=>hlimpl.qName(x,c));
                    }
                }
            }
        }
        if (p.getAdapter(ramlServices.RAMLPropertyService).isDescriminating()) {
            var subTypes = subTypesWithLocals(p.domain(), c);
            rs=rs.concat( subTypes.map(x=>(x).getAdapter(ramlServices.RAMLService).descriminatorValue()));
        }
        else if (p.isReference()) {
            rs= nodesDeclaringType(p.referencesTo(), c).map(x=>hlimpl.qName(x,c));
        }
        else if (p.range().hasValueTypeInHierarchy()) {
            var vt = p.range().getAdapter(ramlServices.RAMLService);
            if (vt.globallyDeclaredBy().length>0) {
                var definitionNodes = globalDeclarations(c).filter(z=>
                _.find(
                    vt.globallyDeclaredBy(), x=>x==z.definition())!=null);
                rs= rs.concat(definitionNodes.map(x=>hlimpl.qName(x,c)));
            }
        }
        if (p.isAllowNull()){
            rs.push("null")
        }
        if (p.enumOptions()) {
            rs=rs.concat(p.enumOptions());
        }
        return rs;
    }

    if (p.enumOptions() && typeof p.enumOptions() == 'string') {
        return [p.enumOptions() + ""];
    }
    return p.enumOptions();
}



function getLibraryName(node : hl.IParseResult) : string {
    if (node.isElement()&&node.asElement().definition().key()!=universes.Universe10.Library) {
        return null;
    }
    return node.asElement().attrValue("name");
}

export function findDeclarationByNode(node : hl.IParseResult,
    nodePart? : LocationKind):ll.ICompilationUnit|hl.IParseResult {
    var unit = node.lowLevel().unit();
    if (!unit) {
        return null;
    }

    var start = node.lowLevel().start();
    var end = node.lowLevel().end();
    if (nodePart && nodePart == LocationKind.KEY_COMPLETION) {
        start = node.lowLevel().keyStart();
        end = node.lowLevel().keyEnd();
    } else if (nodePart && nodePart == LocationKind.VALUE_COMPLETION) {
        start = node.lowLevel().valueStart();
        end = node.lowLevel().valueEnd();
    }

    if (start == -1 || end == -1) {
        return null;
    }

    var offset = Math.floor((start + end)/2);

    return findDeclaration(unit, offset, nodePart);
}

export function findDeclaration(unit:ll.ICompilationUnit, offset:number,
                                nodePart? : LocationKind):ll.ICompilationUnit|hl.IParseResult {
    var node = deepFindNode(hlimpl.fromUnit(unit), offset,offset, false);

    var  result:hl.IParseResult=null;
    //TODO This should be changed after next refactoring
    if (node.isElement()){
        if (node.asElement().definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
            (<hlimpl.ASTNodeImpl>node.asElement()).directChildren().forEach(x=>{
                if (x.isUnknown()){
                    //facets are not in hierarchy now
                    if (x.getLowLevelStart()<offset&& x.getLowLevelEnd()>offset){
                        var tp=node.asElement().localType();
                        tp.allFacets().forEach(f=>{
                            if (f.nameId()== x.lowLevel().key()){
                                if (f instanceof def.UserDefinedProp){
                                    var up= (<def.UserDefinedProp>f)._node;
                                    result=up;
                                }
                            }
                        })
                    }
                }
            })
        }
    }
    if (!node.property()){
        return node;
    }
    if (node.property().nameId()=="example"){
        var nm=node.parent().localType();
        node.lowLevel().children().forEach(y=>{
            if (y.key()=="example") {
                y.children().forEach(x=> {
                    if (x.start() < offset && x.end() > offset) {
                        var tp = node.parent().asElement().localType();
                        tp.allProperties().forEach(f=> {
                            if (f.nameId() == x.key()) {
                                if (f instanceof def.UserDefinedProp) {
                                    var up = (<def.UserDefinedProp>f)._node;
                                    result = up;
                                }
                            }
                        })
                    }
                })
            }
    })}
    if (result){
        return result;
    }
    var kind = nodePart ? nodePart : determineCompletionKind(unit.contents(), offset);
    if (kind == LocationKind.VALUE_COMPLETION) {

        var hlnode = <hl.IHighLevelNode>node;
        if (node instanceof hlimpl.ASTPropImpl) {
            var attr =<hlimpl.ASTPropImpl> node;
            if (attr) {
                if (attr.value()) {
                    if (attr.value() instanceof hlimpl.StructuredValue) {
                        var sval = <hlimpl.StructuredValue>attr.value();
                        var hlvalue = sval.toHighLevel();

                        if (hlvalue) {

                            var newAttr = _.find(hlvalue.attrs(), x=>x.lowLevel().start() < offset && x.lowLevel().end() >= offset);
                            if (newAttr) {
                                return searchInTheValue(offset,unit.contents(),newAttr, hlvalue, attr.property());
                            }

                        }
                    } else {
                        return searchInTheValue(offset,unit.contents(),attr, hlnode);
                    }

                }
                //console.log(attr.value());
            }
        } else {
            var nodeProperty = hlnode.property();
            if(nodeProperty) {
                return searchInTheValue(offset, unit.contents(), null, hlnode,nodeProperty);
            }
        }
    }
    if (kind == LocationKind.KEY_COMPLETION||kind==LocationKind.SEQUENCE_KEY_COPLETION) {
        var hlnode = <hl.IHighLevelNode>node;
        var pp=node.property();
        if (pp instanceof defs.UserDefinedProp){
            var up=<defs.UserDefinedProp>pp;
            return up.node();
        }
        if (node instanceof hlimpl.ASTNodeImpl) {
            if (hlnode.definition() instanceof defs.UserDefinedClass) {
                var uc = <defs.UserDefinedClass>hlnode.definition();
                if (uc.isAssignableFrom("TypeDeclaration")){

                    return node;
                }
                return uc.getAdapter(ramlServices.RAMLService).getDeclaringNode();
            }
        }
        if (node instanceof  hlimpl.ASTPropImpl){
            var pr=<hlimpl.ASTPropImpl>node;
            if (isExampleNodeContent(pr)) {
                var contentType = findExampleContentType(pr)
                if (contentType) {
                    var documentationRoot:hl.IHighLevelNode = parseDocumentationContent(pr,
                        <hl.INodeDefinition>contentType);
                    if (documentationRoot) {
                        var node = deepFindNode(documentationRoot, offset,offset);

                        pp=node.property();
                        if (pp instanceof defs.UserDefinedProp){
                            var up=<defs.UserDefinedProp>pp;
                            return up.node();
                        }
                        if (node instanceof hlimpl.ASTNodeImpl) {
                            if (hlnode.definition() instanceof defs.UserDefinedClass) {
                                var uc = <defs.UserDefinedClass>hlnode.definition();
                                return uc.getAdapter(ramlServices.RAMLService).getDeclaringNode();
                            }
                        }
                        //return propertyCompletion(documentationRoot, offset, text, false, true)
                    }
                }
            }
        }
    }
    if (kind == LocationKind.PATH_COMPLETION) {
        var inclpath = getValueAt(unit.contents(), offset);
        if (inclpath) {
            var ap = unit.resolve(inclpath);
            return ap;
        }
    }
}
export function findExampleContentType(node : hl.IAttribute) : hl.INodeDefinition {
    var p=node.parent();

    return <hl.INodeDefinition>p.localType();
}

export function parseDocumentationContent(attribute : hl.IAttribute, type : hl.INodeDefinition) : hl.IHighLevelNode {
    if (!(attribute.value() instanceof hlimpl.StructuredValue)){
        return null
    }
    return new hlimpl.ASTNodeImpl((<hlimpl.StructuredValue>attribute.value()).lowLevel(), attribute.parent(), type, attribute.property())
}

export function isExampleNodeContent(node : hl.IAttribute) : boolean {
    var typeExampleName10 = universes.Universe10.TypeDeclaration.properties.example.name;
    var objectName10 = universes.Universe10.ObjectTypeDeclaration.name;

    if (!(node instanceof hlimpl.ASTPropImpl)){
        return false
    }

    var property = <hlimpl.ASTPropImpl>node;
    var parent = property.parent();
    var parentProperty = parent && parent.property();
    var parentPropertyName = parentProperty && parentProperty.nameId();

    if(typeExampleName10 === property.name() && property.isString()) {
        if(parent instanceof hlimpl.ASTNodeImpl && parent.definition().isAssignableFrom(objectName10)) {
            return true;
        }
    }

    return false;
}
export function determineCompletionKind(text:string,offset:number):LocationKind{
    var hasIn=false;
    var hasSeq=false;
    var canBeInComment=false;
    var canBeAnnotation=false;
    for (var i=offset-1;i>=0;i--) {
        var c=text.charAt(i);
        if (c=='('){
            canBeAnnotation=true;
        }
        else if (canBeAnnotation){
            if (c=='\r'||c=='\n'){
                var hasClosing=false;
                for (var j=offset-1;j<text.length;j++) {
                    var ch=text[j];
                    if (ch==')'){
                        hasClosing=true;
                    }
                    if (ch=='\r'||ch=="\n"){
                        break;
                    }
                    if (ch==':'){
                        canBeAnnotation=false;
                        break;
                    }
                }
                if (canBeAnnotation&&hasClosing) {
                    return LocationKind.ANNOTATION_COMPLETION;
                }
                else{
                    break;
                }
            }
            if (c==' '||c=='\t'){
                continue;
            }
            else{
                break;
            }
        }
        else{
            if (c=='\r'||c=='\n'){
                break;
            }
            if (c==':'){
                break;
            }
        }
    }
    for (var i=offset-1;i>=0;i--){
        var c=text.charAt(i);
        if (c=='#'){
            if (i==0) {
                return LocationKind.VERSION_COMPLETION;
            }

            //subsequent check for include
            for (var j=i-1;j>=0;j--){
                var currentChar = text.charAt(j);
                if (currentChar=='\r'||currentChar=='\n') {
                    break;
                }
                else if (currentChar=='!') {
                    if (text.indexOf("!include", j) == j) {
                        return LocationKind.PATH_COMPLETION;
                    }
                }
            }

            return LocationKind.INCOMMENT;
        }
        if (c==':'){
            if (hasIn){
                return LocationKind.DIRECTIVE_COMPLETION
            }
            return LocationKind.VALUE_COMPLETION
        }
        if (c=='\r'||c=='\n'){
            //check for multiline literal
            var insideOfMultiline=false;
            var ind=getIndent2(offset,text);
            for (var a=i;a>0;a--){
                c=text.charAt(a);
                //TODO this can be further improved
                if (c==':')
                {
                    if (insideOfMultiline){
                        var ll=getIndent2(a,text);
                        if (ll.length<ind.length) {
                            return LocationKind.VALUE_COMPLETION
                        }
                    }
                    break;
                }
                if (c=='|'){
                    insideOfMultiline=true;
                    continue;
                }
                if (c=='\r'||c=='\n'){
                    insideOfMultiline=false;
                }
                if (c!=' '&&c!='\t'){
                    insideOfMultiline=false;
                }
            }
            if (hasSeq){
                return LocationKind.SEQUENCE_KEY_COPLETION
            }
            return LocationKind.KEY_COMPLETION
        }
        if (c=='-') {
            hasSeq=true;
        }
        if (c=='!'){
            if (text.indexOf("!include",i)==i) {
                return LocationKind.PATH_COMPLETION;
            }
            if (text.indexOf("!i",i)==i) {
                hasIn=true;
            }
        }
    }
}

export enum LocationKind{
    VALUE_COMPLETION,
    KEY_COMPLETION,
    PATH_COMPLETION,
    DIRECTIVE_COMPLETION,
    VERSION_COMPLETION,
    ANNOTATION_COMPLETION,
    SEQUENCE_KEY_COPLETION,
    INCOMMENT
}
export function resolveReference(point:ll.ILowLevelASTNode,path:string):ll.ILowLevelASTNode{
    if (!path){
        return null;
    }
    var sp=path.split("/");
    var result=point;
    for(var i=0;i<sp.length;i++){
        if (sp[i]=='#'){
            result=point.unit().ast();
            continue;
        }
        result=_.find(result.children(),x=>x.key()==sp[i]);
        if (!result){
            return null;
        }
    }
    return result;
}

/**
 * return all sub types of given type visible from parent node
 * @param range
 * @param parentNode
 * @returns ITypeDefinition[]
 */
export  function subTypesWithLocals(range:hl.ITypeDefinition, parentNode:hl.IHighLevelNode):ITypeDefinition[] {
    if (range==null){
        return [];
    }
    var name=range.nameId();

    parentNode=declRoot(parentNode);
    var actual=<hlimpl.ASTNodeImpl>parentNode;
    if (actual._subTypesCache){
        var cached=actual._subTypesCache[name];
        if (cached){
            return cached;
        }
    }
    else{
        actual._subTypesCache={};
    }
    var result = range.allSubTypes();


    if (range.getAdapter(ramlServices.RAMLService).getRuntimeExtenders().length > 0&&parentNode) {
        var decls=globalDeclarations(parentNode);
        var extenders = range.getAdapter(ramlServices.RAMLService).getRuntimeExtenders();
        var root = parentNode.root();
        extenders.forEach(x=> {
            var definitionNodes =decls.filter(z=>
            {
                var def=  z.definition().allSuperTypes();
                def.push(z.definition())
                var rr= (z.definition() == x)||(_.find(def,d=>d==x)!=null)||(_.find(def,d=>d==range)!=null);
                return rr;
            });
            result = result.concat(definitionNodes.map(x=>x.localType()))
        })
    }
    result=_.unique(result);
    actual._subTypesCache[name]=result;
    return result;
};
export function subTypesWithName (tname: string, parentNode:hl.IHighLevelNode,backup:{[name:string]:hl.ITypeDefinition}):hl.ITypeDefinition {
    parentNode=declRoot(parentNode);
    var decls=globalDeclarations(parentNode);
    var declNode=_.find(decls,x=>hlimpl.qName(x,parentNode)==tname&&x.property()&&
    (x.property().nameId()==universes.Universe10.LibraryBase.properties.types.name));
    return declNode.localType();
};
export function schemasWithName  (tname: string, parentNode:hl.IHighLevelNode,backup:{[name:string]:hl.ITypeDefinition}):hl.ITypeDefinition {
    parentNode=declRoot(parentNode);
    var decls=globalDeclarations(parentNode);
    var declNode=_.find(decls,x=>hlimpl.qName(x,parentNode)==tname&&x.property()&&
    (x.property().nameId()==universes.Universe10.LibraryBase.properties.schemas.name));
    return declNode.localType();
};


export function nodesDeclaringType  (range:hl.ITypeDefinition, n:hl.IHighLevelNode):hl.IHighLevelNode[] {
    var result:hl.IHighLevelNode[] = [];
    var extenders=range.getAdapter(ramlServices.RAMLService).getRuntimeExtenders();
    if (extenders.length > 0&&n) {
        var root = n;
        extenders.forEach(x=> {
            var definitionNodes = globalDeclarations(root).filter(z=>z.definition().isAssignableFrom(x.nameId()));
            result = result.concat(definitionNodes)
        })
    }
    var isElementType=!range.hasValueTypeInHierarchy();
    if (isElementType&&(<hl.INodeDefinition>range).getAdapter(ramlServices.RAMLService).isInlinedTemplates() && n){
        var root = n;
        //TODO I did not like it it might be written much better
        var definitionNodes = globalDeclarations(root).filter(z=>z.definition() == range);
        result=result.concat(definitionNodes);
    }
    else{
        var root = n;
        var q={};
        range.allSubTypes().forEach(x=>q[x.nameId()]=true)
        q[range.nameId()]=true;
        var definitionNodes = globalDeclarations(root).filter(z=>q[z.definition().nameId()]);
        result=result.concat(definitionNodes);
    }
    return result;
};
export function findAllSubTypes(p:hl.IProperty,n:hl.IHighLevelNode):hl.ITypeDefinition[] {
    var range=p.range();
    return subTypesWithLocals(range, n);
};

function possibleNodes(p:defs.Property,c:hl.IHighLevelNode):hl.IHighLevelNode[]{
    if (c) {
        if (p.isDescriminator()) {
            var range=p.range();
            var extenders = range.getAdapter(ramlServices.RAMLService).getRuntimeExtenders();

            if (extenders.length > 0&&c) {
                var result:hl.IHighLevelNode[]=[]
                extenders.forEach(x=> {
                    var definitionNodes = globalDeclarations(c).filter(z=>z.definition() == x);
                    result = result.concat(definitionNodes);
                });
                return result;
            }
            return []
        }
        if (p.isReference()) {
            return nodesDeclaringType(p.referencesTo(), c);
        }
        if (p.range().hasValueTypeInHierarchy()) {
            var vt=p.range().getAdapter(ramlServices.RAMLService);
            if (vt.globallyDeclaredBy&&vt.globallyDeclaredBy().length>0) {
                var definitionNodes = globalDeclarations(c).filter(z=>_.find( vt.globallyDeclaredBy(),x=>x==z.definition())!=null);
                return definitionNodes;
            }
        }
    }
    return [];
}
export function allChildren(node:hl.IHighLevelNode):hl.IParseResult[]{
    var res=[];
    gather(node,res)
    return res;
}
function gather(node:hl.IParseResult,result:hl.IParseResult[]){
    node.children().forEach(x=>{result.push(x);gather(x,result);});
}

var testUsage = function (ck:hl.ITypeDefinition, x:hl.IParseResult, node:hl.IHighLevelNode, result:hl.IParseResult[]) {
    var tp=ck.getAdapter(ramlServices.RAMLService).getDeclaringNode();
    if (tp) {
        if (node.isSameNode(tp)) {
            result.push(x);
            return;
        }
    }
    if (ck.isArray()) {
        testUsage(ck.array().componentType(), x, node, result);
    }
    if (ck.isUnion()) {
        var uni = ck.union();
        testUsage(uni.leftType(), x, node, result);
        testUsage(uni.rightType(), x, node, result);
    }
    if (ck.superTypes().some(x=>x.nameId()==node.name())){

        result.push(x);
    }
};
export function refFinder(root:hl.IHighLevelNode,node:hl.IHighLevelNode,result:hl.IParseResult[]):void{
    root.elements().forEach(x=>{
        refFinder(x,node,result);
        //console.log(x.name())
        var ck=<def.NodeClass>x.definition();
        //testUsage(ck, x, node, result);

    })
    root.attrs().forEach(a=>{
        var pr=a.property();
        var vl=a.value();
        //if (pr.isTypeExpr()){
        //    typeExpression.
        //}
        if (pr instanceof defs.UserDefinedProp){
            var up=(<defs.UserDefinedProp>pr).node();
            if (up==node){
                result.push(a);
            }
            //Runtime properties
            else if (up.lowLevel().start()==node.lowLevel().start()){
                if (up.lowLevel().unit()==node.lowLevel().unit()) {
                    result.push(a);
                }
            }
        }
        if (isExampleNodeContent(a)){
            var contentType = findExampleContentType(a)
            if (contentType) {
                var documentationRoot:hl.IHighLevelNode = parseDocumentationContent(a,
                    <hl.INodeDefinition>contentType);
                if (documentationRoot) {
                    refFinder(documentationRoot, node, result);
                    //return propertyCompletion(documentationRoot, offset, text, false, true)
                }
            }
        }
        else if (pr.getAdapter(ramlServices.RAMLPropertyService).isTypeExpr()&&typeof vl=="string"){
                var tpa = root.localType();

                testUsage(<def.NodeClass>tpa, a, node, result);
                var libraryName = getLibraryName(node)
                if(libraryName && vl.indexOf(libraryName) != -1) {
                    var referencingLibrary = getLibraryDefiningNode(a)
                    if (referencingLibrary &&
                        referencingLibrary.lowLevel().start() == node.lowLevel().start()) {
                        result.push(a)
                    }
                }
        }
        if ((<def.Property>pr).isReference()||pr.isDescriminator()){
            if (typeof vl=='string'){
                var pn=possibleNodes(<any>pr, root);
                if (_.find(pn,x=>x.name()==vl&&x==node)){
                    result.push(a);
                }

                var libraryName = getLibraryName(node)
                if(libraryName && vl.indexOf(libraryName) != -1) {
                    var referencingLibrary = getLibraryDefiningNode(a)
                    if (referencingLibrary &&
                        referencingLibrary.lowLevel().start() == node.lowLevel().start()) {
                        result.push(a)
                    }
                }
            }
            else{
                var st=<hlimpl.StructuredValue>vl;
                if (st) {
                    var vn = st.valueName();
                    var pn=possibleNodes(<any>pr, root);
                    if (_.find(pn,x=>x.name()==vn&&x==node)){
                        result.push(a);
                    }
                    var hnode = st.toHighLevel()
                    if (hnode) {
                        refFinder(hnode, node, result);
                    }

                    var libraryName = getLibraryName(node)
                    if(libraryName && vn.indexOf(libraryName) != -1) {
                        var referencingLibrary = getLibraryDefiningNode(hnode);
                        if (referencingLibrary &&
                            referencingLibrary.lowLevel().start() == node.lowLevel().start()) {
                            result.push(a)
                        }
                    }

                }
            }
        }
        else{
            var pn=possibleNodes(<any>pr, root);
            if (_.find(pn,x=>x.name()==vl&&x==node)){
                result.push(a);
            }
        }
    });
}

/**
 * Returns library node that definition of the current node is located in, or null
 * if current node is not defined in a library.
 */
function getLibraryDefiningNode(nodeToCheck : hl.IParseResult) : hl.IHighLevelNode {
    if (!nodeToCheck.lowLevel) {
        return null;
    }

    var lowLevelNode = nodeToCheck.lowLevel()
    if (!lowLevelNode) {
        return null
    }

    if (lowLevelNode.key()) {
        var offset = Math.floor((lowLevelNode.keyEnd() + lowLevelNode.keyStart())/2)
        var result = getLibraryDefiningNodeByOffset(lowLevelNode.unit(), offset);
        if (result)
            return result;
    }

    if (lowLevelNode.value()) {
        var offset = Math.floor((lowLevelNode.valueEnd() + lowLevelNode.valueStart())/2)
        var result = getLibraryDefiningNodeByOffset(lowLevelNode.unit(), offset);
        if (result)
            return result;
    }

    return null;
}

function getLibraryDefiningNodeByOffset(unit:ll.ICompilationUnit, offset:number) : hl.IHighLevelNode {
    var declaration = findDeclaration(unit, offset)
    if (declaration &&(<hl.IParseResult>declaration).isElement&& (<hl.IParseResult>declaration).isElement()) {
        var declarationNode = (<hl.IParseResult>declaration).asElement();

        var parent = declarationNode;
        while (parent) {
            if(parent.definition().key() == universes.Universe10.Library) {
                return parent;
            }

            parent = parent.parent()
        }
    }

    return null;
}