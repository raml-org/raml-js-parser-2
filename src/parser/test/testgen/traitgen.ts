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
// import typegen = require('./testgen')
// import exgen = require('./exgen')
// import typeExpression=require("../../ast.core/typeExpressionParser")
// import gu = require('./gen-util')
//
// export class TraitGenerator {
//
//     typeman: gu.TypeManager;
//
//     constructor(private api: parser.Api) {
//         this.typeman = new gu.TypeManager(api);
//         //this.typeman.listApiTypes('On Resources')
//     }
//
//     baseTypeProperty(name: string) {
//         var types = typegen.RamlTypeGen.ValueTypes;
//         var no = Math.floor(Math.random() * types.length);
//         var type = types[no];
//         var prop = new parser.TypeDeclarationImpl(name);
//         prop.setType(type);
//         return prop;
//     }
//
//     query(trait: parser.TraitImpl) {
//         for(var i=1; i<=5; i++) {
//             trait.addToProp(this.baseTypeProperty('qp'+i), 'queryParameters');
//         }
//     }
//
//     generate(name: string) {
//         var trait = new parser.TraitImpl(name);
//         this.query(trait);
//         (<parser.ApiImpl>this.api).addToProp(trait, 'traits');
//     }
//
//     text(): string {
//         return this.api.highLevel().lowLevel().unit().contents();
//     }
//
// }
