// Compiled using typings@0.6.8
// Source: custom_typings/custom.d.ts
interface RadioactiveAttrs {
    onsubmit?: Function
}

interface Function0<T> {(): T}






declare module "json-pointer" {
    export function dict( obj: any ): { [pointer: string]: any }
}

/*
http://codemirror.net/doc/manual.html#addon_show-hint
*/
declare module CodeMirror {

    export interface Editor {
        showHint: Function // TODO: type some more
    }

    export module addons {
        export module showHint {

            interface Options {
                // TODO: hinting function can also be async. read the docs for more options
                hint: ( editor: CodeMirror.Editor, options: Options ) => CompletionData
                completeSingle?: boolean
                alignWithWord?: boolean
                closeOnUnFocus?: boolean
                customKeys?: any // keymap
                extraKeys?: any // keymap
            }

            interface CompletionData {
                list: Array<string | Completion>
                from: CodeMirror.Position
                to:   CodeMirror.Position
            }

            interface Completion {
                text: string
                displayText?: string
                className?: string
                render?: ( element: HTMLElement, self: any, data: any ) => void
                hint?: ( editor: CodeMirror.Editor, self: any, data: any ) => void
                from?: CodeMirror.Position
                to?: CodeMirror.Position
            }
        }
    }
}