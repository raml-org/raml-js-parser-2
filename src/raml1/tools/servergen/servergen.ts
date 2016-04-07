/// <reference path="../../../../typings/main.d.ts" />
import fs = require("fs")
import path = require("path")
import mkdirp = require('mkdirp');
var simplet = require('simplet');
//import pluralize = require('pluralize')

import parser = require("../../artifacts/raml10parserapi");
import parserImpl = require("../../artifacts/raml10parser");


export class ServerGenerator {

	static Files = [
		'package.json'
	];

	static TypeMap = {
		'string': 'String',
		'number': 'Number',
		'boolean': 'Boolean'
	};

	constructor(private templateDir: string) {
	}

	copyfile(source: string, dest: string) {
		fs.createReadStream(source).pipe(fs.createWriteStream(dest));
	}

	copy(targetDir: string) {
		ServerGenerator.Files.forEach(file=> {
			var source = path.resolve(this.templateDir, file);
			var dest = path.resolve(targetDir, file);
			this.copyfile(source, dest);
		});
	}

	render(source: string, context: any): string {
		var engine = new simplet();
		var template = fs.readFileSync(source, 'utf-8');
		engine.template('model-template', template);
		var text = engine.render('model-template', context);
		engine.clear('model-template');
		return text;
	}

	renderFile(source: string, dest: string, context: any) {
		var text = this.render(source, context);
		//console.log('generated: ' + text);
		fs.writeFileSync(dest, text, 'utf-8');
	}

	generateSchema(type: parser.ObjectTypeDeclaration): any {
		var schema = {};
			//xtitle: {type: String, required: true},
			//author: {type: String, required: true},
			//description: {type: String, required: true},
		type.properties().forEach(prop=>{
			var p = <parserImpl.ObjectTypeDeclarationImpl>prop;
			var po = {};
			var type = ServerGenerator.TypeMap[p.type()[0]];
			if(!type) type = 'String';
			po['type'] = type;
			var optional = p.optional();
			if(optional == null || optional == undefined) optional = false;
			po['required'] = !optional;
			schema[p.name()] = po;
		});
		return schema;
	}

	generateImports(name: string) {
		var res = '';
		res += "var " + name + " = require('./model/" + name + "');\n";
		return res;
	}

	generateRoutes(name: string) {
		var res = '';
		res += "app.use('/" + name + "', " + name + ");\n";
		return res;
	}

	generateMain(targetDir: string, type: parser.ObjectTypeDeclaration) {
		var templateFile = path.resolve(this.templateDir, 'src/main-template.js');
		//var template = fs.readFileSync(templateFile, 'utf-8');
		//console.log('template: \n' + template);
		//engine.template('model-template', template);
		var name = type.name().toLowerCase();
		var outputFile = path.resolve(targetDir, 'src/main.js');
		//var pluralName = pluralize(name);
		//var schema = JSON.stringify(this.generateSchema(type), null, 2);
		var context = {
			imports: this.generateImports(name),
			routes: this.generateRoutes(name)
		};
		this.renderFile(templateFile, outputFile, context);
	}

	generateModel(targetDir: string, type: parser.ObjectTypeDeclaration) {
		//var engine = simplet();
		var templateFile = path.resolve(this.templateDir, 'src/model/model-template.js');
		//var template = fs.readFileSync(templateFile, 'utf-8');
		//console.log('template: \n' + template);
		//engine.template('model-template', template);
		var name = type.name().toLowerCase();
		var outputFile = path.resolve(targetDir, 'src/model/' + name + '.js');
		//var pluralName = pluralize(name);
		var schema = JSON.stringify(this.generateSchema(type), null, 2);
		var context = {
			name: name,
			//pluralName: pluralName,
			schema: schema
		};
		this.renderFile(templateFile, outputFile, context);
	}

	generate(targetDir: string, type: parser.ObjectTypeDeclaration) {
		console.log('template: ' + this.templateDir);
		console.log('output  : ' + targetDir);
		mkdirp.sync(targetDir);
		mkdirp.sync(path.resolve(targetDir, 'src'));
		mkdirp.sync(path.resolve(targetDir, 'src/model'));
		this.copy(targetDir);
		this.generateModel(targetDir, type);
		this.generateMain(targetDir, type);
	}

}