// import _=require("underscore")
// import fs=require("fs")
// import abnf=require("abnf")
//
// import def=require("../../definitionSystem")
// import hl=require("../../highLevelAST")
// import high = require("../../highLevelImpl")
// import textutil = require('../../../util/textutil')
// import util = require("../../test/test-utils")
// import parser=require("../../artifacts/raml10parser")
// import jsyaml=require("../../jsyaml/jsyaml2lowLevel")
// import bnfgen = require('./bnfgen')
// import exgen = require('./exgen')
// import gu = require('./gen-util')
// import typeExpression=require("../../ast.core/typeExpressionParser")
// import typeSystem = require("../../definition-system/typeSystem")
//
// export class ExampleGenerator {
//
//     constructor(private typeman: gu.TypeManager) {
//     }
//
//     arraify(ex: any, array: boolean) {
//         return array? [ex] : ex;
//     }
//
//     valueTypeSample(typename: string, arr: boolean): any {
//         switch(typename) {
//             case 'string':
//             case 'StringType':
//                 return this.arraify('str', arr);
//             case 'number':
//             case 'NumberType':
//                 return this.arraify(1, arr);
//             case 'boolean':
//             case 'BooleanType':
//                 return this.arraify(true, arr);
//             case 'object':
//                 return this.arraify({}, arr);
//             default:
//                 return null;
//         }
//     }
//
//     generateTypeExpByParsed(res: any) {
//         //console.log('parsed: ' + JSON.stringify(res));
//         var obj: any = {};
//         if(res.type == 'name') {
//             switch(res.value) {
//                 case 'string':
//                 case 'StringType':
//                     //return this.arraify('str', res.arr);
//                 case 'number':
//                 case 'NumberType':
//                     //return this.arraify(1, res.arr);
//                 case 'boolean':
//                 case 'BooleanType':
//                     //return this.arraify(true, res.arr);
//                 case 'object':
//                    //return {}; //this.generate(type);
//                     return this.valueTypeSample(res.value, res.arr);
//                 default:
//                     var type = this.typeman.lookupType(res.value);
//                     if(type) {
//                         return this.arraify(this.generate(type), res.arr);
//                     } else {
//                         return undefined;
//                     }
//             }
//         } else if (res.type == 'parens') {
//             var o = this.generateTypeExpByParsed(res.expr);
//             return this.arraify(o, res.arr);
//         } else if(res.type == 'union') {
//             var example1 = this.generateTypeExpByParsed(res.first);
//             //var example2 = this.generateTypeExpByParsed(res.rest);
//             return example1;
//         } else {
//             throw 'unsupported type expression operation: ' + res.type;
//         }
//         //console.log('obj: ' + JSON.stringify(res) + ' ==> ' + JSON.stringify(obj));
//         return obj;
//     }
//
//     makeValueFor(property: def.Property) : any {
//         var range = property.range();
//         var ptype = range.nameId();
//         //console.log('property: ' + property.nameId() + ' with type: ' + ptype);
//         if(range instanceof def.UserDefinedClass) {
//             return this.generateByTypeDefinition(range);
//         } else if(range instanceof def.Union) {
//             var union = <def.Union>range;
// 	          var val = this.generateByTypeDefinition(union.left);
//             //console.log('union val: ' + JSON.stringify(val));
//             return val;
//         } else {
//             //console.log('type: ' + ptype);
//             var example = this.generateTypeExpression(ptype);
//             //console.log('example: ' + JSON.stringify(example));
//             return example;
//         }
//     }
//
//     generate(type: parser.ObjectTypeDeclaration): any {
//         var rt = type.runtimeType();
//
//         var types = type.type()[0];
//         //console.log('GENERATE EXAMPLE: ' + type.name() + ' - runtime - ' + rt.nameId() + ' - types - ' + types);
//         //console.log('DEF: \n' + rt.printDetails());
//         //console.log('----------');
//
//         var ex = this.generateByTypeDefinition(rt, types);
//
//         return ex;
//     }
//
//     generateByTypeDefinition(rt: typeSystem.ITypeDefinition, supertype?: string): any {
//         if(rt instanceof def.ValueType) {
//             var valtype = <def.ValueType>rt;
// 	          var ex = this.valueTypeSample(valtype.nameId(), false);
//             //console.log('VALUE: ' + valtype.nameId() + ': ' + ex);
//             return ex;
//         }
//         //console.log('Generate example: ' + rt.nameId());
//         //console.log('DEF: \n' + rt.printDetails());
//         if(!supertype) {
//             if(!rt) {
//                 supertype = "[]"
//             } else {
//                 var stypes = rt.superTypes();
//                 //stypes.forEach(x=>console.log('  super: ' + x.nameId()));
//                 supertype = '[' + _.map(stypes, x=> {
//                       return x.nameId()
//                   }).join(',') + ']';
//             }
//         }
//         //console.log('  supertypes: ' + supertype);
//         var example = (supertype == '[]')? {} : this.generateTypeExpression(supertype);
//
//         if(rt) {
//             var properties = rt.allProperties();
//             //var cls = type.constructor.name;
//             //console.log('generate property examples for type: ' + rt.nameId());
//             //var properties = type.properties();
//             for (var i in properties) {
//                 var p = <def.Property>properties[i];
//                 var range = p.range();
//                 var ptype = p.range().nameId();
//                 //console.log('  prop ' + p.nameId() + ': ' + ptype);
//                 example[p.nameId()] = this.makeValueFor(p);
//                 //TODO multiple inheritance
//             }
//             //console.log('  example: ' + JSON.stringify(example));
//         }
//         return example;
//     }
//
//     generateTypeExpression(expression: string) {
//         if(!expression || expression == 'object') {
//             return {};
//         }
//         var expressions = gu.toArray(expression);
//         if(expressions.length == 1) {
//             var exp = expressions[0];
//             //console.log('parse: ' + exp);
//             var parsed = typeExpression.parse(exp);
//             //console.log('parsed: ' + JSON.stringify(parsed));
//             var ex = this.generateTypeExpByParsed(parsed);
//             return ex;
//         } else {
//             var example = {};
//             expressions.forEach(exp=> {
//                 //var ex = this.generateTypeExpression(sup);
//                 var parsed = typeExpression.parse(exp);
//                 var ex = this.generateTypeExpByParsed(parsed);
//                 //console.log('  supertype ' + sup + ': ' + JSON.stringify(ex));
//                 _.extend(example, ex);
//             });
//             return example;
//         }
//     }
//
// }
