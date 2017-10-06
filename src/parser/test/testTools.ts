export function getLength(obj:any):number{

    if(obj==null){
        return null;
    }
    if(obj.length!=null){
        if(typeof(obj.length)=='number'){
            return obj.length
        }
        if(typeof(obj.length)=='function'){
            return obj.length();
        }
    }
    if(obj.size!=null){
        if(typeof(obj.size)=='number'){
            return obj.size
        }
        if(typeof(obj.size)=='function'){
            return obj.size();
        }
    }
    return null;
}


export function collectionItem(collection,index){

    if(collection==null){
        return null;
    }
    if(Array.isArray(collection)){
        return collection[index];
    }
    var getMethod = collection.get;
    if(getMethod!=null&&typeof(getMethod)=='function'){
        return collection.get(index);
    }
    var itemAtMethod = collection.itemAt;
    if(itemAtMethod!=null&&typeof(itemAtMethod)=='function'){
        return collection.itemAt(index);
    }
    return null;
}

export function toArray<T>(obj:any):T[]{
    if(Array.isArray(obj)){
        return <T[]>obj;
    }
    if(typeof obj.size == 'function'){
        var arr:T[] = [];
        var size = obj.size();
        for(var i = 0 ; i < size ; i++){
            arr.push(obj.get(i));
        }
        return arr;
    }
    return <T[]>obj;
}