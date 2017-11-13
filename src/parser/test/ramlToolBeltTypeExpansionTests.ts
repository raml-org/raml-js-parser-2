import index = require("../../index");
import testUtil = require("./test-utils")
import util = require("../../util/index");
import assert = require("assert")

describe('RAML Toolbelt Expansion Tests',function() {

    describe('RAML Toolbelt Expansion Tests', function () {

        it("Test 001", function () {
            this.timeout(20000);
            testRAMLToolbeltExample(
                "TypeExpansionTests/RAML-toolbelt-test/ramls/type_collections.raml",
                "TypeExpansionTests/RAML-toolbelt-test/canonical_forms.js" );
        });
    });
});

function testRAMLToolbeltExample(apiPath:string,dataPath:string){

    apiPath = testUtil.data(apiPath);
    dataPath = testUtil.data(dataPath);
    let dataObj = require(dataPath);
    let toCompare:any = {};

    let apiJSON = index.loadSync(apiPath, { expandTypes: true });
    let apiTypes = apiJSON["specification"]["types"];
    let apiTypesObj:any = {};
    for(let t of apiTypes){
        let t1 = dataObj[t.name];
        if(t1) {
            apiTypesObj[t.name] = t;
            toCompare[t.name] = transformRamlToolbeltTypeObject(t1, t.name);
            transformParserTypeObject(t);
        }
    }

    let diff = testUtil.compare(toCompare,apiTypesObj);
    let filteredDiff = diff.filter(x=>{
        let p = x.path;
        if(p.match(/\/items\[\d+\]\/name/)||p.match(/^.+anyOf\[\d+\]\/name$/)){
            return false;
        }
        if(p.indexOf("typePropertyKind")>=0){
            return false;
        }
        return true;
    });
    if(filteredDiff.length!=0){
        filteredDiff.forEach(x=>{console.log(x.message("expected","actual"))});
        assert(false);
    }
}

function transformRamlToolbeltTypeObject(t:any,name:string):any {
    if(name) {
        t.name = name;
    }
    if(t.displayName==null && t.name!=null){
        t.displayName = t.name;
    }
    let typePropertyValue = t.type;
    if (!Array.isArray(typePropertyValue)) {
        t.type = [typePropertyValue];
    }
    let propsObject = t.properties;
    if(propsObject){
        for(let pName of Object.keys(propsObject)){
            transformRamlToolbeltTypeObject(propsObject[pName],pName);
        }
    }
    let items = t.items;
    if(Array.isArray(items)){
        items.forEach(x=>transformRamlToolbeltTypeObject(x,null));
    }
    else if(items){
        transformRamlToolbeltTypeObject(items,null);
        t.items = [t.items];
    }
    let anyOf = t.anyOf;
    if(anyOf){
        anyOf.forEach(x=>{
            transformRamlToolbeltTypeObject(x,null)
            if(x.displayName==null && t.displayName !=null){
                x.displayName = t.displayName;
            }
        });
    }
    delete t.additionalProperties;
    return t;
}
function transformParserTypeObject(t:any):any{

    let propArr = t.properties;
    if(propArr!=null && Array.isArray(propArr)){
        let propObj:any = {};
        for(let p of propArr){
            propObj[p.name] = p;
        }
        t.properties = propObj;
        for(let p of propArr) {
            transformParserTypeObject(p);
        }
    }
    let items = t.items;
    if(Array.isArray(items)){
        items.forEach(x=>transformParserTypeObject(x));
    }
    else if(items){
        transformParserTypeObject(items);
    }
    let anyOf = t.anyOf;
    if(Array.isArray(anyOf)){
        anyOf.forEach(x=>transformParserTypeObject(x));
    }
    if(t.examples){
        let examplesObj:any = {};
        let singleExample:any;
        for(let e of t.examples){
            if(e.name!=null){
                examplesObj[e.name] = e.value;
            }
            else{
                singleExample = e.value;
                break;
            }
        }
        delete t.examples;
        delete t.simplifiedExamples;
        if(Object.keys(examplesObj).length>0){
            t.examples = examplesObj;
        }
        else{
            t.example = singleExample;
        }
    }
    delete t.sourceMap;
    delete t.__METADATA__;
    return t;
}