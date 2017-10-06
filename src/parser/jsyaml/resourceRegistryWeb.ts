var cache = {};

function doRequest(method, url, options) {
    var request = new XMLHttpRequest();

    var response;

    request.open(method, url, false);

    request.onload = function () {
        response = (<any>this).responseText;
    };

    request.send();

    return response;
}
export function readFromCacheOrGet(url:string){
    if (cache[url]){
        var v=cache[url];
        if (v==readFromCacheOrGet){
            return null;
        }
        return v;
    }
    try {
        var res = doRequest("GET", url, {timeout: 3000, socketTimeout: 5000, retry: true});
        res = new Buffer(res.body.data).toString();
        cache[url] = res;
        return cache[url];
    } catch (e){
        cache[url]=readFromCacheOrGet;
        return null;
    }
}