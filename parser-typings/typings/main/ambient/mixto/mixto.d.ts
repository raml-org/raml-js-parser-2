// Compiled using typings@0.5.2
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/be0b6b394f77a59e192ad7cfec18078706e44db5/mixto/mixto.d.ts
// Type definitions for mixto
// Project: https://github.com/atom/mixto
// Definitions by: vvakame <https://github.com/vvakame/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module Mixto {
	interface IMixinStatic {
		includeInto(constructor:any):void;
		extend(object:any):void;
	}
}

declare module "mixto" {
	var _tmp:Mixto.IMixinStatic;
	export = _tmp;
}