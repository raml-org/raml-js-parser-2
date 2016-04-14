/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")
import fs = require("fs")
import path = require("path")
import _=require("underscore")
import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import yaml=require("yaml-ast-parser")
import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import def = require("raml-definition-system")

import hl=require("../highLevelAST")
import t3 = require("../artifacts/raml10parser")
import textutil=require('../../util/textutil')

import expander = require("../ast.core/expander")
import RamlWrapper = require("../artifacts/raml10parserapi");
import RamlWrapperImpl = require("../artifacts/raml10parser");

import RamlWrapper08 = require("../artifacts/raml08parserapi");
import RamlWrapper08Impl = require("../artifacts/raml08parser");

import hlimpl=require("../highLevelImpl")
import apiLoader = require("../../raml1/apiLoader")


var pdir = path.resolve(__dirname, ".");

export var universe = require("../definition-system/universeProvider")("RAML10");
export var apiType = <def.NodeClass>universe.type("Api");

export function showTypeProperties(defenition: hl.INodeDefinition) {
  var type = <def.NodeClass>defenition;
  console.log('Type: ' + type.nameId());
  var own = <def.Property[]>type.properties();
  var all = type.allProperties();

  var extra = [];
  all.forEach(p=> {
    if(!_.contains(own, p)) extra.push(p);
  });

  own.forEach(p=> {
    console.log('  property: ' + p.nameId() + ': ' + p.range().nameId())
  });
  console.log('  -----------------');
  extra.forEach(p=> {
    console.log('  property: ' + p.nameId() + ': ' + p.range().nameId())
  });

}

export function showProperties(name: string) {
  console.log('Type ' + name + ':');
  var type = <def.NodeClass>universe.type(name);
  showTypeProperties(type);
}

export function show(node: hl.IHighLevelNode, lev: number = 0) {
  var property = node.property();
  var namestr = property? property.nameId()+': ' : '';
  var elements = node.elements();
  //console.log(namestr + '.elements = ' + elements.length);
  if(elements.length > 0) {
    textutil.print(lev, namestr + node.definition().nameId() + ' {');
    elements.forEach(e=> show(e, lev+1));
    textutil.print(lev, '}');
  } else {
    textutil.print(lev, namestr + node.definition().nameId() + ' {}');
  }
}

export function loadApi(name: string, neverExpand = false):high.ASTNodeImpl {
  var unit = loadUnit(name);

  var api = <high.ASTNodeImpl>high.fromUnit(unit);
  if (!neverExpand) {
    api = expandHighIfNeeded(api);
  }

  if(!api) throw new Error("couldn't load api from " + name);
  return api;
}

function loadUnit(unitPath: string) {
  if(!fs.existsSync(unitPath)) throw new Error("file not found: " + unitPath);
  var p = new jsyaml.Project(pdir);
  return p.unit(unitPath, true);
}

export function loadAndMergeApis(masterPath: string, extensions : string[]) : hl.IHighLevelNode {
  var masterApi = loadUnit(masterPath);

  var extesionApis = _.map(extensions, extension=>loadUnit(extension));

  return expander.mergeAPIs(masterApi, extesionApis, high.OverlayMergeMode.MERGE);
}

function trimEnd(s: string): string {
  if(!s) return s;
  var len = s.length;
  while(len>0) {
    var ch = s[len-1];
    if(ch!='\r' && ch!='\n' && ch!=' ' && ch!='\t') break;
    len--;
  }
  return s.substr(0, len);
}

function makeDiff(lines1: string[], lines2: string[], index: number, context: number): string {
  var diff = '\n';
  var min = Math.max(0, index-context);
  var max = Math.min(index+context, lines1.length, lines2.length);
  var maxlen = 0;

  for(var i=min; i<=max; i++) {
    var line = lines1[i];
    if(line && line.length > maxlen) maxlen = line.length;
  }

  for(var i=min; i<=max; i++) {
    var line1 = trimEnd(lines1[i]);
    var line2 = trimEnd(lines2[i]);
    if(!line1) line1 = "<undefined>";
    if(!line2) line2 = "<undefined>";
    while(line1.length < maxlen) line1 = line1 + ' ';
    var sep = ' : ';
    if(i < index) sep = ' = ';
    else if(i == index) sep = ' ! ';
    diff += line1 + sep + line2 + '\n';
  }
  return diff;
}

