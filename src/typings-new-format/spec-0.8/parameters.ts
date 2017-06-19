
export interface Parameter08{

    /**
     * name of the parameter
     */
    name:string

    /**
     * An alternate, human-friendly name for the parameter
     */
    displayName?:string

    /**
     * The type attribute specifies the primitive type of the parameter's
     * resolved value. API clients MUST return/throw an error if the
     * parameter's resolved value does not match the specified type.
     * If type is not specified, it defaults to string
     */
    type:string

    /**
     * Location of the parameter (can not be edited by user)
     */
    location?: string

    /**
     * Set to true if parameter is required
     */
    required?: boolean

    /**
     * The default attribute specifies the default value to use for the
     * property if the property is omitted or its value is not specified.
     * This SHOULD NOT be interpreted as a requirement for the client
     * to send the default attribute's value if there is no other value
     * to send. Instead, the default attribute's value is the value the
     * server uses if the client does not send a value.
     */
    default?: any

    /**
     * (Optional) The example attribute shows an example value for the property.
     * This can be used, e.g., by documentation generators to generate sample
     * values for the property.
     */
    example?: string

    /**
     * The repeat attribute specifies that the parameter can be repeated.
     * If the parameter can be used multiple times, the repeat parameter
     * value MUST be set to 'true'. Otherwise, the default value is 'false'
     * and the parameter may not be repeated.
     */
    repeat?: boolean

    /**
     * The description attribute describes the intended use or meaning
     * of the $self. This value MAY be formatted using Markdown.
     */
    description?: string

}

export interface StringTypeDeclaration08 extends Parameter08{

    /**
     * (Optional, applicable only for parameters of type string) The pattern
     * attribute is a regular expression that a parameter of type string
     * MUST match. Regular expressions MUST follow the regular expression
     * specification from ECMA 262/Perl 5. The pattern MAY be enclosed in
     * double quotes for readability and clarity.
     */
    pattern?: string

    /**
     * (Optional, applicable only for parameters of type string) The enum
     * attribute provides an enumeration of the parameter's valid values.
     * This MUST be an array. If the enum attribute is defined, API clients
     * and servers MUST verify that a parameter's value matches a value
     * in the enum array. If there is no matching value, the clients and
     * servers MUST treat this as an error.
     */
    enum?: string[]

    /**
     * (Optional, applicable only for parameters of type string) The minLength
     * attribute specifies the parameter value's minimum number of characters.
     */
    minLength?: number

    /**
     * (Optional, applicable only for parameters of type string) The maxLength
     * attribute specifies the parameter value's maximum number of characters.
     */
    maxLength?: number
}

export interface NumberTypeDeclaration08 extends Parameter08{


    /**
     * (Optional, applicable only for parameters of type number or integer)
     * The minimum attribute specifies the parameter's minimum value.
     */
    minimum?: number

    /**
     * (Optional, applicable only for parameters of type number or integer)
     * The maximum attribute specifies the parameter's maximum value.
     */
    maximum?: number
}