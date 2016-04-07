"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require("fs");
var RamlParserTheme = (function (_super) {
    __extends(RamlParserTheme, _super);
    function RamlParserTheme(renderer, basePath) {
        _super.call(this, renderer, basePath);
        this.pageMap = {};
        this.urlMap = {};
        renderer.on(td.output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this, 10000);
        renderer.on(td.output.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this, -10);
    }
    RamlParserTheme.prototype.getUrls = function (project) {
        var entryPoint = this.getEntryPoint(project);
        entryPoint.children = entryPoint.children.filter(function (x) {
            var url = td.output.DefaultTheme.getUrl(x);
            return url.indexOf("_typings_") < 0;
        });
        var owner = this;
        var urls = _super.prototype.getUrls.call(this, project);
        urls.forEach(function (x) { return owner.urlMap[x.url] = x; });
        return urls;
    };
    RamlParserTheme.prototype.onRendererBeginPage = function (page) {
        if (page.filename.indexOf('_src_index_.html') >= 0) {
            page.model.comment = new td.models.Comment(null, this.getComment(page));
            this.pageMap[page.filename] = {
                name: page.model.name,
                kindString: page.model.kindString
            };
            page.model.kindString = '';
        }
        var processHierarchy = function (x) {
            if (!x) {
                return;
            }
            if (x.types) {
                x.types = x.types.filter(function (y) {
                    return !y.reflection || y.reflection.url.indexOf('raml08') < 0;
                });
            }
            processHierarchy(x.next);
        };
        var processModel = function (x) {
            if (x.groups) {
                x.groups = x.groups.filter(function (group) {
                    return group.kind != td.models.ReflectionKind.Class;
                });
            }
            if (x.implementedBy) {
                x.implementedBy = [];
            }
            if (x.children) {
                x.children = x.children.filter(function (x) {
                    return x.kind != td.models.ReflectionKind.Class;
                });
            }
            if (x.children) {
                x.children.forEach(function (ch) { return processModel(ch); });
            }
        };
        processModel(page.model);
    };
    RamlParserTheme.prototype.onRendererEndPage = function (page) {
        if (this.pageMap[page.filename]) {
            var entry = this.pageMap[page.filename];
            page.model.name = entry.name;
            page.model.kindString = entry.kindString;
        }
        if (page.filename.indexOf('index.html') >= 0) {
            page.contents = indexRedirect;
        }
    };
    RamlParserTheme.prototype.getComment = function (page) {
        var srcPath = this.urlMap[page.url].model.originalName;
        var content = fs.readFileSync(srcPath).toString();
        var ind = content.indexOf('/**');
        if (ind < 0) {
            return null;
        }
        if(content.substring(0,ind).trim().length>0){
            return null;
        }
        var ind1 = content.indexOf('**/', ind);
        if (ind1 < 0) {
            return null;
        }
        ind1 += '**/'.length;
        var comment = content.substring(ind, ind1);
        return refineComment(comment);
    };
    return RamlParserTheme;
}(td.output.DefaultTheme));
var indexRedirect = "<!doctype html>\n<html class=\"default no-js\">\n<!doctype html>\n<html class=\"default no-js\">\n<head>\n\t<script type=\"text/javascript\">\n            window.location.href = \"./modules/_src_index_.html\"\n        </script>\n        <title>Page Redirection</title>\n</head>\n\n</html>\n";
function refineComment(str) {
    return str.split('\n').map(function (x, i, arr) {
        if (i == 0) {
            return x.replace(/^[\s]*[\/][\*]+/, '').trim();
        }
        else if (i == arr.length - 1) {
            return x.replace(/[\*]+[\/][\s]*$/, '').trim();
        }
        else {
            return x.replace(/^[\s]*[\*]/, '').replace(/[\*][\s]*$/, '').trim();
        }
    }).join('\n').trim();
}
module.exports = RamlParserTheme;
//# sourceMappingURL=theme.js.map