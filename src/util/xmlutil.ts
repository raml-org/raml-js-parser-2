/// <reference path="../../typings/main.d.ts" />

var DomParser=require("xmldom");
function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@"+attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }
    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (nodeName==undefined){
                continue;
            }
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};
function cleanupText(j:any){
    if (typeof j==="object") {
        for (var p in j) {
            if (typeof(j[p]) == "object") {
                for (var k in j[p]) {
                    if (k == '#text') {
                        var txt = j[p]['#text'];
                        if (typeof(txt) != 'string') {
                            txt = txt.join("");
                        }
                        txt = txt.trim();
                        if (txt.length == 0) {
                            delete j[p]['#text']
                        }
                    }
                }
                cleanupText(j[p]);
            }
        }
    }
    return j;
}
function cleanupJson(j:any){
    if (typeof j==="object") {
        for (var p in j) {
            if (typeof(j[p]) == "object") {
                var keys = Object.keys(j[p]);
                if (keys.length == 1) {
                    if (keys[0] == '#text') {
                        j[p] = j[p]['#text'];
                    }
                }
                cleanupJson(j[p]);
            }
        }
    }
    return j;
}

function parseXML(value:string){
    var v=new DomParser.DOMParser();
    if (!value || value.trim().indexOf("<<") == 0) return null;

    var parsed=v.parseFromString(value);
    return cleanupJson(cleanupText(xmlToJson(parsed)))
}
export=parseXML;