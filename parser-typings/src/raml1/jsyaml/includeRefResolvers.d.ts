/// <reference path="../../../typings/main.d.ts" />
export interface ValidationIssue {
    message: string;
}
export interface IncludeReference {
    getFragments(): string[];
    getIncludePath(): string;
    asString(): string;
    encodedName(): string;
}
export interface ResolvedReference {
    /**
     * For textual resolvers should be a string,
     * for code references should return AST fragment.
     */
    content: any;
    /**
     * Validation results. Empty if no errors occured.
     */
    validation: ValidationIssue[];
}
export interface IncludeReferenceResolver {
    /**
     * Checks whether this resolver is applicable to the content
     * @param includePath - main portion of include path, should not contain the reference
     * @param content - include's contents
     */
    isApplicable(includePath: string, content: string): boolean;
    /**
     * Resolves include reference.
     * @param content
     * @param reference
     */
    resolveReference(content: string, reference: IncludeReference): ResolvedReference;
    /**
     * Proposes potential completion for the reference.
     * @param content
     * @param reference
     */
    completeReference(content: string, reference: IncludeReference): string[];
}
/**
 * Gets pure include path portion from the complete include.
 * Does not include the reference part.
 * @param includeString
 */
export declare function getIncludePath(includeString: string): string;
/**
 * Gets reference portion of the include string and returns it as
 * an array of segments. Returns null of no reference is contained in the include.
 * @param includeString
 */
export declare function getIncludeReference(includeString: string): IncludeReference;
/**
 * Factory method returning all include reference resolvers, registered in the system.
 */
export declare function getIncludeReferenceResolvers(): IncludeReferenceResolver[];
/**
 * Checks all resolvers, finds the suitable one, resolves the reference and returns the result
 * of resolving. Returns null if no suitable resolver is found or resolver itself fails to resolve.
 * @param includeString - complete include string
 * @param content - include contents
 */
export declare function resolveContents(includeString: string, content?: string): any;
/**
 * Checks all resolvers, finds the suitable one, resolves the reference and returns the result
 * of resolving. Returns null if no suitable resolver is found or resolver itself fails to resolve.
 * @param includePath
 * @param includeReference
 * @param content
 */
export declare function resolve(includePath: string, includeReference: IncludeReference, content: string): ResolvedReference;
export declare function completeReference(includePath: string, includeReference: IncludeReference, content: string): string[];
