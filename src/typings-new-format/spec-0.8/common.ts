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

    /**
     * Source information for fields which are defined in another file rather then their owning component.
     * If all scalar fields of the component are defined in the same file, the 'scalarsSources' field is undefined.
     */
    scalarsSources?: { [key:string]:SourceInfo[] }

}

export interface HasSource {

    sourceMap?: ElementSourceInfo

    __METADATA__?: any
}