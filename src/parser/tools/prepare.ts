/// <reference path="../../../typings/main.d.ts" />
import fs=require("fs")
import path=require("path");
var ps = path.resolve(__dirname, "../artifacts")

var cnt = fs.readFileSync(path.resolve(__dirname, "raml10factory.copy"));
fs.writeFileSync(path.resolve(ps, "raml10factory.ts"), cnt);

var cnt = fs.readFileSync(path.resolve(__dirname, "raml10parser.copy"));
fs.writeFileSync(path.resolve(ps, "raml10parser.ts"), cnt);

var cnt = fs.readFileSync(path.resolve(__dirname, "raml08factory.copy"));
fs.writeFileSync(path.resolve(ps, "raml08factory.ts"), cnt);

var cnt = fs.readFileSync(path.resolve(__dirname, "raml08parser.copy"));
fs.writeFileSync(path.resolve(ps, "raml08parser.ts"), cnt);
