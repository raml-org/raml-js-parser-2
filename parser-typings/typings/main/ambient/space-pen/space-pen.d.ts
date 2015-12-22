// Compiled using typings@0.3.3
// Source: custom_typings/space-pen.d.ts
// Type definitions for SpacePen
// Project: https://github.com/atom/space-pen
// Definitions by: vvakame <https://github.com/vvakame>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// http://atom.github.io/space-pen/

interface JQuery {
	view():any;
	views():any[];
}

interface JQuery {
	scrollBottom():number;
	scrollBottom(newValue:number):JQuery;
	scrollDown():JQuery;
	scrollUp():JQuery;
	scrollToTop():JQuery;
	scrollToBottom():JQuery;
	scrollRight():number;
	scrollRight(newValue:number):JQuery;
	pageUp():JQuery;
	pageDown():JQuery;
	isOnDom():boolean;
	isVisible():boolean;
	isHidden():boolean;
	isDisabled():boolean;
	enable():JQuery;
	disable():JQuery;
	insertAt(index:number, element:any):JQuery;
	removeAt(index:number):JQuery;
	indexOf(child:any):any;
	containsElement(element:any):boolean;
	preempt(eventName:any, handler:Function):any;
	handlers(eventName:any):any;
	hasParent():boolean;
	hasFocus():boolean;
	flashError():number;
	trueHeight():any;
	trueWidth():any;
	document(eventName:any, docString:string):any;
	events():any;
	command(eventName:any, handler:any):any;
	command(eventName:any, selector:any, handler:any):any;
	command(eventName:any, selector:any, options:any, handler:any):any;
	iconSize(size:number):void;
	intValue():number;
}

declare class View /* implements JQuery */ {

	static builderStack:Builder[];

	static subview(name:any, view:any):void;

	static text(str:string):void;

	static tag(tagName:any, ...args:any[]):void;

	static raw(str:string):void;

	static pushBuilder():void;

	static popBuilder():Builder;

	static buildHtml(fn:()=>void):string[];

	static render(fn:()=>void):JQuery;

	// please override this method!
	static content(...args:any[]):void;

	// tag start
	static a(...args:any[]);

	static abbr(...args:any[]);

	static address(...args:any[]);

	static article(...args:any[]);

	static aside(...args:any[]);

	static audio(...args:any[]);

	static b(...args:any[]);

	static bdi(...args:any[]);

	static bdo(...args:any[]);

	static blockquote(...args:any[]);

	static body(...args:any[]);

	static button(...args:any[]);

	static canvas(...args:any[]);

	static caption(...args:any[]);

	static cite(...args:any[]);

	static code(...args:any[]);

	static colgroup(...args:any[]);

	static datalist(...args:any[]);

	static dd(...args:any[]);

	static del(...args:any[]);

	static details(...args:any[]);

	static dfn(...args:any[]);

	static div(...args:any[]);

	static dl(...args:any[]);

	static dt(...args:any[]);

	static em(...args:any[]);

	static fieldset(...args:any[]);

	static figcaption(...args:any[]);

	static figure(...args:any[]);

	static footer(...args:any[]);

	static form(...args:any[]);

	static h1(...args:any[]);

	static h2(...args:any[]);

	static h3(...args:any[]);

	static h4(...args:any[]);

	static h5(...args:any[]);

	static h6(...args:any[]);

	static head(...args:any[]);

	static header(...args:any[]);

	static hgroup(...args:any[]);

	static html(...args:any[]);

	static i(...args:any[]);

	static iframe(...args:any[]);

	static ins(...args:any[]);

	static kbd(...args:any[]);

	static label(...args:any[]);

	static legend(...args:any[]);

	static li(...args:any[]);

	static map(...args:any[]);

	static mark(...args:any[]);

	static menu(...args:any[]);

	static meter(...args:any[]);

	static nav(...args:any[]);

	static noscript(...args:any[]);

	static object(...args:any[]);

	static ol(...args:any[]);

