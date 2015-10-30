
declare module "collector" {
    interface Collector<T> {
        ( v: T ): void // equivalent to collect
        collect( v: T ): void
        attach<U>( f: () => U ): () => U
    }
    var build: <T>() => Collector<T>;
    export = build;
}