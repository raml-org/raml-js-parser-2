// Compiled using typings@0.6.8
// Source: custom_typings/pretty-data.d.ts
declare module 'pretty-data' {
  export module pd {
    /**
     * Pretty print XML.
     */
    export function xml (data: string): string;

    /**
     * Pretty print JSON.
     */
    export function json (data: string): string;

    /**
     * Pretty print CSS.
     */
    export function css (data: string): string;

    /**
     * Pretty print SQL.
     */
    export function sql (data: string): string;

    /**
     * Minify XML.
     */
    export function xmlmin (data: string, preserveComments?: boolean): string;

    /**
     * Minify JSON text.
     */
    export function jsonmin (data: string): string;

    /**
     * Minify CSS text.
     */
    export function cssmin (data: string, preserveComments?: boolean): string;

    /**
     * Minify SQL text.
     */
    export function sqlmin (data: string): string;
  }
}