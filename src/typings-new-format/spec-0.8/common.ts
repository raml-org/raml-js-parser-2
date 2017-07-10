export interface SourceInfo{

    /**
     * Path to file which contains definition
     */
    path?: string

    /**
     * Namespace of defining library if any
     */
    namespace?: string

}

export interface HasSource extends SourceInfo{

    scalarsSources?: { [key:string]:SourceInfo[] }

    __METADATA__?: any
}