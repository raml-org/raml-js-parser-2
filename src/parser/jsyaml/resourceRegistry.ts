/// <reference path="../../../typings/main.d.ts" />

import resolversApi = require("./resolversApi")

var HttpResponse = require('http-response-object');
import  lru=require("lrucache")

var globalCache=lru(50);


export function hasAsyncRequests(){
    return Object.keys(notifies).length>0;
}
export interface NotifyCallback{
    (url:string):void
}
export function addLoadCallback(listener:NotifyCallback){
    nlisteners.push(listener);
}

var nlisteners:NotifyCallback[]=[];
var notifies:{ [url:string]:boolean}={}
export function addNotify(url:string){
    notifies[url]=true;
}

export function removeNotity(url:string){
    delete notifies[url];
    nlisteners.forEach(x=>x(url));
}

export function isWaitingFor(url) {
    return notifies[url] ? true : false;
}

export function set(url:string,content: resolversApi.Response){
    globalCache.set(url,content);
}
export function get(url:string):resolversApi.Response{
    return globalCache.get(url);
}

