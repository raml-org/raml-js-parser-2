export interface ErrorFactory<T> {
    error(w: T, message: string): any;
    errorOnProperty(w: T, property: string, message: string): any;
    warningOnProperty(w: T, property: string, message: string): any;
    warning(w: T, message: string): any;
}
export interface LinterRule<T> {
    (wrapper: T, errorFactory: ErrorFactory<T>): any;
}
export interface Linter {
    registerRule(nodeType: string, rule: LinterRule<any>): any;
}
