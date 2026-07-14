import { describe, expect, it } from "bun:test";
import { DasApiError } from "./das-api-error.js";

describe("DasApiError", () => {
  it("captures the code, message, and data", () => {
    const error = new DasApiError({
      code: -32000,
      message: "Asset not found",
      data: { id: "abc" },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DasApiError);
    expect(error.name).toBe("DasApiError");
    expect(error.message).toBe("Asset not found");
    expect(error.code).toBe(-32000);
    expect(error.data).toEqual({ id: "abc" });
  });

  it("leaves data undefined when not provided", () => {
    const error = new DasApiError({ code: -32602, message: "Invalid params" });

    expect(error.code).toBe(-32602);
    expect(error.data).toBeUndefined();
  });

  it("is throwable and catchable as an Error", () => {
    expect(() => {
      throw new DasApiError({ code: 1, message: "boom" });
    }).toThrow("boom");
  });
});
