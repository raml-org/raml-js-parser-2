import _ = require("underscore");
import Opt = require("../Opt");

export var defined = ( x ) => ( x !== null ) && ( x !== undefined )

export interface Dict<T> {
    [key: string] : T
}

export interface Constructor<T> {
  new( ...args: any[] ): T
}

/**
 * Arrays of Objects are common in RAML08.
 * @param x
 * @returns {{}}
 */
export function flattenArrayOfObjects<T>(x: {[key:string]: T}[]): {[key:string]: T }{
    var res: {[key: string]: T} = {}
    x.forEach( v => Object.keys( v ).forEach( k => res[k] = v[k] ) )
    return res;
}

export function find<T>( xs: T[], f: (T) => boolean ): Opt<T> {
    return new Opt( _.find( xs || [], f ) )
}

export var isInstance = <T>( v, C: Constructor<T> ): T[] => ( v instanceof C ) ? [<T>v] : []

export var ifInstanceOf = <T>( v, C: Constructor<T>, f: ( T ) => void ): void => ( v instanceof C ) ? f( <T> v ) : null

export function toTuples<U>( map: {[key: string]: U} ): Array<[string , U]> {
    return Object.keys( map ).map( k => <[string , U]>[ k, map[k] ] )
}

export function fromTuples<U>( tuples: Array<[string , U]> ): {[key: string]: U} {
    var obj: {[key: string]: U} = {};
    tuples.forEach( x => obj[x[0]] = x[1] )
    return obj
}

export var collectInstancesOf = <T>( xs: any[], C: Constructor<T> ): T[] => tap( <T[]>[], res => xs.forEach( v => ifInstanceOf( v, C, x => res.push( x ) ) ) )

export var collectInstancesOfInMap = <T>( map: any, C: Constructor<T> ): Array<[string, T]> => {
    return Object.keys( map ).map( k => [k, map[k]] ).filter( x => x[1] instanceof C ).map( x => <[string, T]> x )
}

export var asArray = <T>( v?: T | T[] ): T[] => defined(v) ? ( ( v instanceof Array ) ? <T[]>v : [<T>v] ) : []

export var shallowCopy = <T>( obj: Dict<T> ): Dict<T> => tap( <Dict<T>> {}, copy => Object.keys( obj ).forEach( k => copy[k] = obj[k] ) )

export var flatMap = <T, U>( xs: T[], f: (T) => U[] ): U[] => flatten( xs.map(f) )

export var flatten = <T>( xss:T[][] ): T[] => Array.prototype.concat.apply( [], xss )

export var takeWhile = <T>( xs: T[], f: (T) => boolean): T[] => tap( <T[]> [] , res => {
        for ( var i = 0; i < xs.length ; i++ ){
            if ( ! f(xs[i]) ) break;
            res.push( xs[i] )
        }
    })

export function tap<T>( v: T, f: (T) => void ): T {
    f( v );
    return v;
}

export function kv<T>( obj: Dict<T>, iter: {(string, T): void} ): void {
    if ( typeof obj === 'object') Object.keys( obj ).forEach( k => iter( k, obj[k] ) )
}

export function indexed( objects: Array<Dict<any>>, key: string, delKey: boolean = false ): Dict<Dict<any>> {
    var obj = <Dict<Dict<any>>>{};
    objects.forEach(original => {
        var copy = shallowCopy(original);
        if (delKey) delete copy[key];
        obj[original[key]] = copy;
    })
    return obj;
}

export function stringEndsWith( str: string, search: string ): boolean {
    var dif:number = str.length - search.length;
    return dif>=0 && str.lastIndexOf(search) === dif;
}

export function stringStartsWith( str: string, search: string ,ind:number=0): boolean {
    return  str.length-search.length >=ind && str.substring(ind,ind+search.length) === search;
}

export function lazypropkeyfilter( k: string ): boolean {
    return k[k.length - 1] == "_" // ends with underscore
}


function lazyprop( obj: Object, key: string, func: Function ): void {
    var result, ready = false;
    obj[key] = () => {
        if ( ! ready ){
            ready = true;
            result = func.apply( obj );
        }
        return result;
    }
}

export function lazyprops( obj: Object, keyfilter = lazypropkeyfilter ): void {
    for ( var k in obj ){
        if ( keyfilter( k ) ){
            ifInstanceOf( obj[k], Function, vf => ( vf.length === 0 ) ? lazyprop( obj, k, vf ) : null )
        }
    }
}

export function iff<T>( v: T, f: {(T) : void}): void {
    if ( v !== undefined ) f(v)
}


export function isRAMLUrl( str: string ): boolean {
    if ( typeof str !== 'string' || str == '' ) return false;
    return stringEndsWith(str, ".raml");
}

export function getAllRequiredExternalModulesFromCode( code: string ): string[] {
    var match: string[];
    var mods = [];
    // both quoting styles
    var r1 = new RegExp("require\\('([^']+)'\\)", "gi");
    while ( match = r1.exec( code ) ){ mods.push( match[1] ) }
    var r2 = new RegExp('require\\("([^"]+)"\\)', "gi");
    while ( match = r2.exec( code ) ){ mods.push( match[1] ) }
    mods = _.unique( mods ).filter( x => x != "" )
    mods.sort();
    return mods;
}

export var serial: () => number = ( () => { var i = 0; return () => i++ })()

export function isEssential(arg:any):boolean {
    return typeof arg !== 'undefined' && arg != null
}

export function firstToUpper(q:string):string{
    if (q.length==0){
        return q;
    }
    return q.charAt(0).toUpperCase()+q.substr(1)
}

export function updateObject(source:any,target:any,addNewFields:boolean=false) {
    var keySet = Object.keys(target);
    if(addNewFields){
        var map = {}
        keySet.forEach(x=>map[x]=true);
        Object.keys(source).forEach(x=>map[x]=true);
        keySet = Object.keys(map);
    }
    keySet.forEach(x=> {
        var value = source[x];
        if(value instanceof Object){
            if(!target[x]){
                target[x] = {};
            }
            updateObject(value,target[x],true)
        }
        else if (value != undefined) {
            target[x] = source[x]
        }
    })
};

/**
 * In 'str' replace all occurences of 'map' keys to their values.
 */
export function replaceMap(str:string,map:{[key:string]:string}):string{
    Object.keys(map).forEach(x=>str=replace(str,x,map[x]));
    return str;
}

/**
 * Replace all occurences of 'x' in 'str' to 'r' without thinking if 'x' can be passed without
 * escaping as argument to RegExp constructor
 */
export function replace(str:string,x:string,r:string):string{
    var result:string = '';
    var prev = 0;
    for(var i = str.indexOf(x); i < str.length && i >= 0 ; i = str.indexOf(x,prev)){
        result += str.substring(prev,i);
        result += r;
        prev = i + x.length;
    }
    result += str.substring(prev,str.length);
    return result;
}

export function deepCopy(val:any){
    if(val == null || typeof val != "object"){
        return val;
    }
    let result:any;
    if(Array.isArray(val)){
        result = [];
        for(var x of val){
            result.push(deepCopy(x));
        }
    }
    else{
        result = {};
        for(var key of Object.keys(val)){
            result[key] = deepCopy(val[key]);
        }
    }
    return result;
}