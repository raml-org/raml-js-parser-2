// Compiled using typings@0.5.2
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/be0b6b394f77a59e192ad7cfec18078706e44db5/status-bar/status-bar.d.ts
// Type definitions for status-bar
// Project: https://github.com/atom/status-bar
// Definitions by: vvakame <https://github.com/vvakame/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


declare module StatusBar {
	interface IStatusBarViewStatic {
		content():any;

		new(...args:any[]):IStatusBarView;
	}

	interface IStatusBarView extends View {

		initialize():any;
		attach():any;
		destroy():any;
		appendLeft(view:View):any;
		prependLeft(view:View):any;
		appendRight(view:View):any;
		prependRight(view:View):any;
		getActiveBuffer():TextBuffer.ITextBuffer;
		getActiveItem():any;
		storeActiveBuffer():TextBuffer.ITextBuffer;
		subscribeToBuffer(event:string, callback:Function):any;
		subscribeAllToBuffer():any[];
		unsubscribeAllFromBuffer():any[];
	}
}