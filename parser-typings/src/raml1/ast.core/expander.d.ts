/// <reference path="../../../typings/main.d.ts" />
import ll = require("../lowLevelAST");
import hl = require("../highLevelAST");
import hlimpl = require("../highLevelImpl");
export declare function expandTraitsAndResourceTypes<T>(api: T): T;
export declare function mergeAPIs(masterUnit: ll.ICompilationUnit, extensionsAndOverlays: ll.ICompilationUnit[], mergeMode: hlimpl.OverlayMergeMode): hl.IHighLevelNode;
export declare function getTransformNames(): string[];
export declare function getTransformerForOccurence(occurence: string): any;
