// Compiled using typings@0.5.2
// Source: custom_typings/lrucache.d.ts
declare module 'lrucache' {

    interface CACHE{
        set(k:string,v:any)
        get(k:string):any
    }
    function lru (num: number): CACHE

    export = lru
}