export function compareToFile(text: string, filename: string) {
  var txt = fs.readFileSync(filename).toString();
  var lines1 = text.trim().split("\n");
  var lines2 = txt.trim().split("\n");
  var lines = Math.min(lines1.length, lines2.length);
  //console.log('TEXT:\n' + txt);
  for(var i=0; i<lines; i++) {
    if(trimEnd(lines1[i]) != trimEnd(lines2[i])) {
      var diff = '\n' + 'File: ' + filename + '\n' + makeDiff(lines1, lines2, i, 3);
      assert(false, diff);
    }
    //assert.equal(trimEnd(lines1[i]), trimEnd(lines2[i]));
  }
  var bigger = lines1.length > lines2.length? lines1 : lines2;
  var diff = '\n' + 'File: ' + filename + '\n';
  for(var i=lines; i<bigger.length; i++) {
    diff += 'Extra line: ' + bigger[i] + '\n';
  }
  if(lines1.length != lines2.length) {
    console.log(text)
    assert.ok(false, diff);
  }
  assert.equal(lines1.length, lines2.length, diff);
}

export function xpath(node: hl.IHighLevelNode, path: string): hl.IHighLevelNode | hl.IAttribute | hl.IAttribute[] {
  var parts = path.split('/');
  for(var i=0; i<parts.length; i++ ) {
    var name = parts[i];
    var attr = (name[0]=='#');
    var index = -1;
    if(name.indexOf('[') >= 0) {
      var p1 = name.indexOf('[');
      var p2 = name.indexOf(']');
      index = parseInt(name.substring(p1+1, p2));
      name = name.substring(0, p1);
    }
    var p = node.definition().property(name);
    //var isval = p.isValue();
    if(attr) {
      name = name.substr(1, name.length-1);
      var attrs = node.attributes(name);
      return index>=0? attrs[index] : attrs;
    } else {
      var nodes = node.elementsOfKind(name);
      if (!node || nodes.length == 0) {
        return null;
      }
      if(index < 0) index = 0;
      node = nodes[index];
    }
  }
  return node;
}

export function projectRoot(): string {
  var dir = path.resolve('.', '');
  while(!fs.existsSync(path.resolve(dir, 'package.json'))) {
    var parent = path.resolve(dir, '..');
    if(parent == dir) return null;
    dir = path.resolve(dir, '..');
  }
  return dir;
}

export function data(filepath: string): string {
  var datadir =  path.resolve(projectRoot(), 'src/raml1/test/data');
  return path.resolve(datadir, filepath);
}

export function assertValue(a: hl.IAttribute, value: string) {
  assert.equal(a.value(), value, 'value should be: ' + value + ' instead of: ' + a.value());
}

export function assertValueText(a: hl.IAttribute, value: string) {
  var node = <yll.ASTNode>a.lowLevel();
  var scalar = <yaml.YAMLScalar>node.asMapping().value;
  var unittext = node.unit().contents();
  var text = unittext.substring(scalar.startPosition, scalar.endPosition);
  assert.equal(text, value, 'value text should be: <' + value + '> instead of: <' + text + '>');
}

export function assertText(a: hl.IAttribute, text: string) {
  var txt = (<yll.ASTNode>a.lowLevel()).text();
  assert.equal(txt, text, 'text \nshould be : ' + textutil.replaceNewlines(text) +
                               '\ninstead of: ' + textutil.replaceNewlines(txt));
}


