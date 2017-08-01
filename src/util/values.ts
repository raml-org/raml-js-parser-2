let messageRegistry = require("../../resources/errorMessages");
export class MarkdownString {
    constructor( private _value: string ){
        if ( typeof this._value !== 'string' ){
            throw new Error(messageRegistry.INVALID_ARGUMENT.message)
        }
    }
    value = (): string => this._value;
}