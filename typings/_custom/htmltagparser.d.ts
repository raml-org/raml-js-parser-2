
declare module htmltagparser {
    interface Tag {
        /**
         * the type/name of tag ( div, input, etc )
         */
        tag: string

        /**
         * optional ID string ( '#my-form' --> 'my-form' ) ( null if no ID )
         */
        id?: string

        /**
         * array of strings containing classes ( empty if no classes )
         */
        classes: string[]
    }

    interface Parser {
        /**
         *
         * @param str the string to parse
         * @param strict whether to check for valid HTML tags. Defaults to yes
         * @param lowercase whether to force lowercasing. defaults to yes
         */
        ( str: string, strict?: boolean, lowercase?: boolean ): Tag
    }

}

declare module "htmltagparser" {
    var x: htmltagparser.Parser
    export = x
}