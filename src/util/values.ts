export class MarkdownString {
    constructor( private _value: string ){
        if ( typeof this._value !== 'string' ){
            throw new Error("Invalid Argument")
        }
    }
    value = (): string => this._value;
}