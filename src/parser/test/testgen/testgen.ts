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
//
// //TODO facets
//
// class Range {
//
// 	static Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
// 	constructor(private min: number, private max: number) {
// 	}
//
// 	num(): number {
// 		return Math.floor(this.min + Math.random() * (this.max-this.min)+0.5);
// 	}
//
// 	char(): string {
// 		return Range.Alphabet.charAt(this.num());
// 	}
//
// 	static all(): Range {
// 		return new Range(0, Range.Alphabet.length-1);
// 	}
//
// 	static nums(): Range {
// 		return new Range(Range.Alphabet.indexOf('0'), Range.Alphabet.indexOf('9'));
// 	}
//
// 	static alpha(): Range {
// 		return new Range(Range.Alphabet.indexOf('A'), Range.Alphabet.indexOf('z'));
// 	}
//
// 	static upper(): Range {
// 		return new Range(Range.Alphabet.indexOf('A'), Range.Alphabet.indexOf('Z'));
// 	}
//
// 	static lower(): Range {
// 		return new Range(Range.Alphabet.indexOf('a'), Range.Alphabet.indexOf('z'));
// 	}
//
// }
//
// class Random {
//
// 	str(range: Range, len: number): string {
// 		var text = '';
// 		for(var i=0; i<len; i++ )
// 			text += range.char();
// 		return text;
// 	}
//
// 	name(): string {
// 		return this.str(Range.lower(), 5);
// 	}
//
// 	typename(): string {
// 		return textutil.capitalize(this.str(Range.lower(), 5));
// 	}
//
// 	num(max: number) {
// 		return new Range(0,max).num();
// 	}
//
// 	bool(): boolean {
// 		return this.num(1) == 1;
// 	}
//
// }
//
// var rand = new Random();
//
// export class RamlTypeGen {
//
// 	static ValueTypes = ['string', 'number', 'boolean'];
// 	static BasicTypes = ['string', 'number', 'boolean', 'object', 'type'];
//
// 	static NumberOfProperties = 2;
// 	static Levels = 1;
//
// 	typeman: gu.TypeManager;
//
// 	constructor(private api: parser.Api) {
// 		this.typeman = new gu.TypeManager(api);
// 	}
//
// 	isUnionType(type: parser.TypeDeclaration): boolean {
// 		//console.log('Test union ' + type.name() + '{');
// 		var types = gu.toArray(type.type()[0]);
// 		//console.log('  types: ' + JSON.stringify(types));
// 		for(var i in types) {
// 			var name = types[i];
// 			if(name.indexOf('|')>=0) {
// 				//console.log('  union1: ' + type.name());
// 				return true;
// 			}
// 			var t = this.typeman.lookupType(name);
// 			if(t) {
// 				if(this.isUnionType(t)) {
// 					//console.log('  union2: ' + type.name());
// 					return true;
// 				}
// 			}
// 		}
// 		//console.log('} //' + type.name() + ' not a union');
// 		return false;
// 	}
//
// 	generateType(name: string = null) {
// 		if(!name) name = rand.typename();
// 		var type = new parser.ObjectTypeDeclarationImpl(name);
// 		var names = this.typeman.typenames();
// 		var t = gu.generateTypeTypeExpression(names);
// 		type.setType(t);
// 		if(!this.isUnionType(type)) {
// 			this.generatePropertis(type);
// 		}
// 		//this.api.addToProp(type, 'types');
// 		var example = new exgen.ExampleGenerator(this.typeman).generate(type);
// 		type.setExample(JSON.stringify(example, null,2));
// 		//console.log('register type: ' + name + ' ' + type.constructor.name);
// 		//this.typeman.listApiTypes('List1');
// 		this.typeman.addType(name, type);
// 		//console.log('register type2: ' + name + ' ' + this.typeman.findModelType(name));
// 		//this.typeman.listApiTypes('List2');
// 	}
//
// 	generatePropertis(type: parser.ObjectTypeDeclarationImpl, lev: number=0) {
// 		var imap = {};
// 		for(var i: number=0; i<RamlTypeGen.NumberOfProperties; i++) {
// 			var property = <parser.TypeDeclarationImpl>this.makeProperty(type.name(), imap, lev);
// 			type.addToProp(property, 'properties');
// 		}
// 	}
//
// 	generateFacets(property: parser.ObjectTypeDeclaration, type: string) {
// 		//TODO generate facets
// 	}
//
// 	makeNamePrefix(type: string): string {
// 		switch(type) {
// 			case 'string':
// 				return 'str';
// 			case 'number':
// 				return 'num';
// 			case 'boolean':
// 				return 'bool';
// 			default:
// 				return "prop";
// 				//return type.toLowerCase();
// 		}
// 	}
//
// 	makePropertyName(basename: string, imap: any, type: string): string {
// 		var prefix = basename.toLowerCase() + '_' + this.makeNamePrefix(type);
// 		var no = imap[prefix];
// 		if(!no) {
// 			no = 1;
// 		} else {
// 			no++;
// 		}
// 		imap[prefix] = no;
// 		return prefix + "_" + no; //rand.name();
// 	}
//
// 	makeProperty(basename: string, imap: any, lev: number): parser.TypeDeclaration {
// 		var type = this.randomPropertyType();
// 		if(type == 'type') {
// 			var names = this.typeman.typenames();
// 			if(names.length == 0) {
// 				type = 'object';
// 			} else {
// 				type = gu.generatePropTypeExpression(names);
// 			}
// 		}
// 		var property =  new parser.ObjectTypeDeclarationImpl(this.makePropertyName(basename, imap, type));
// 		property.setType(type);
// 		switch(type) {
// 			case 'object':
// 				if(lev < RamlTypeGen.Levels-1) {
// 					this.generatePropertis(property, lev+1);
// 				}
// 				break;
// 			default:
// 				this.generateFacets(property, type);
// 				break;
// 		}
// 		return property;
// 	}
//
// 	randomPropertyType(): string {
// 		var num = rand.num(RamlTypeGen.BasicTypes.length-1);
// 		return RamlTypeGen.BasicTypes[num];
// 	}
//
// 	text(): string {
// 		return this.api.highLevel().lowLevel().unit().contents();
// 	}
//
// }
//
//
//



