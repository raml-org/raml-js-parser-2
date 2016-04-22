/// <reference path="../../../typings/main.d.ts" />

import _= require("underscore");

var DOMParser = require('xmldom').DOMParser;

var base64 = require('base64url');

export interface ValidationIssue {
    message : string;
}

export interface IncludeReference {
    getFragments(): string[];
    getIncludePath(): string;
    asString(): string;
    encodedName(withExtention?: boolean): string;
}

export interface ResolvedReference {
    /**
     * For textual resolvers should be a string,
     * for code references should return AST fragment.
     */
    content : any;

    /**
     * Validation results. Empty if no errors occured.
     */
    validation : ValidationIssue[];
}

export interface IncludeReferenceResolver {
    /**
     * Checks whether this resolver is applicable to the content
     * @param includePath - main portion of include path, should not contain the reference
     * @param content - include's contents
     */
    isApplicable(includePath: string, content: string) : boolean

    /**
     * Resolves include reference.
     * @param content
     * @param reference
     */
    resolveReference(content: string, reference : IncludeReference) : ResolvedReference;

    /**
     * Proposes potential completion for the reference.
     * @param content
     * @param reference
     */
    completeReference(content: string, reference : IncludeReference) : string[];
}


/**
 * Gets pure include path portion from the complete include.
 * Does not include the reference part.
 * @param includeString
 */
export function getIncludePath(includeString : string) : string {
    if(!includeString) {
        return includeString;
    }

    var index = includeString.indexOf("#");

    if (index == -1) return includeString;

    return includeString.substring(0, index);
}

/**
 * Gets reference portion of the include string and returns it as
 * an array of segments. Returns null of no reference is contained in the include.
 * @param includeString
 */
export function getIncludeReference(includeString : string) : IncludeReference {
    if(!includeString) {
        return null;
    }

    var index = includeString.indexOf("#");

    if (index == -1) return null;

    var referenceString = index == includeString.length - 1 ? "" : includeString.substring(index + 1, includeString.length);
    var segments = referenceString.split("/");
    if (segments.length == 0) return null;

    if (segments[0].trim() == "") {
        segments.splice(0,1);
    }

    return new IncludeReferenceImpl(referenceString, getIncludePath(includeString), segments);
}

/**
 * Factory method returning all include reference resolvers, registered in the system.
 */
export function getIncludeReferenceResolvers() : IncludeReferenceResolver[] {
    return [new JSONResolver(), new XMLResolver()];
}

/**
 * Checks all resolvers, finds the suitable one, resolves the reference and returns the result
 * of resolving. Returns null if no suitable resolver is found or resolver itself fails to resolve.
 * @param includeString - complete include string
 * @param content - include contents
 */
export function resolveContents(includeString: string, content?: string) : any {
    if (!includeString) {
        return content;
    }

    var reference = getIncludeReference(includeString)

    if (!reference) {
        return content;
    }

    var includePath = getIncludePath(includeString);

    return resolve(includePath, reference, content).content;
}

/**
 * Checks all resolvers, finds the suitable one, resolves the reference and returns the result
 * of resolving. Returns null if no suitable resolver is found or resolver itself fails to resolve.
 * @param includePath
 * @param includeReference
 * @param content
 */
export function resolve(includePath: string,
                                    includeReference : IncludeReference, content: string) : ResolvedReference {

    var resolver : IncludeReferenceResolver = _.find(getIncludeReferenceResolvers(),
            currentResolver=>currentResolver.isApplicable(includePath,content));

    if (!resolver) return {
        content: content,
        validation: []
    };

    return resolver.resolveReference(content, includeReference);
}

export function completeReference(includePath: string,
                        includeReference : IncludeReference, content: string) : string[] {

    if (!content) {
        return []
    }

    var resolver : IncludeReferenceResolver = _.find(getIncludeReferenceResolvers(),
            currentResolver=>currentResolver.isApplicable(includePath,content));

    if (!resolver) return []

    return resolver.completeReference(content, includeReference);
}


class IncludeReferenceImpl implements IncludeReference{
    segments : string[]
    originalString : string

    constructor(originalString : string, private includePath: string, segments : string[]) {
        this.segments = segments;
        this.originalString = originalString;
    }

    getIncludePath() {
        return this.includePath;
    }

    getFragments() : string[] {
        return this.segments;
    }

    asString() : string {
        return this.originalString;
    }

    encodedName(withExtention: boolean = true): string {
        return base64(this.includePath + '/' + this.asString()) + (withExtention ? this.includePath.substring(this.includePath.lastIndexOf('.')) : '');
    }
}

class JSONResolver implements IncludeReferenceResolver {
    isApplicable(includePath: string, content: string) : boolean {
        return includePath && (endsWith(includePath.trim(), '.js') || endsWith(includePath.trim(), '.json'));
    }