export function compare(arg0:any,arg1:any,path:string=''):Diff[] {

  var diffs:Diff[] = [];
  if(arg0==null){
    if(arg1!=null) {
      diffs.push(new Diff(path, arg0, arg1, 'Defined/undefined mismatch'));
      return diffs;
    }
  }
  else if(arg1==null){
    diffs.push(new Diff(path,arg0,arg1,'Defined/undefined mismatch'));
    return diffs;
  }
  else if(Array.isArray(arg0)){
    if(!Array.isArray(arg1)){
      diffs.push(new Diff(path,arg0,arg1,'Array/' + typeof(arg1)+' mismatch'));
      return diffs;
    }
    else {
      var l0 = arg0.length;
      var l1 = arg1.length;
      if (l1 != l0) {
        diffs.push(new Diff(path, arg0, arg1, 'Array lengths mismatch'));
        return diffs;
      }
      var l = Math.min(l0, l1);
      for (var i = 0; i < l; i++) {
        diffs = diffs.concat(compare(arg0[i], arg1[i], path + '[' + i + ']'));
      }
    }
  }
  else if(arg0 instanceof Object){
    if(!(arg1 instanceof Object)){
      diffs.push(new Diff(path,arg0,arg1,'Object/' + typeof(arg1)+' mismatch'));
      return diffs;
    }
    else {
      var keys0 = Object.keys(arg0);
      var keys1 = Object.keys(arg1);
      var map:{[key:string]:boolean} = {}
      for (var i = 0; i < keys0.length; i++) {
        var key = keys0[i];
        map[key] = true;
        var val0 = arg0[key];
        var val1 = arg1[key];
        diffs = diffs.concat(compare(val0, val1, path + '/' + key));
      }
      for (var i = 0; i < keys1.length; i++) {
        var key = keys1[i];
        if (map[key]) {
          continue;
        }
        var val0 = arg0[key];
        var val1 = arg1[key];
        diffs = diffs.concat(compare(val0, val1, path + '/' + key));
      }
    }
  }
  else {
    if(arg0 !== arg1){
      diffs.push(new Diff(path,arg0,arg1,'Inequal values'));
    }
  }
  return diffs;
}

export class Diff{
  constructor(path:string, value0:any, value1:any, comment:string) {
    this.path = path;
    this.value0 = value0;
    this.value1 = value1;
    this.comment=comment;
  }

  path:string;

  value0:any;

  value1:any;

  comment:string;

  message(label0?:string,label1?:string):string{
    label0 = label0||"value0";
    label1 = label1||"value1";
    
    var strValue0:string = "undefined";
    var strValue1:string = "undefined";
    if(this.value0!=null) {
      try {
        strValue0 = JSON.stringify(this.value0, null, 2).trim();
      }
      catch (err) {
        strValue0 = this.value0.toString();
      }
    }
    if(this.value1!=null) {
      try {
        strValue1 = JSON.stringify(this.value1, null, 2).trim();
      }
      catch (err) {
        strValue1 = this.value1.toString();
      }
    }
    
    return `path: ${this.path}
comment: ${this.comment}
${label0}: ${strValue0}
${label1}: ${strValue1}`
  }
}

export function validateNode(api:hl.IHighLevelNode):hl.ValidationIssue[] {
  var errors:hl.ValidationIssue[] = [];
  var q:hl.ValidationAcceptor = {
    accept(c:any) {
      errors.push(c);
    },
    begin() {

    },
    end() {

    }
  }
  api.validate(q);
  return errors;
};

export function loadApiWrapper1(apiPath:string): RamlWrapper.Api {
  var absPath = data(apiPath);
  var hlNode:hl.IHighLevelNode = loadApi(absPath);
  var api = new RamlWrapperImpl.ApiImpl(hlNode);
  return api;
}

export function countErrors(api:hl.IHighLevelNode){
  //var api=util.loadApi(p);
  var errors = validateNode(api);
  // console.log('Errors: ' + errors.length);
  return errors.length;
}

export function showErrors(api:hl.IHighLevelNode){
  //var api=util.loadApi(p);
  var errors = validateNode(api);
  console.log('Errors: ' + errors.length);
  if (errors.length > 0) {
    errors.forEach(error=>{
      if (typeof error.message == 'string') {
        console.error(error.message);
      } else {
        console.error(error);
      }
      console.error("\n");
    })
  }
  return errors.length;
}

export function loadApiWrapper08(apiPath:string){
  var absPath = data(apiPath);
  var hlNode:hl.IHighLevelNode = loadApi(absPath);
  var api = new RamlWrapper08Impl.ApiImpl(hlNode);
  return api;
}

export function loadApiOptions1(apiPath:string, options : any){
  var opt = apiLoader.loadApi(apiPath, options);
  return opt.getOrThrow();
}

export function loadApiOptions08(apiPath:string, options : any){
  var opt = apiLoader.loadApi(apiPath, options);
  return opt.getOrThrow();
}

