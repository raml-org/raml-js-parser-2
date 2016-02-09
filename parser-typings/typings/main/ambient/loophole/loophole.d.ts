// Compiled using typings@0.5.2
// Source: custom_typings/loophole.d.ts
declare module 'loophole' {
  export function Function (...params: string[]): Function
  export function allowUnsafeEval(fn: () => any): void
  export function allowUnsafeNewFunction(fn: () => any): void
}