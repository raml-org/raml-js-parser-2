/// <reference path="../typings/main.d.ts" />
declare class Opt<T> {
    private _value;
    private _isDefined;
    private _isEmpty;
    private _arr;
    constructor(_value?: T);
    getOrThrow: () => T;
    value: () => T;
    isDefined: () => boolean;
    isEmpty: () => boolean;
    toArray: () => T[];
    getOrElse: (v: T) => T;
    getOrElseF: (v: () => T) => T;
    map: <U>(f: (value: T) => U) => Opt<U>;
    flatMap: <U>(f: (value: T) => Opt<U>) => Opt<U>;
    equals: (other: Opt<T>) => boolean;
    forEach(fn: (value: T) => any): void;
    /**
     * You can always create an empty option by hand just by calling new Opt<T>()
     * but calling this method will return a global instance instead of allocating a new one each time
     */
    static empty: <T>() => Opt<T>;
}
export = Opt;
