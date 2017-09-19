export class LocalStorage implements Storage{

    length:number = 0;

    [key: string]: any;

    [index: number]: string;

    getItem(key:string):any{
        var result = this[key];
        if(result === undefined){
            return null;
        }
        return result;
    }

    setItem(key:string,value:string):void{
        this[key] = value;
        this.length++;
    }

    removeItem(key:string):void{
        this[key] = undefined;
        this.length--;
    }

    clear(): void{
        for(var key of Object.keys(this)){
            delete this[key];
        }
        this.length = 0;
    }

    key(index: number){
        return null;
    }

}


export interface LocalStorageHelper {

    forEach(fn:(string)=>any):void

    has(path:string):boolean

    set(path:string, content:any):void

    get(path:string):any

    remove(path:string):void

    clear():void;
}

export interface LocalStorageFileSystem {

    supportsFolders:boolean;

    directory(path:string):Promise<any>

    /**
     * Persist a file to an existing folder.
     */
    save(path:string, content:string):Promise<void>
    /**
     * Create the folders contained in a path.
     */
    createFolder(path):Promise<void>

    /**
     * Loads the content of a file.
     */
    load(path):Promise<string>

    /**
     * Removes a file or directory.
     */
    remove(path):Promise<void>

    /**
     * Renames a file or directory
     */
    rename(source, destination):Promise<void>

    /**
     * clean the instance
     */
    clear()
}