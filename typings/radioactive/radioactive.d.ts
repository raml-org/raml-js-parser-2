



interface RadioactiveDataAjaxOpts {
    poll?: number
}


interface RadioactiveNotifier {
    (): void
    cancel(): void
}

interface RadioactiveCallback<T> {
    ( error?: Error, result?: T ) : void ;
}

interface ReactiveLoop {
    /**
     * Stop this watcher.
     */
    stop (): void
}

interface RadioactiveForker {
    /**
     * Executes a block of code inside a fork.
     * May return null a few times before returning
     * the actual value.
     */
    <T>( expr: () => T ): T

    /**
     * Waits until all forked blocks of code are finished
     */
    join(): void
}

/**
 A Cell is a "Reactive Variable".
 You can put anything you want in it by calling `cell( value )` ( one parameter )
 and then you can get it back by calling cell() ( with no parameters ).

 How do I set a cell to an error state?
 If you pass a value where ( value instanceof Error == true )
 Then the cell will automatically be set to an error state.

 If you wish to pass an error so that it can be stored
 you will need to wrap it into something else.
 */
interface RadioactiveCell<T> extends Function {
    ( ): T
    ( value: T ): void
    ( value: Error ): void
    ( error?: Error, value?: T ): void
    /**
     * Whether someone is interested in knowing if our value changes.
     * This may change at any time as the cell may be accessed and notifiers requested.
     */
    monitored():boolean
}


interface RadioactiveCellOptions {
    /**
     * Pass a custom function to test for equality.
     * A cell's value is only changed if the new value is different from its current value.
     * @param a
     * @param b
     */
    comparator?: ( a: any, b: any ) => boolean ;

    /**
     *
     */
    throttle?: number ;
}


interface RadioactiveSyncifyOpts {

    /**
     *
     */
    poll?: number ;

    /**
     *
     * @param args
     */
    hasher?: ( args: Array<any> ) => string ;


    /**
     * Services are local by default ( as opposed to global ).
     * A local service will receive its own cache that will last for one evaluation
     * ( it is a bit more complicated than that in reality, but that is a fair approximation ).
     * This is what you normally do when calling async functions. Each invocation keeps its own state.
     *
     * However. In many occasions it makes sense to have one global service.
     * Specially when hitting a remote service.
     *
     */
    global?: boolean ;


    func: Function ;

}


interface Radioactive {

    /**
     * Proxies to react() when called with one argument of type function
     * @param expr Radioactive Javascript function
     */
    ( expr: () => any ) : ReactiveLoop;

    /**
     * Proxies to react( expr, callback )
     * @param expr Radioactive Javascript function
     * @param callback Node.js style callback
     */
    <T>( expr: () => T, callback: RadioactiveCallback<T> ) : ReactiveLoop;

    /**
     * Returns a cell initialized to 'undefined'
     */
    ( ): RadioactiveCell<any>;


    /**
     * Returns a cell initialized to @value when called with one argument that is not a function
     * ( note that if the argument is a function this will not return a cell - it will forward to react() instead )
     */
    <T>( value: T ): RadioactiveCell<T>;


    /**
     * Returns true if we are currently within a reactive loop.
     * ( we are inside a call to radioactive.react() or radioactive.once() ).
     * This is useful when implementing Publishers.
     *
     * @see https://github.com/radioactive/radioactive/wiki/Publishing-Data
     * @see https://github.com/radioactive/radioactive/wiki/radioactive.active
     */
    active(): boolean;

    /**
     * Request a Notifier.
     * This method may return null or undefined if we are not running within a reactive context.
     * In other words: if radioactive.active() == false then this method will return null
     *
     * @see https://github.com/radioactive/radioactive/wiki/Publishing-Data
     * @see https://github.com/radioactive/radioactive/wiki/radioactive.notifier
     */
    notifier(): RadioactiveNotifier;

