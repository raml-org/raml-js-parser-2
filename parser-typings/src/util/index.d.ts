/// <reference path="../../typings/main.d.ts" />
import Opt = require("../Opt");
export declare var defined: (x: any) => boolean;
export interface Dict<T> {
    [key: string]: T;
}
export interface Constructor<T> {
    new (...args: any[]): T;
}
/**
 * Arrays of Objects are common in RAML08.
 * @param x
 * @returns {{}}
 */
export declare function flattenArrayOfObjects<T>(x: {
    [key: string]: T;
}[]): {
    [key: string]: T;
};
export declare function find<T>(xs: T[], f: (T) => boolean): Opt<T>;
export declare var isInstance: <T>(v: any, C: Constructor<T>) => T[];
export declare var ifInstanceOf: <T>(v: any, C: Constructor<T>, f: (T: any) => void) => void;
export declare function toTuples<U>(map: {
    [key: string]: U;
}): Array<[string, U]>;
export declare function fromTuples<U>(tuples: Array<[string, U]>): {
    [key: string]: U;
};
export declare var collectInstancesOf: <T>(xs: any[], C: Constructor<T>) => T[];
export declare var collectInstancesOfInMap: <T>(map: any, C: Constructor<T>) => [string, T][];
export declare var asArray: <T>(v?: T | T[]) => T[];
export declare var shallowCopy: <T>(obj: Dict<T>) => Dict<T>;
export declare var flatMap: <T, U>(xs: T[], f: (T: any) => U[]) => U[];
export declare var flatten: <T>(xss: T[][]) => T[];
export declare var takeWhile: <T>(xs: T[], f: (T: any) => boolean) => T[];
export declare function tap<T>(v: T, f: (T) => void): T;
export declare function kv<T>(obj: Dict<T>, iter: {
    (string, T): void;
}): void;
export declare function indexed(objects: Array<Dict<any>>, key: string, delKey?: boolean): Dict<Dict<any>>;
export declare function stringEndsWith(str: string, search: string): boolean;
export declare function stringStartsWith(str: string, search: string): boolean;
export declare function lazypropkeyfilter(k: string): boolean;
export declare function lazyprops(obj: Object, keyfilter?: typeof lazypropkeyfilter): void;
export declare function iff<T>(v: T, f: {
    (T): void;
}): void;
export declare function isRAMLUrl(str: string): boolean;
export declare function getAllRequiredExternalModulesFromCode(code: string): string[];
export declare var serial: () => number;
export declare function isEssential(arg: any): boolean;
export declare function firstToUpper(q: string): string;
export declare function updateObject(source: any, target: any, addNewFields?: boolean): void;
/**
 * In 'str' replace all occurences of 'map' keys to their values.
 */
export declare function replaceMap(str: string, map: {
    [key: string]: string;
}): string;
/**
 * Replace all occurences of 'x' in 'str' to 'r' without thinking if 'x' can be passed without
 * escaping as argument to RegExp constructor
 */
export declare function replace(str: string, x: string, r: string): string;
