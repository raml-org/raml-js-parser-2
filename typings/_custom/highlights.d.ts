/// <reference path="./atom.d.ts" />

declare module 'highlights' {
  interface HighlightsOptions {
    fileContents: string
    scopeName: string
  }

  interface ConstructorOptions {
    registry?: AtomCore.IGrammarRegistry
  }

  class Highlights {
    constructor(options: ConstructorOptions)
    highlightSync(options: HighlightsOptions): string
  }

  export = Highlights
}