	static optgroup(...args:any[]);

	static option(...args:any[]);

	static output(...args:any[]);

	static p(...args:any[]);

	static pre(...args:any[]);

	static progress(...args:any[]);

	static q(...args:any[]);

	static rp(...args:any[]);

	static rt(...args:any[]);

	static ruby(...args:any[]);

	static s(...args:any[]);

	static samp(...args:any[]);

	static script(...args:any[]);

	static section(...args:any[]);

	static select(...args:any[]);

	static small(...args:any[]);

	static span(...args:any[]);

	static strong(...args:any[]);

	static style(...args:any[]);

	static sub(...args:any[]);

	static summary(...args:any[]);

	static sup(...args:any[]);

	static table(...args:any[]);

	static tbody(...args:any[]);

	static td(...args:any[]);

	static textarea(...args:any[]);

	static tfoot(...args:any[]);

	static th(...args:any[]);

	static thead(...args:any[]);

	static time(...args:any[]);

	static title(...args:any[]);

	static tr(...args:any[]);

	static u(...args:any[]);

	static ul(...args:any[]);

	static video(...args:any[]);

	static area(...args:any[]);

	static base(...args:any[]);

	static br(...args:any[]);

	static col(...args:any[]);

	static command(...args:any[]);

	static embed(...args:any[]);

	static hr(...args:any[]);

	static img(...args:any[]);

	static input(...args:any[]);

	static keygen(...args:any[]);

	static link(...args:any[]);

	static meta(...args:any[]);

	static param(...args:any[]);

	static source(...args:any[]);

	static track(...args:any[]);

	static wbrk(...args:any[]);

	// tag end

	initialize(view:View, args:any):void;

	constructor(...args:any[]);

	buildHtml(params:any):any;

	wireOutlets(view:View):void;

	bindEventHandlers(view:View):void;

	pushStack(elems:any):any;

	end():any;

	command(commandName:any, selector:any, options:any, handler:any):any;

	preempt(eventName:any, handler:any):any;
}

declare class Builder {
	document:any[];
	postProcessingSteps:any[];

	buildHtml():any[];

	tag(name:string, ...args:any[]):void;

	openTag(name:string, attributes:any):void;

	closeTag(name:string):void;

	text(str:string):void;

	raw(str:string):void;

	subview(outletName:any, subview:View):void;

	extractOptions(args:any):any;
}

declare module "space-pen" {

	// copy & paste start
	class View /* implements JQueryStatic */ {

		static builderStack:Builder[];

		static subview(name:any, view:any):void;

		static text(str:string):void;

		static tag(tagName:any, ...args:any[]):void;

		static raw(str:string):void;

		static pushBuilder():void;

		static popBuilder():Builder;

		static buildHtml(fn:()=>void):string[];

		static render(fn:()=>void):JQuery;

		// please override this method!
		static content(...args:any[]):void;

		// tag start
		static a(...args:any[]):any;

		static abbr(...args:any[]):any;

		static address(...args:any[]):any;

		static article(...args:any[]):any;

		static aside(...args:any[]):any;

		static audio(...args:any[]):any;

		static b(...args:any[]):any;

		static bdi(...args:any[]):any;

		static bdo(...args:any[]):any;

		static blockquote(...args:any[]):any;

		static body(...args:any[]):any;

		static button(...args:any[]):any;

		static canvas(...args:any[]):any;

		static caption(...args:any[]):any;

		static cite(...args:any[]):any;

		static code(...args:any[]):any;

		static colgroup(...args:any[]):any;

		static datalist(...args:any[]):any;

		static dd(...args:any[]):any;

		static del(...args:any[]):any;

		static details(...args:any[]):any;

		static dfn(...args:any[]):any;

		static div(...args:any[]):any;

		static dl(...args:any[]):any;

		static dt(...args:any[]):any;

		static em(...args:any[]):any;

		static fieldset(...args:any[]):any;

		static figcaption(...args:any[]):any;

		static figure(...args:any[]):any;

