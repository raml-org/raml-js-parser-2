declare module 'loophole' {
  export function Function (...params: string[]): Function
  export function allowUnsafeEval(fn: () => any): void
  export function allowUnsafeNewFunction(fn: () => any): void
}
