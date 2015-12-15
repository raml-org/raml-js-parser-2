/// <reference path="../../../typings/tsd.d.ts" />
import hl = require("../highLevelAST");
import hlimpl = require("../highLevelImpl");
export declare function removeNodeFrom(source: hlimpl.ASTNodeImpl, node: hl.IParseResult): void;
export declare function initEmptyRAMLFile(node: hl.IHighLevelNode): void;
export declare function setValue(node: hlimpl.ASTPropImpl, value: string | hlimpl.StructuredValue): void;
export declare function addStringValue(attr: hlimpl.ASTPropImpl, value: string): void;
export declare function addStructuredValue(attr: hlimpl.ASTPropImpl, sv: hlimpl.StructuredValue): void;
export declare function removeAttr(attr: hlimpl.ASTPropImpl): void;
export declare function setValues(attr: hlimpl.ASTPropImpl, values: string[]): void;
export declare function setKey(node: hlimpl.ASTPropImpl, value: string): void;
export declare function createAttr(node: hlimpl.ASTNodeImpl, n: string, v: string): void;
export declare function addToNode(target: hlimpl.ASTNodeImpl, node: hl.IParseResult): void;
