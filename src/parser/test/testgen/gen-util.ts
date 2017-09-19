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
// import typeExpression=require("../../ast.core/typeExpressionParser")
//
// //TODO facets
//
// export class TypeManager {
//
// 	types: any;
//
// 	constructor(private api: parser.Api) {
// 		this.types = this.allTypes();
// 	}
//
// 	allTypes() {
// 		var modelTypes = this.api.types();
// 		var types = {};
// 		//console.log('Collect types');
// 		modelTypes.forEach(type=>{
// 			//console.log('  type: ' + type.name() + ' ' + type.constructor.name);
// 			types[type.name()] = type;
// 		});
// 		return types;
// 	}
//
// 	/*
// 	listApiTypes(msg?: string) {
// 		if(!msg) msg = 'List types';
// 		var modelTypes = this.api.types();
// 		console.log(msg);
// 		modelTypes.forEach(type=>{
// 			console.log('  type: ' + type.name() + ' ' + type.constructor.name);
// 		});
// 	}
// 	*/
//
// 	findModelType(name: string) {
// 		var modelTypes = this.api.types();
// 		var found = null;
// 		for(var i in modelTypes) {
// 			var type = modelTypes[i];
// 			if(type.name() == name) {
// 				found = type;
// 			}
// 		}
// 		return found;
// 	}
//
// 	registerType(name: string, type: parser.TypeDeclaration) {
// 		//console.log('register type: ' + name + ' ' + type.constructor.name);
// 		this.types[name] = type;
// 	}
//
// 	registeredType(name: string): parser.ObjectTypeDeclaration {
// 		return this.types[name];
// 	}
//
// 	lookupType(name: string): parser.ObjectTypeDeclaration {
// 		return this.types[name];
// 	}
//
// 	newTypeName(name?: string): string {
// 		if(!name) name = "Type";
// 		if(!this.registeredType(name)) return name;
// 		var no = 1;
// 		while(this.registeredType(name+no)) no++;
// 		return name + no;
// 	}
//
// 	addType(typename: string, type: parser.ObjectTypeDeclaration) {
// 		//console.log('add type: ' + type.name());
// 		(<parser.ApiImpl>this.api).addToProp(<parser.ObjectTypeDeclarationImpl>type, 'types');
// 		this.registerType(typename, type);
// 	}
//
// 	typenames(): string[] {
// 		var names = [];
// 		for(var name in this.types) {
// 			names.push(name);
// 		}
// 		return names;
// 	}
//
// }
//
// export class CustomTypeGen implements bnfgen.IRuleGenerator {
//
// 	used: Set<string>;
//
// 	constructor(private names: string[]) {
// 		this.used = new Set<string>();
// 	}
//
// 	rand(len: number):any {
// 		var no = Math.floor(Math.random() * len);
// 		return no;
// 	}
//
// 	randExcept(names: string[], used: Set<string>):string {
// 		var unused = [];
// 		for(var i=0; i<names.length; i++) {
// 			var name = names[i];
// 			if(!used.has(name)) unused.push(name);
// 		}
// 		var no = this.rand(unused.length);
// 		return unused[no];
// 	}
//
// 	generate(name: string, lev: number): string {
// 		if(name == 'custom') {
// 			if(this.used.size >= this.names.length) {
// 				//console.log('custom: none');
// 				throw new bnfgen.RejectToGenerateException('no free types');
// 			}
// 			var xname = this.randExcept(this.names, this.used);
// 			this.used.add(xname);
// 			//console.log('custom: ' + xname);
// 			return xname;
// 		}
// 		return undefined;
// 	}
// }
//
//
// export class TypeExpressionGenerator {
//
// 	bnf: string;
//
// 	constructor(private grampath: string, private names: string[]){
// 		this.bnf = fs.readFileSync(grampath, 'utf8');
// 	}
//
// 	generate(): string {
// 		var typegen = new CustomTypeGen(this.names);
// 		var gen = new bnfgen.BnfGen(this.bnf, typegen);
// 		var text = gen.generate("expr");
// 		return text;
// 	}
//
// }
//
// export function generatePropTypeExpression(names: string[]): string {
// 	return new TypeExpressionGenerator(util.data('gram/prop-type-exp.abnf'), names).generate();
// }
//
// export function generateTypeTypeExpression(names: string[]): string {
// 	return new TypeExpressionGenerator(util.data('gram/type-type-exp.abnf'), names).generate();
// }
//
// export function generateResTypeExpression(names: string[]): string {
// 	//return new TypeExpressionGenerator(util.data('gram/res-type-exp.abnf'), names).generate();
// 	return new TypeExpressionGenerator(util.data('gram/type-type-exp.abnf'), names).generate();
// }
//
// export function toArray(exp: string): string[] {
// 	if(!exp) return [];
// 	exp = textutil.trim(exp);
// 	var exps = [exp];
// 	if(exp.indexOf('[')==0) {
// 		exp = exp.substr(1, exp.length-2);
// 		//console.log('array: ' + exp);
// 		exps = exp.split(',');
// 	} else {
// 		//console.log('exp: ' + exp);
// 	}
// 	return exps;
// }
//
