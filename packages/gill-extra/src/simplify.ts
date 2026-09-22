/**
 * Flattens a mapped or intersection type into a single object literal, so
 * editors and type errors show the members rather than the pieces the type was
 * built from.
 *
 * Purely cosmetic: `Simplify<T>` and `T` are mutually assignable.
 */
export type Simplify<T> = {
  [K in keyof T]: T[K];
};