    /**
     * Alternate way of requesting a Notifier.
     * If you don't want to check for null you can pass a callback.
     * This callback will only be called radioactive.active() == true.
     * @param callback Function that takes a Notifier as its first ( and only ) argument
     */
    notifier( callback: ( notifier: RadioactiveNotifier ) => void ): void;


    /**
     * Returns a Forker instance.
     * You can use this Forker to fork/join your code.
     *
     * @see https://github.com/radioactive/radioactive/wiki/radioactive.fork
     * @see https://github.com/radioactive/radioactive/blob/master/test/radioactive.fork.tests.coffee
     *
     */
    fork(): RadioactiveForker;


    cell: {
        /**
         * Creates a Cell initialized to undefined
         * @see https://github.com/radioactive/radioactive/wiki/radioactive.cell
         */
        <T>( ) : RadioactiveCell<T> ;

        /**
         * Creates a cell initialized to value
         * @param value The initial value for this cell
         * @see https://github.com/radioactive/radioactive/wiki/radioactive.cell
         */
        <T>( value:T ) : RadioactiveCell<T> ;

        /**
         * Creates a cell initialized to value
         * @param value The initial value for this cell
         * @see https://github.com/radioactive/radioactive/wiki/radioactive.cell
         */
        <T>( value:T, options: RadioactiveCellOptions ) : RadioactiveCell<T> ;

        /**
         * Creates a cell initialized to a Pending State
         */
        pending: {
            <T>() : RadioactiveCell<T>;
        }
    };




    /**
     * Throws a StopSignal
     * Will stop the closest enclosing radioactive.react() loop.
     *
     * @see https://github.com/radioactive/radioactive/wiki/radioactive.stop
     * @see https://github.com/radioactive/radioactive/blob/master/test/radioactive.stop.tests.coffee
     */
    stop(): void;


    react( expr: () => any ): ReactiveLoop;

    react<T>( expr: () => T, callback: RadioactiveCallback<T> ): ReactiveLoop;

    once<T>( expr: () => T, callback: RadioactiveCallback<T> ): ReactiveLoop;

    /**
     * Throws an PendingSignal.
     * Use this from a data producing expression to indicate
     * That a value is not defined yet. ( but will be in the future ).
     */
    pending(): void;

    /**
     * Evaluates an expression and returns true if the expression throws a PendingSignal
     * false otherwise.
     *
     * This function is R(1). Once the expression stops being pending it will reevaluate itself.
     * You normally use this to show temporary "loading..." messages while R(2) expressions
     * are in pending state.
     *
     * @param expr
     */
    pending( expr: () => any ): boolean;


    pending<T>( expr: () => T, defaultValue: () => T ): T;


    /**
     * Transforms an async function into a sync function that throws WaitSignals and caches results.
     * The async function must follow the Node.js callback convention:
     *
     * function( error, result ){}
     *
     * @param async An async function. It's last argument must be a Node.js style callback.
     * @see https://github.com/radioactive/radioactive/wiki/radioactive.syncify
     */
    syncify( async: Function ): Function;

    /**
     *
     * @param opts
     */
    syncify( opts: RadioactiveSyncifyOpts ): Function;


    /**
     * Utility.
     * Calling this function will return an R(2) function that knows how to echo() one value.
     * R(0) ( but returns an R(2) function )
     * @param delay
     */
    echo( delay: number ): ( string ) => void;

    /**
     * Utility. Returns the current timestamp.
     * @param interval
     * R(1)
     */
    time( interval: number ): number;

    /**
     * Takes a R(>0) expression and makes it R(0)
     * @param expr
     */
    mute<T>( expr: () => T ): () => T;


    data( jsonURL: string, opts?: RadioactiveDataAjaxOpts ): any;


    PendingSignal: Function;

    safecatch( e: Error );

    throttle<T>( delay: number, expr: () => T ): () => T

}

declare module "radioactive" {
    var x: Radioactive;
    export = x;
}