    resolveReference(content: string, reference : IncludeReference) : ResolvedReference {
        try {
            var resultJson = {};

            resultJson['$ref'] = reference.getIncludePath() + '#' + reference.asString();

            return {
                content: JSON.stringify(resultJson, null, 2),
                validation: []
            };

        } catch (Error) {
            console.log(Error);
        }

        return {
            content: content,
            validation: []
        };
    }

    completeReference(content: string, reference : IncludeReference) : string[] {
        try {
            var jsonRoot = JSON.parse(content);
            var fragments = reference.getFragments();
            if (!fragments || fragments.length == 0) {
                return this.getChildren(jsonRoot);
            }

            var currentJSON = jsonRoot;

            var emptyPrefixCompletion = reference.asString().lastIndexOf("/") == reference.asString().length - 1;
            var limit =  emptyPrefixCompletion ? fragments.length : fragments.length - 1;
            for (var i = 0; i < fragments.length - 1; i++) {
                var fragment = fragments[i];

                currentJSON = this.findChild(currentJSON, fragment);
                if (!currentJSON) {
                    return [];
                }
            }

            if (emptyPrefixCompletion) {
                return this.getChildren(currentJSON);
            } else {
                var lastPrefix = fragments[fragments.length - 1];
                var result = []

                this.getChildren(currentJSON).forEach(child=>{
                    if(child.indexOf(lastPrefix)==0) {
                        result.push(child);
                    }
                });

                return result;
            }

        } catch (Error) {
            console.log(Error);
        }

        return []
    }


    private findChild(jsonObject, fragment : string) {
        var decoded = fragment.replace('~1', '/');
        decoded = fragment.replace('~0', '~');

        return jsonObject[decoded];
    }

    private getChildren(jsonObject) : string[] {
        return Object.keys(jsonObject);
    }
}

class XMLResolver implements IncludeReferenceResolver {
    isApplicable(includePath: string, content: string) : boolean {
        return includePath && (endsWith(includePath.trim(), '.xml') || endsWith(includePath.trim(), '.xsd'));
    }

    resolveReference(content: string, reference : IncludeReference) : ResolvedReference {
        try {
            var doc = new DOMParser().parseFromString(content);

            var requestedName = reference.asString();

            var uniqueName:string = reference.encodedName(false);

            var schema = elementChildrenByName(doc, 'xs:schema')[0];

            var elements:any[] = elementChildrenByName(schema, 'xs:element');

            var types:any[] = elementChildrenByName(schema, 'xs:complexType');

            var canBeElement = _.find(elements, (element:any) => element.getAttribute('name') === requestedName);

            var canBeType = canBeElement ? _.find(types, (type:any) => type.getAttribute('name') === canBeElement.getAttribute('type')) : _.find(types, (type:any) => type.getAttribute('name') === requestedName);

            var element:any = doc.createElement('xs:element');

            element.setAttribute('name', uniqueName);
            
            if(canBeType) {
                element.setAttribute('type', canBeType.getAttribute('name'));
            }

            if(canBeElement) {
                element.setAttribute('originalname', canBeElement.getAttribute('name'));
            }

            element.setAttribute('requestedname', requestedName);
            
            element.setAttribute('extraelement', 'true');

            schema.appendChild(element);
            
            return {
                content: doc.toString(),
                validation: []
            };
        } catch(throwable) {
            console.log(throwable);
        }

        return {
            content: content,
            validation: []
        };
    }

    completeReference(content: string, reference : IncludeReference) : string[] {
        try {
            var doc = new DOMParser().parseFromString(content);

            var result = [];

            var schema = elementChildrenByName(doc, 'xs:schema')[0];

            var elements:any[] = elementChildrenByName(schema, 'xs:element');

            var types:any[] = elementChildrenByName(schema, 'xs:complexType');

            elements.forEach(element => result.push(element.getAttribute('name')));
            types.forEach(type => result.push(type.getAttribute('name')));

            var emptyPrefixCompletion = reference.asString().trim().length === 0;

            if (emptyPrefixCompletion) {
                return result;
            } else {
                return result.filter(value => value.indexOf(reference.asString()) === 0);
            }
        } catch(exception) {
            return [];
        }
    }
}

function endsWith(input: string, ends: string) {
    if(!input) {
        return false;
    }

    if(!ends) {
        return false;
    }

    return input.lastIndexOf(ends) === (input.length - ends.length);
}

function elementChildrenByName(parent: any, tagName: string): any[] {
    var elements = parent.getElementsByTagName(tagName);

    var result: any[] = [];

    for(var i: number = 0; i < elements.length; i++) {
        var child = elements[i];

        if(child.parentNode === parent) {
            result.push(child);
        }
    }

    return result;
}