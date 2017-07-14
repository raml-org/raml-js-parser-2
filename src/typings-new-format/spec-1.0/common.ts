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
	
	/**
	 * Source information for fields which are defined in another file rather then their owning component.
     * If all scalar fields of the component are defined in the same file, the 'scalarsSources' field is undefined.
	 */
    scalarsSources?: { [key:string]:SourceInfo[] }

    __METADATA__?: any
}


export interface Annotable extends HasSource{

    /**
     * Most of RAML model elements may have attached annotations decribing
     * additional meta data about this element
     */
    annotations?: AnnotationInstance[];

    scalarsAnnotations?: { [key: string]: AnnotationInstance[][] };
}

export interface AnnotationInstance {

    name: string

    value: any
}

export interface UsesDeclaration extends Annotable{

    key: string

    value: string

    usage?: string
}

export interface FragmentDeclaration extends Annotable {

    uses?: UsesDeclaration[]
}


/**
 * RAML error
 */
export interface Error {

    /**
     * IssueCode
     */
    code: string

    /**
     * Message text
     */
    message: string

    /**
     * File path
     */
    path: string

    /**
     * Whether the message is warning or not
     */
    isWarning?: boolean

    trace?: Error[]

    range: ErrorRange
}

/**
 * Range object describing start and end of error location
 */
export interface ErrorRange {

    start: ErrorPosition,
    end: ErrorPosition
}

export interface ErrorPosition {

    /**
     * Line number, starting at 0
     */
    line: number

    /**
     * Column number, starting at 0
     */
    column: number

    /**
     * Position in characters from the beginning of the document, starting at 0
     */
    position: number

}

export interface RAML10ParseResult {

    ramlVersion: "RAML10"

    type: string

    errors?: Error[]

    specification: FragmentDeclaration
}
