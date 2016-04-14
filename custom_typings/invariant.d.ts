declare module 'invariant' {
  type invariant = (condition: boolean, message: string, ...args: string[]) => void

  var _invariant: invariant

  export = _invariant
}
