export interface Annotable {

    /**
     * Most of RAML model elements may have attached annotations decribing
     * additional meta data about this element
     */
    annotations: AnnotationInstance[];

    scalarsAnnotations: { [key: string]: AnnotationInstance[] };

    __METADATA__: any
}

export interface AnnotationInstance {

    name: string

    structuredValue: any
}

export interface UsesDeclaration {

    key: string

    value: string
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
