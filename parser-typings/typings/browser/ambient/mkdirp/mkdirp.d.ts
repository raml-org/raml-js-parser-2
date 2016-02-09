// Compiled using typings@0.5.2
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/52fa2b9ce36f2c5843204e9bfbaada7cded9b47a/mkdirp/mkdirp.d.ts
// Type definitions for mkdirp 0.3.0
// Project: http://github.com/substack/node-mkdirp
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module 'mkdirp' {

	function mkdirp(dir: string, cb: (err: any, made: string) => void): void;
	function mkdirp(dir: string, flags: any, cb: (err: any, made: string) => void): void;

	module mkdirp {
		function sync(dir: string, flags?: any): string;
	}
	export = mkdirp;
}