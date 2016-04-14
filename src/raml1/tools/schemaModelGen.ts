/// <reference path="../../../typings/main.d.ts" />
import def=require("raml-definition-system")
import _=require("underscore")
import fs=require("fs")
import hl=require("../highLevelAST")
import high = require("../highLevelImpl")
import textutil = require('../../util/textutil')
import util = require("../test/test-utils")
import wrapper=require("../artifacts/raml10parser")
import jsyaml=require("../jsyaml/jsyaml2lowLevel")

import schemaGenApi = require("./schemaModelGenApi")


export class SchemaToModelGenerator implements schemaGenApi.SchemaToModelGenerator {

  generateText(schema:string):string {
    var obj = JSON.parse(schema);
    var items = obj['items'];
    if (!items) return '';
    var text = '';
    var itemsArray:any[] = (items instanceof Array) ? items : [items];
    text += 'types:\n';

    itemsArray.forEach(e=> {
      //console.log('Item: ' + e.title + ' ' + e.type);
      text += '  - ' + e.title + ':\n';
      text += this.generateObj(e, 3);
    });
    return text;
  }

  generateObj(e:any, lev:number):string {
    var text = '';
    text += textutil.indent(lev, 'type: ' + e.type) + '\n';
    if (!e.properties) return;
    text += textutil.indent(lev, 'properties:\n');
    //console.log('props: ' + e.properties);
    for (var name in e.properties) {
      //console.log('  property: ' + JSON.stringify(p));
      var p = e.properties[name];
      text += textutil.indent(lev + 1, name + ':\n');
      //console.log('  property ' + name + ': ' + p.type);
      if (p.type == 'object') {
        text += this.generateObj(p, lev + 2);
      } else {
        text += textutil.indent(lev + 2, 'type: ' + p.type) + '\n';
      }
    }
    return text;
  }

  generateTo(api: hl.IHighLevelNode, schema:string, title? : string): string[] {
    var obj = JSON.parse(schema);
    var items = obj['items'];
    if (!items) {
      if(obj.title) title = obj.title;
      //console.log('title: ' + title);
      var type = new wrapper.ObjectTypeDeclarationImpl(title);
      this.generateObjTo(type, obj);
      new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
      return [title];
    } else {
      var itemsArray:any[] = (items instanceof Array) ? items : [items];
      var types = [];
      itemsArray.forEach(e=> {
        var type = new wrapper.ObjectTypeDeclarationImpl(e.title);
        this.generateObjTo(type, e);
        new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
        types.push(e.title);
      });
      return types;
    }
  }

  generateObjTo(type: wrapper.TypeDeclarationImpl, e: any) {
    type.setType(e.type);
    //console.log('type: ' + type.definition().name());
    //util.showTypeProperties(type.definition());
    //type.attrOrCreate('type').setValue(e.type);
    if (!e.properties) return;
    //text += textutil.indent(lev, 'properties:\n');
    //console.log('props: ' + e.properties);
    for (var name in e.properties) {
      var p = e.properties[name];
      var field = this.makeTypeField(name, p);
      if(p.type == 'array') {
        //this.generateItemsTo(<wrapper.ArrayFieldImpl>field, p);
      }
      //console.log('  property: ' + JSON.stringify(p));
      //text += textutil.indent(lev+1, name + ':\n');
      //console.log('  property ' + name + ': ' + p.type);
      type.addToProp(field, 'properties');
    }
  }

  makeTypeField(name: string, p: any): wrapper.TypeDeclarationImpl {
    var field = this.makeType(name, <string>p.type);
    if(p.type) field.setType(p.type);
    if(p.type == 'number') {
      var n = <wrapper.NumberTypeDeclarationImpl>field;
      if(p.minimum != undefined) (n).setMinimum(p.minimum);
      if(p.maximum != undefined) (n).setMaximum(p.maximum);
    }
    if(p.type == 'array') {
      var itype = p.items.type;
      field.setType(itype + '[]');
      var a = <wrapper.ArrayTypeDeclarationImpl>field;
      if(p.minItems != undefined) a.setMinItems(p.minItems);
      if(p.maxItems != undefined) a.setMaxItems(p.maxItems);
      if(p.uniqueItems != undefined) a.setUniqueItems(p.uniqueItems);
    }
    if(p.type == 'object') {
      this.generateObjTo(<wrapper.ObjectTypeDeclarationImpl>field, p);
    }
    return field;
  }

  makeType(name: string, type: string): wrapper.TypeDeclarationImpl {
    if(type == 'number') return new wrapper.NumberTypeDeclarationImpl(name);
    if(type == 'string') return new wrapper.StringTypeDeclarationImpl(name);
    if(type == 'array') return new wrapper.ArrayTypeDeclarationImpl(name);
    return new wrapper.ObjectTypeDeclarationImpl(name);
  }

  generateItemsTo(a: wrapper.ArrayTypeDeclarationImpl, obj: any) {
    var items = obj['items'];
    if (!items) return;
    var itemsArray:any[] = (items instanceof Array) ? items : [items];
    itemsArray.forEach(item=> {
      //TODO add items here
    });
  }

}

export class ModelToSchemaGenerator {

  generateSchema(node: hl.IHighLevelNode): any {
    var obj = this.generateType(node);
    obj["$schema"] = "http://json-schema.org/draft-04/schema#";
    return obj;
  }

