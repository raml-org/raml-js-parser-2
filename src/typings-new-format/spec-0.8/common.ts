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

export interface ElementSourceInfo extends SourceInfo{

    scalarsSources?: { [key:string]:SourceInfo[] }

}

export interface HasSource {

    sourceMap?: ElementSourceInfo

    __METADATA__?: any
}