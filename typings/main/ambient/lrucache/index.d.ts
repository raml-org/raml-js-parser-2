declare module 'lrucache' {

    interface CACHE{
        set(k:string,v:any)
        get(k:string):any
    }
    function lru (num: number): CACHE

    export = lru
}
