import type { JsonObject, JsonValue } from "../types/json-value.js";
import { describe, expect, it } from "bun:test";
import { jsonObjectSchema, jsonValueSchema } from "./json-value.js";

describe("jsonValueSchema", () => {
  it("accepts every JSON primitive", () => {
    expect(jsonValueSchema.parse("hello")).toBe("hello");
    expect(jsonValueSchema.parse(42)).toBe(42);
    expect(jsonValueSchema.parse(true)).toBe(true);
    expect(jsonValueSchema.parse(null)).toBeNull();
  });

  it("accepts arrays", () => {
    expect(jsonValueSchema.parse([1, "two", false, null])).toEqual([
      1,
      "two",
      false,
      null,
    ]);
  });

  it("accepts objects", () => {
    expect(jsonValueSchema.parse({ a: 1 })).toEqual({ a: 1 });
  });

  it("accepts deeply nested values", () => {
    const nested = {
      level1: { level2: [{ level3: [1, { level4: null }] }] },
    };
    const parsed: JsonValue = jsonValueSchema.parse(nested);

    expect(parsed).toEqual(nested);
  });

  it("rejects values that are not JSON", () => {
    expect(() => jsonValueSchema.parse(undefined)).toThrow();
    expect(() => jsonValueSchema.parse(() => null)).toThrow();
    expect(() => jsonValueSchema.parse(new Date(0))).toThrow();
    expect(() => jsonValueSchema.parse(1n)).toThrow();
  });

  it("rejects a non-JSON value nested inside a structure", () => {
    expect(() => jsonValueSchema.parse({ a: [{ b: undefined }] })).toThrow();
  });
});

describe("jsonObjectSchema", () => {
  it("accepts a JSON object", () => {
    const parsed: JsonObject = jsonObjectSchema.parse({
      string: "s",
      number: 1,
      boolean: false,
      null: null,
      array: [1, 2],
      object: { nested: true },
    });

    expect(parsed["string"]).toBe("s");
    expect(parsed["object"]).toEqual({ nested: true });
  });

  it("rejects non-objects", () => {
    expect(() => jsonObjectSchema.parse("not an object")).toThrow();
    expect(() => jsonObjectSchema.parse(null)).toThrow();
  });

  it("rejects an object with a non-JSON value", () => {
    expect(() => jsonObjectSchema.parse({ fn: () => null })).toThrow();
  });
});
