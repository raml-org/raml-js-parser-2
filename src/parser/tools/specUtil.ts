
export function link(link:string,caption?:string):string{
    var str = '[[' + link;
    if(caption){
        str += '|'+caption;
    }
    str += ']]';
    return str;
}
export class LinkProcessor {

    occuredLinks:{[key:string]:boolean}={};

    resolvedLinks:{[key:string]:boolean}={};

    unresolvedLinks:string[]=[];

    //<a href="#my-section">example</a>
    //<a name="my-section"></a>
    processLinks(text:string):string {

        var result = '';
        var prev = 0;
        for (var i = text.indexOf('[['); i >= 0 && i < text.length; i = text.indexOf('[[', prev)) {

            result += text.substring(prev, i);
            prev = text.indexOf(']]', i);
            if (prev < 0) {
                prev = i;
                break;
            }
            i += '[['.length;
            var linkContent = text.substring(i, prev);
            prev += ']]'.length;

            if (linkContent.charAt(0) == '^') {
                var linkName = linkContent.substring(1);
                result += `<a name="${linkName}"></a>`;
                this.resolvedLinks[linkName]=true;
            }
            else {
                var link;
                var caption;
                var ind = linkContent.indexOf('|');
                if (ind >= 0) {
                    link = linkContent.substring(0, ind);
                    caption = linkContent.substring(ind + 1);
                }
                else {
                    link = linkContent;
                    caption = linkContent;
                }
                this.occuredLinks[link]=true;
                result += `<a href="#${link}">${caption}</a>`;
            }
        }
        result += text.substring(prev);

        this.unresolvedLinks = Object.keys(this.occuredLinks).filter(x=>!this.resolvedLinks[x]).sort();
        return result;
    }
}