export function loadRAML(ramlPath : string) : hl.BasicNode {
  var opt = apiLoader.loadRAML(ramlPath);
  return opt.getOrThrow();
}

interface ParserError {
  message:string
}

function matchError(error : ParserError, errorMessage: string) {
  return error.message.indexOf(errorMessage) != -1;
}

/**
 * Builds AST and compares it to a pre-serialized AST in a data folder file
 * @param masterPath - path to RAML master file
 * @param astPath - path to pre-serialized AST
 * @param extensions - extensuions and overlays paths
 * @param expectedErrors - expected error messages
 * @param mode - 1 == hlimpl.OverlayMergeMode.MERGE, 0 == hlimpl.OverlayMergeMode.AGGREGATE
 */
export function testAST(masterPath : string, astPath: string, extensions? : string[], expectedErrors?: string[],
                 mode? : boolean){
  var api = null;
  if (!extensions || extensions.length == 0) {
    api = loadApi(data(masterPath));
    if (global.isExpanded & <any>api.wrapperNode){
      api = (<any>api.wrapperNode()).expand().highLevel();
    }
    if (mode != null) {
      api.setMergeMode(mode?hlimpl.OverlayMergeMode.MERGE : hlimpl.OverlayMergeMode.AGGREGATE);
    }
  } else {
    var absoluteExtensionPaths = extensions.map(extension=>data(extension));
    api = loadAndMergeApis(data(masterPath), absoluteExtensionPaths);
  }

  //Validating first. It is supposed that there should be no errors in AST we are testing
  var errors:ParserError[]=[];
  var q:hl.ValidationAcceptor={
    accept(c:ParserError){
      errors.push(c);
    },
    begin(){

    },
    end(){

    }
  }

  api.validate(q);

  if(errors.length!=0 && (!expectedErrors || expectedErrors.length == 0)) {
    assert(false, "Unexpected parser errors found:" + errors.map(unmatchedError=>unmatchedError.message));
  } if(errors.length==0 && expectedErrors && expectedErrors.length != 0) {
    assert(false, "Expected parser errors not found:" + expectedErrors);
  } else if (errors.length!=0 && expectedErrors && expectedErrors.length != 0) {
    var unmatchedErrors = [];
    errors.forEach(error=> {
      var matchFound = false;
      expectedErrors.forEach(expectedError=>{if(matchError(error, expectedError)) matchFound = true;});
      if (!matchFound) {
        unmatchedErrors.push(error);
      }
    })

    if (unmatchedErrors.length > 0) {
      assert(false, "Unexpected parser errors found:" + unmatchedErrors.map(unmatchedError=>unmatchedError.message));
    }

    var unmatchedExpectedErrors = [];
    expectedErrors.forEach(expectedError=>{
      var matchFound = false;
      errors.forEach(error=>{if(matchError(error, expectedError)) matchFound = true;});
      if (!matchFound) {
        unmatchedExpectedErrors.push(expectedError)
      }
    })

    if (unmatchedExpectedErrors.length > 0) {
      assert(false, "Expected parser errors not found:" + unmatchedExpectedErrors);
    }
  }


  //now loading AST text from a saved file, serializing AST we parsed and comparing

  var serializedAST = (<hlimpl.ASTNodeImpl>api).testSerialize();

  try {
    compareToFile(serializedAST, data(astPath));
  } catch (error) {
    console.log("Serialized AST of " + data(masterPath));
    console.log(serializedAST);
    throw error;
  }
}

export function expandHighIfNeeded(original : high.ASTNodeImpl) : high.ASTNodeImpl {

  if(!global.isExpanded) return original;

  if (!original) return original;

  if ((<any>original).wrapperNode == null) return original;

  var wrapper = original.wrapperNode();
  if (wrapper == null) return original;

  if ((<any>wrapper).expand == null) return original;

  return <high.ASTNodeImpl>((<any>wrapper).expand()).highLevel();
}


export function expandWrapperIfNeeded(original : RamlWrapper.Api | RamlWrapper08.Api) : RamlWrapper.Api | RamlWrapper08.Api {
  if(!global.isExpanded) return original;

  return original.expand();
}