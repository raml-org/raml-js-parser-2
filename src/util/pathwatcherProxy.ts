/// <reference path="../../typings/main.d.ts" />
export interface IPathWatcher{

    close();
}
export class File{
    constructor(private path:string){

    }
    getPath(){
        return this.path;
    }
    close(){}
}
export function watch(path:string,f:(event,newFileName)=>void):IPathWatcher{
    return {close(){}}
}