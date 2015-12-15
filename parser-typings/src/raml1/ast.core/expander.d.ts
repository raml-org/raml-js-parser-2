/// <reference path="../../../typings/tsd.d.ts" />
import ll = require("../lowLevelAST");
import hl = require("../highLevelAST");
import hlimpl = require("../highLevelImpl");
export declare function expandTraitsAndResourceTypes<T>(api: T): T;
export declare function mergeAPIs(masterUnit: ll.ICompilationUnit, extensionsAndOverlays: ll.ICompilationUnit[], mergeMode: hlimpl.OveralMergeMode): hl.IHighLevelNode;
export declare function getTransformNames(): string[];
