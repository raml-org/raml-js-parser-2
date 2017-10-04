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
//
// export class RejectToGenerateException {
// 	message: string;
// 	constructor(message: string) {
// 		this.message = message || "Rejected to generate";
// 	}
// }
//
// export interface IRuleGenerator {
// 	// throws exception if couldn't generate proper value
// 	generate(name: string, lev: number): string;
// }
//
// export class BnfGen {
//
// 	static LevLim = 5;
//
// 	rules:any;
//
// 	constructor(private bnf:string, private rulegen?: IRuleGenerator, random?: ()=>number) {
// 		this.rules = abnf.Parse(bnf);
// 		//console.log('RULES:\n' + JSON.stringify(this.rules, null, 2));
// 		if(random) {
// 			this.random = random;
// 		}
// 	}
//
// 	random() {
// 		return Math.random();
// 	}
//
// 	rand(len: number):any {
// 		var no = Math.floor(this.random() * len);
// 		return no;
// 	}
//
// 	randExcept(len: number, used: Set<number>):any {
// 		var unused = [];
// 		for(var i=0; i<len; i++) {
// 			if(!used.has(i)) unused.push(i);
// 		}
// 		var no = this.rand(unused.length);
// 		return unused[no];
// 	}
//
// 	select(choices:any[]):any {
// 		//var no = Math.floor(Math.random() * choices.length);
// 		return choices[this.rand(choices.length)];
// 	}
//
// 	rule(name: string): any {
// 		var rule = this.rules.defs[name.toUpperCase()];
// 		if(!rule) throw "No rule " + name + ' defined';
// 		return rule;
// 	}
//
// 	repeat(def: any, min: number, max: number, lev: number): string {
// 		var no = min + this.rand(max-min+1);
// 		if(lev > BnfGen.LevLim) no = 0;
// 		//console.log('SEL: ' + typeof def.alts);
// 		var res = '';
// 		for(var i=0; i<no; i++) {
// 			try {
// 				var generated = this.generateDef(def, lev);
// 				res += generated;
// 			} catch(x) {
// 				if(x instanceof RejectToGenerateException) {
// 					//console.log('REJECTED: ' + x.message);
// 				} else {
// 					console.log('exception: ' + x);
// 					throw x;
// 				}
// 			}
//
// 		}
// 		return res;
// 	}
//
// 	choose(defs: any, lev: number) {
// 		var used = new Set();
// 		while(used.size < defs.length) {
// 			try {
// 				var no = this.randExcept(defs.length, used);
// 				//var no = this.rand(defs.length);
// 				var generated = this.generateDef(defs[no], lev);
// 				return generated;
// 			} catch (x) {
// 				if (x instanceof RejectToGenerateException) {
// 					//console.log('REJECTED: ' + x.message);
// 					used.add(no);
// 				} else {
// 					throw x;
// 				}
// 			}
// 		}
// 		throw new RejectToGenerateException("No choices left");
// 	}
//
// 	generateDef0(def: any, lev: number): string {
// 		var array = (def.constructor === Array);
// 		if(def.alt) {
// 			//console.log('ALT: ' + typeof def.alt);
// 			return this.generateDef(def.alt, lev);
// 		}
// 		if(def.alts) {
// 			//console.log('SEL: ' + typeof def.alts);
// 			var a = <any[]> def.alts;
// 			return this.choose(a, lev);
// 		}
// 		if(def.name) {
// 			return this.generateRuleWithName(def.name, lev);
// 		}
// 		if(def.rep) {
// 			var min = def.rep.min;
// 			var max = def.rep.max;
// 			return this.repeat(def.el, min, max, lev);
// 		}
// 		if(array) {
// 			var a = <any[]> def;
// 			var res = '';
// 			a.forEach(e=> res += this.generateDef(e, lev));
// 			return res;
// 		}
// 		if(typeof def == 'string') {
// 			return def;
// 		}
// 		console.log('UNKNOWN: ' + JSON.stringify(def));
// 		return "<???>";
// 	}
//
// 	generateDef(def: any, lev: number): string {
// 		//console.log(textutil.indent(lev, 'GENERATE: ' + JSON.stringify(def)));
// 		var res = this.generateDef0(def,lev);
// 		//console.log(textutil.indent(lev, 'GENERATED: ' + JSON.stringify(def) + " ==> " + res));
// 		return res;
// 	}
//
// 	generateRuleWithName(name: string, lev: number): string {
// 		var rule = this.rule(name);
// 		//console.log('zzz: ' + name + '; rulegen: ' + this.rulegen);
// 		if(!this.rulegen) {
// 			return this.generateRule(rule, lev);
// 		}
// 		var res = this.rulegen.generate(name,lev);
// 		if(res) {
// 			return res;
// 		}
// 		if(res === undefined) {
// 			return this.generateRule(rule, lev);
// 		}
// 		return undefined;
// 	}
//
// 	generateRule(rule: any, lev: number): string {
// 		if(!rule.def) throw "rule should contain def element: " + JSON.stringify(rule);
// 		return this.generateDef(rule.def, lev+1);
// 	}
//
// 	generate(name: string): string {
// 		return this.generateRuleWithName(name, 0);
// 	}
//
// }