  isSimpleType(name) {
    return name == 'string' || name == 'number' || name == 'boolean' || name == 'object';
  }

  generateType(type: hl.IHighLevelNode): any {
    var typelist = this.allTypes(type);
    var obj: any = {};
    obj.title = type.attrValue('name');
    var properties = {};
    if(type.attrValue('type')) {
      // support multiple inheritance
      var types = type.attributes('type');
      //var properties = {};
      var inherited = false;
      var simple = false;
      for(var i in types) {
        var typevalue = types[i].value();
        var ll = <jsyaml.ASTNode>types[i].lowLevel();
        obj.type = '';
        if(ll.isValueInclude()) {
          var schema = JSON.parse(typevalue);
          obj.type = 'object';
          obj.properties = schema.properties;
        } else {
          //console.log('type value: ' + typevalue);
          if(this.isSimpleType(typevalue)) {
            obj.type = typevalue;
            simple = true;
            if (inherited) throw new Error("couldn't mix user defined and basic types in inheritance");
          } else {
            var t = this.resolveType(type, typevalue);
            if (t) {
              var ppp = this.generateTypeExp(typevalue, typelist);
              //console.log('res: ' + typevalue + '\n' + JSON.stringify(ppp));
              //_.extend(properties, ppp.properties);
              if(obj.properties) {
                _.extend(obj.properties, ppp.properties);
              } else {
                obj.properties = ppp.properties;
              }
              obj.type = 'object';
              inherited = true;
              if (simple) throw new Error("couldn't mix user defined and basic types in inheritance");
            } else {
              var ppp = this.generateTypeExp(typevalue, typelist);
              //console.log('xtype: ' + typevalue + '\n' + JSON.stringify(ppp));
              obj.type = 'object';
              inherited = true;
              if(ppp.anyOf) {
                obj.anyOf = ppp.anyOf;
              }
            }
          }
        }
      }
    } else {
      obj.type = 'object';
    }

    //var ps = this.generateProperties(type);
    //this.generatePropertiesTo(properties, type);
    var ownProps = this.generateProperties(type);
    //_.extend(properties, ownProps);
    //if(Object.getOwnPropertyNames(properties).length > 0) {
    if(obj.properties) {
      //console.log('own.p : ' + obj.properties);
      //console.log('own: ' + JSON.stringify(ownProps));
      //console.log('obj.p1: ' + obj.properties);
      _.extend(obj.properties, ownProps);
      //console.log('obj.p2: ' + obj.properties);
      //console.log('own: ' + JSON.stringify(ownProps));
    } else {
      obj.properties = ownProps;
    }
    return obj;
  }

  makeUnion(typelist, types) {
    var anyof = [];
    typelist.forEach(t=>{
      t = t.trim();
      if(types[t]) {
        anyof.push({
          type: 'object',
          properties: this.generateType(types[t]).properties
        });
      } else {
        anyof.push({type: t});
      }
    });
    return anyof;
  }

  generateTypeExp(type: string, types: any) {
    var obj: any = {};
    //console.log('type: ' + type);
    if(textutil.endsWith(type, '[]')) {
      obj.type = 'array';
      obj.items = {type: type.substring(0, type.length - 2)};
    } else if(type.indexOf('|')>0) {
      var typelist = type.split('|');
      obj.anyOf = this.makeUnion(typelist,types);
    } else {
      if(types[type]) {
        var schema = this.generateType(types[type]);
        obj.type = 'object';
        obj.properties = schema.properties;
      } else {
        obj.type = type;
      }
    }
    return obj;
  }

  allTypes(node: hl.IHighLevelNode) {
    var api = node.root();
    var modelTypes = api.elementsOfKind('types');
    var types = {};
    modelTypes.forEach(type=>{
      //console.log('  types: ' + type.name());
      types[type.name()] = type;
    });
    return types;
  }

  resolveType(node: hl.IHighLevelNode, name: string) {
    var types = this.allTypes(node);
    return types[name];
  }

  generateProperty(node: hl.IHighLevelNode, optional: boolean): any {
    var types = this.allTypes(node);
    var obj: any = {};
    var props = node.definition().allProperties();
    props.forEach(p=>{
      if(p.nameId() == 'name') return;
      var value = node.attrValue(p.nameId());
      if (!(value!=null && value != undefined && value != 'undefined')) return;
      if (p.nameId() == 'type') {
        var t = this.generateTypeExp(value, types);
        _.extend(obj, t);
        //this.generatePropertyType(obj, value, types);
      } else if (p.nameId() == 'enum') {
        var values = node.attributes('enum');
        var arr = values.map(a=> a.value());
        obj.enum = arr;
      } else {
        obj[p.nameId()] = value;
      }
    });
    if(optional) obj.required = false;
    var elements = node.elements();
    var properties = this.generateProperties(node);
    if(Object.getOwnPropertyNames(properties).length > 0) {
      obj.properties = properties;
    }
    return obj;
  }

  generateProperties(node: hl.IHighLevelNode) {
    var props: any = {};
    var elements = node.elements();
    var empty = true;
    elements.forEach(p=> {
      var name = p.attrValue('name').trim();
      var optional = p.optional();
      props[name] = this.generateProperty(p, optional);
      empty = false;
    });
    return props;
  }

}