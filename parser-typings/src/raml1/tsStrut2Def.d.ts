/// <reference path="../../typings/tsd.d.ts" />
import tsStruct = require("./tsStructureParser");
import def = require("./definitionSystem");
export declare function toDefSystem(ts: tsStruct.Module): def.Universe;
export declare function recordAnnotation(p: def.Property, a: tsStruct.Annotation): void;
