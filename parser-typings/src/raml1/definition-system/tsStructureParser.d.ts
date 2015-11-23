/// <reference path="../../../typings/tsd.d.ts" />
/**
 * Created by kor on 08/05/15.
 */
import ts = require("typescript");
import tsModel = require("./tsModel");
export declare function classDecl(name: string, isInteface: boolean): tsModel.ClassModel;
export declare function parseStruct(content: string, modules: {
    [path: string]: tsModel.Module;
}, mpth: string): tsModel.Module;
export declare function buildType(t: ts.TypeNode, path: string): tsModel.TypeModel;
