


export interface ErrorFactory<T>{
    error(w:T,message:string);
    errorOnProperty(w:T,property: string,message:string)
    warningOnProperty(w:T,property: string,message:string)
    warning(w:T,message:string)
}

export interface LinterRule<T>{
    (wrapper:T, errorFactory: ErrorFactory<T>)
}

export interface Linter{
    registerRule(nodeType:string,rule: LinterRule<any>);
}