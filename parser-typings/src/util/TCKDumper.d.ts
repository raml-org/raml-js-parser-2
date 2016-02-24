/// <reference path="../../typings/main.d.ts" />
import core = require("../raml1/wrapped-ast/parserCore");
export declare function dump(node: core.BasicNode | core.AttributeNode, serializeMeta?: boolean): any;
export declare class TCKDumper {
    private dumpMeta;
    constructor(dumpMeta?: boolean);
    private transformers;
    private ignore;
    private missingProperties;
    printMissingProperties(): string;
    dump(node: any, dumpErrors?: boolean): any;
    private dumpErrors(errors);
    private dumpProperties(props, node);
    serializeMeta(obj: any, node: core.BasicNode | core.AttributeNode): void;
    serializeTypeInstance(inst: core.TypeInstanceImpl): any;
    serializeTypeInstanceProperty(prop: core.TypeInstancePropertyImpl): any;
    isDefined(node: any, name: any): boolean;
}
