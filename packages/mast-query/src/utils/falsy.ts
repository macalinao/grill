export type Falsy = false | 0 | 0n | "" | null | undefined;

export const isTruthy = <T>(x: T | Falsy): x is T => !!x;