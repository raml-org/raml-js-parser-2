import Opt = require("../Opt");

export function childrenOf( elm: HTMLElement ): Element[] {
    for ( var i = 0, xs = elm.children, ret: Element[] = [] ; i < xs.length ; i++ )
        ret.push( xs.item(i) )
    return ret;
}

export function buildHamlStyleTag( tag: string, classes: string[] = [], id: Opt<string> = Opt.empty<string>() ): string {
    if ( tag === 'div' && ( id.isDefined() || classes.length > 0 ) ) tag = '';
    return tag + id.map(x => '#' + x).getOrElse('') + classes.map( x => '.' + x ).join('')
}
