/// <reference path="../../typings/main.d.ts" />
import core = require("../raml1/wrapped-ast/parserCore");
export declare function dump(node: core.BasicNode | core.AttributeNode, serializeMeta?: boolean): any;
export declare class TCKDumper {
    private options;
    constructor(options?: SerializeOptions);
    private transformers;
    private ignore;
    private missingProperties;
    printMissingProperties(): string;
    dump(node: any): any;
    dumpInternal(node: any, rootNodeDetails?: boolean): any;
    private dumpErrors(errors);
    private dumpProperties(props, node);
    serializeMeta(obj: any, node: core.BasicNode | core.AttributeNode): void;
    serializeTypeInstance(inst: core.TypeInstanceImpl): any;
    serializeTypeInstanceProperty(prop: core.TypeInstancePropertyImpl): any;
    isDefined(node: any, name: any): boolean;
}
export interface SerializeOptions {
    /**
     * For root nodes additional details can be included into output. If the option is set to `true`,
     * node content is returned as value of the **specification** root property. Other root properties are:
     *
     * * **ramlVersion** version of RAML used by the specification represented by the node
     * * **type** type of the node: Api, Overlay, Extension, Library, or any other RAML type in fragments case
     * * **errors** errors of the specification represented by the node
     * @default false
     */
    rootNodeDetails?: boolean;
    /**
     * Whether to serialize metadata
     * @default true
     */
    serializeMetadata?: boolean;
}
