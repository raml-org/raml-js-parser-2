import common = require("./common");

export interface ExampleFragment extends ExampleSpec10, common.FragmentDeclaration{}

export type TypeDeclarationFragment = StringTypeFragment
    |NumberTypeFragment|DateTypeFragment|FileTypeFragment|ArrayTypeFragment|ObjectTypeFragment;

export interface StringTypeFragment extends common.FragmentDeclaration, StringTypeDeclaration{}
export interface NumberTypeFragment extends common.FragmentDeclaration, NumberTypeDeclaration{}
export interface DateTypeFragment extends common.FragmentDeclaration, DateTypeDeclaration{}
export interface FileTypeFragment extends common.FragmentDeclaration, FileTypeDeclaration{}
export interface ArrayTypeFragment extends common.FragmentDeclaration, ArrayTypeDeclaration{}
export interface ObjectTypeFragment extends common.FragmentDeclaration, ObjectTypeDeclaration{}

export interface ExampleSpec10 extends common.Annotable {

    /**
     * Actual example value
     */
    value: any

    /**
     * By default, examples are validated against any type declaration.
     * Set this to false to allow examples that need not validate.
     */
    strict?: boolean

    /**
     * Example identifier, if specified
     */
    name?: string

    /**
     * A longer, human-friendly description of the example
     */
    description?: string

    /**
     * An alternate, human-friendly name for the example
     */
    displayName?: string
}
export type TypeReference10 = string[] | TypeDeclaration;

export interface TypeDeclaration extends common.Annotable {

    type: TypeReference10[]

    /**
     * An example of this type instance represented as string.
     * This can be used, e.g., by documentation generators to generate
     * sample values for an object of this type. Cannot be present
     * if the example property is present
     */
    examples?: ExampleSpec10[]

    /**
     * An array containing plain example values.String, boolean and number
     * values remain as is, while object and array values are serialized to string.
     */
    simplifiedExamples?: (string|number|boolean)[]

    /**
     * name of the parameter
     */
    //TODO fix comment
    name: string

    /**
     * Provides default value for a property
     */
    default?: any

    /**
     * A longer, human-friendly description of the type
     */
    description?: string

    /**
     * Restrictions on where annotations of this type can be applied.
     * If this property is specified, annotations of this type may only
     * be applied on a property corresponding to one of the target names
     * specified as the value of this property.
     */
    allowedTargets?: string[]

    xml?: {
        /**
         * If attribute is set to true, a type instance should be serialized
         * as an XML attribute. It can only be true for scalar types.
         */
        attribute?: boolean

        /**
         * If wrapped is set to true, a type instance should be wrapped
         * in its own XML element. It can not be true for scalar types and
         * it can not be true at the same moment when attribute is true
         */
        wrapped?: boolean

        /**
         * Allows to override the name of the XML element or
         * XML attribute in it's XML representation
         */
        name?: string

        /**
         * Allows to configure the name of the XML namespace
         */
        namespace?: string

        /**
         * Allows to configure the prefix which will be used
         * during serialization to XML
         */
        prefix?: string
    }

    /**
     * Sets if property is optional or not
     */
    //TODO fix comment
    required?: boolean

    /**
     * The displayName attribute specifies the type display name.
     * It is a friendly name used only for  display or documentation purposes.
     * If displayName is not specified, it defaults to the element's key
     * (the name of the property itself
     */
    displayName?: string

    /**
     * When extending from a type you can define new facets
     * (which can then be set to concrete values by subtypes).
     */
    facets?: TypeReference10[]

    /**
     * Returns facets fixed by the type. Value is an object with
     * properties named after facets fixed. Value of each property is
     * a value of the corresponding facet.
     */
    fixedFacets?: { name:string, value:any }[]
}

export interface ArrayTypeDeclaration extends TypeDeclaration {

    /**
     * Should items in array be unique
     */
    uniqueItems?: boolean

    /**
     * Minimum amount of items in array
     */
    minItems?: number

    /**
     * Maximum amount of items in array
     */
    maxItems?: number

    /**
     * Component type
     */
    items: TypeReference10[]
}

/**
 * (Applicable only to Form properties) Value is a file.
 * Client generators SHOULD use this type to handle file uploads correctly.
 */
//TODO fix description
export interface FileTypeDeclaration extends TypeDeclaration {

    /**
     * A list of valid content-type strings for the file.
     */
    fileTypes?: string[]

    /**
     * The minLength attribute specifies the parameter value's minimum number of bytes.
     */
    minLength?: number

    /**
     * The maxLength attribute specifies the parameter value's maximum number of bytes.
     */
    maxLength?: number
}

export interface StringTypeDeclaration extends TypeDeclaration {
    /**
     * The enum attribute provides an enumeration of the parameter's valid values.
     * This MUST be an array. If the enum attribute is defined, API clients
     * and servers MUST verify that a parameter's value matches a value in the enum array.
     * If there is no matching value, the clients and servers MUST treat this as an error.
     */
    enum?: string[]

    /**
     * Regular expression that this string should path
     */
    pattern?: string[]

    /**
     * Minimum length of the string
     */
    minLength?: number

    /**
     * Maximum length of the string
     */
    maxLength?: number
}

/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 */
export interface NumberTypeDeclaration extends TypeDeclaration {

    /**
     * The enum attribute provides an enumeration of the parameter's valid values.
     * This MUST be an array. If the enum attribute is defined, API clients
     * and servers MUST verify that a parameter's value matches a value in the enum array.
     * If there is no matching value, the clients and servers MUST treat this as an error.
     */
    enum?: string[]

    /**
     * The minimum attribute specifies the parameter's minimum value.
     */
    minimum?: number

    /**
     * The maximum attribute specifies the parameter's maximum value.
     */
    maximum?: number

    /**
     * Value format
     */
    format?: string

    /**
     * A numeric instance is valid against \"multipleOf\" if the result of the division
     * of the instance by this keywords value is an integer.
     */
    multipleOf?: number
}

export interface ObjectTypeDeclaration extends TypeDeclaration {

    /**
     * Type property name to be used as discriminator, or boolean
     */
    discriminator?: string

    /**
     * The value of discriminator for the type
     */
    discriminatorValue?: string

    /**
     * The properties that instances of this type may or must have.
     */
    properties?: TypeDeclaration[]

    /**
     * The minimum number of properties allowed for instances of this type.
     */
    minProperties?: number

    /**
     * The maximum number of properties allowed for instances of this type.
     */
    maxProperties?: number

    /**
     * A Boolean that indicates if an object instance has additional properties.
     */
    additionalProperties?: boolean
}

/**
 * The \"full-date\" notation of RFC3339, namely yyyy-mm-dd
 * (no implications about time or timezone-offset)
 */
export interface DateTypeDeclaration extends TypeDeclaration {


}