		static footer(...args:any[]):any;

		static form(...args:any[]):any;

		static h1(...args:any[]):any;

		static h2(...args:any[]):any;

		static h3(...args:any[]):any;

		static h4(...args:any[]):any;

		static h5(...args:any[]):any;

		static h6(...args:any[]):any;

		static head(...args:any[]):any;

		static header(...args:any[]):any;

		static hgroup(...args:any[]):any;

		static html(...args:any[]):any;

		static i(...args:any[]):any;

		static iframe(...args:any[]):any;

		static ins(...args:any[]):any;

		static kbd(...args:any[]):any;

		static label(...args:any[]):any;

		static legend(...args:any[]):any;

		static li(...args:any[]):any;

		static map(...args:any[]):any;

		static mark(...args:any[]):any;

		static menu(...args:any[]):any;

		static meter(...args:any[]):any;

		static nav(...args:any[]):any;

		static noscript(...args:any[]):any;

		static object(...args:any[]):any;

		static ol(...args:any[]):any;

		static optgroup(...args:any[]):any;

		static option(...args:any[]):any;

		static output(...args:any[]):any;

		static p(...args:any[]):any;

		static pre(...args:any[]):any;

		static progress(...args:any[]):any;

		static q(...args:any[]):any;

		static rp(...args:any[]):any;

		static rt(...args:any[]):any;

		static ruby(...args:any[]):any;

		static s(...args:any[]):any;

		static samp(...args:any[]):any;

		static script(...args:any[]):any;

		static section(...args:any[]):any;

		static select(...args:any[]):any;

		static small(...args:any[]):any;

		static span(...args:any[]):any;

		static strong(...args:any[]):any;

		static style(...args:any[]):any;

		static sub(...args:any[]):any;

		static summary(...args:any[]):any;

		static sup(...args:any[]):any;

		static table(...args:any[]):any;

		static tbody(...args:any[]):any;

		static td(...args:any[]):any;

		static textarea(...args:any[]):any;

		static tfoot(...args:any[]):any;

		static th(...args:any[]):any;

		static thead(...args:any[]):any;

		static time(...args:any[]):any;

		static title(...args:any[]):any;

		static tr(...args:any[]):any;

		static u(...args:any[]):any;

		static ul(...args:any[]):any;

		static video(...args:any[]):any;

		static area(...args:any[]):any;

		static base(...args:any[]):any;

		static br(...args:any[]):any;

		static col(...args:any[]):any;

		static command(...args:any[]):any;

		static embed(...args:any[]):any;

		static hr(...args:any[]):any;

		static img(...args:any[]):any;

		static input(...args:any[]):any;

		static keygen(...args:any[]):any;

		static link(...args:any[]):any;

		static meta(...args:any[]):any;

		static param(...args:any[]):any;

		static source(...args:any[]):any;

		static track(...args:any[]):any;

		static wbrk(...args:any[]):any;

		// tag end

		initialize(args:any):void;

		constructor(...args:any[]);

		buildHtml(params:any):any;

		wireOutlets(view:View):void;

		bindEventHandlers(view:View):void;

		pushStack(elems:any):any;

		end():any;

		command(eventName:string, handler:any):any;

		command(eventName:string, selector:any, handler:any):any;

		command(eventName:string, selector:any, options:any, handler:any):any;

		preempt(eventName:any, handler:any):any;
	}

	class Builder {
		document:any[];
		postProcessingSteps:any[];

		buildHtml():any[];

		tag(name:string, ...args:any[]):void;

		openTag(name:string, attributes:any):void;

		closeTag(name:string):void;

		text(str:string):void;

		raw(str:string):void;

		subview(outletName:any, subview:View):void;

		extractOptions(args:any):any;
	}
	// copy & paste end


	var jQuery:JQueryStatic;
	var $:JQueryStatic;
	var $$:(fn:Function)=>JQuery; // same type as View.render's return type.
	var $$$:(fn:Function)=>any; // same type as View.buildHtml's return type's [0].
}