// Compiled using typings@0.5.2
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/bba34156c1eaad788fa8996f7d30b54c4fce5ffe/form-data/form-data.d.ts
// Type definitions for form-data
// Project: https://github.com/felixge/node-form-data
// Definitions by: Carlos Ballesteros Velasco <https://github.com/soywiz>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// Imported from: https://github.com/soywiz/typescript-node-definitions/form-data.d.ts

declare module "form-data" {
	export class FormData {
		append(key: string, value: any): FormData;
		getHeaders(): Object;
		// TODO expand pipe
		pipe(to: any): any;
	}
}