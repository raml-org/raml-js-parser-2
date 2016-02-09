// Compiled using typings@0.5.2
// Source: custom_typings/xtend.d.ts
declare module 'xtend/mutable' {
  var extend: {
    <T>(dest: T, ...src: any[]): T
  }

  export = extend
}

declare module 'xtend/immutable' {
  var extend: {
    <T>(...src: any[]): T
  }

  export = extend
}

declare module 'xtend' {
  import immutable = require('xtend/immutable')

  export = immutable
}