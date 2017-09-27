import invariant = require('invariant')

var exists = ( v ) => ( v != null )

var globalEmptyOpt: Opt<any>;

class Opt<T> {
    private _isDefined = false
    private _isEmpty   = true
    private _arr: Array<T> = undefined

    constructor(private _value?: T) {
        if (exists(this._value)) {
            this._isDefined = true
            this._isEmpty = false
        }
    }

    getOrThrow = (): T => {
        invariant(this._isDefined, 'Opt is empty. Use `Opt#getOrElse` or check `Opt#isDefined`.')

        return this._value
    }

    value      = (): T => this._value
    isDefined  = (): boolean => this._isDefined
    isEmpty    = (): boolean => this._isEmpty
    toArray    = (): T[] => this._arr || ( this._arr = this._isDefined ? [ this._value ] : [] )
    getOrElse  = (v: T): T => this._isDefined ? this._value : v
    getOrElseF = (v: () => T): T => this._isDefined ? this._value : v()
    map        = <U>(f: (value: T) => U): Opt<U> => this._isEmpty ? Opt.empty<U>() : new Opt(f(this._value))
    flatMap    = <U>(f: (value: T) => Opt<U>): Opt<U> => this.map(f).getOrElse(Opt.empty<U>())

    equals = (other: Opt<T>): boolean => {
        invariant(other instanceof Opt, 'Expected other to be an `Opt`, but got `%s`', typeof other)

        return (this._isDefined === other.isDefined()) && (this._value === other.value())
    }

    forEach (fn: (value: T) => any): void {
        if(this.isDefined()){
            fn(this._value)
        }
    }

    /**
     * You can always create an empty option by hand just by calling new Opt<T>()
     * but calling this method will return a global instance instead of allocating a new one each time
     */
    static empty = <T>(): Opt<T> => <Opt<T>> ( globalEmptyOpt || ( globalEmptyOpt = new Opt() ))
}

export = Opt
