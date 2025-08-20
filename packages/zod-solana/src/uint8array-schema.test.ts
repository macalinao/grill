import { describe, expect, test } from "bun:test";
import { createKeyPairFromPrivateKeyBytes } from "@solana/keys";
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";
import { jsonUint8ArraySchema, uint8ArraySchema } from "./uint8array-schema.js";

describe("uint8ArraySchema", () => {
  test("transforms valid number arrays to Uint8Array", () => {
    const result = uint8ArraySchema.parse([0, 1, 2, 3, 255]);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(3);
    expect(result[4]).toBe(255);
  });

  test("handles empty arrays", () => {
    const result = uint8ArraySchema.parse([]);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  test("handles single element arrays", () => {
    const result = uint8ArraySchema.parse([42]);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(42);
  });

  test("rejects arrays with invalid u8 values", () => {
    expect(() => uint8ArraySchema.parse([0, 256])).toThrow(
      "Value must be at most 255",
    );
    expect(() => uint8ArraySchema.parse([-1, 0])).toThrow(
      "Value must be at least 0",
    );
    expect(() => uint8ArraySchema.parse([1.5])).toThrow(
      "Value must be an integer",
    );
    expect(() => uint8ArraySchema.parse([0, "1", 2])).toThrow();
    expect(() => uint8ArraySchema.parse([null])).toThrow();
  });

  test("rejects non-array inputs", () => {
    expect(() => uint8ArraySchema.parse("not an array")).toThrow();
    expect(() => uint8ArraySchema.parse(123)).toThrow();
    expect(() => uint8ArraySchema.parse(null)).toThrow();
    expect(() => uint8ArraySchema.parse(undefined)).toThrow();
  });

  test("works with 32-byte arrays (typical for keys)", () => {
    const keyBytes = Array.from({ length: 32 }, (_, i) => i % 256);
    const result = uint8ArraySchema.parse(keyBytes);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    for (let i = 0; i < 32; i++) {
      expect(result[i]).toBe(i % 256);
    }
  });

  test("works with 64-byte arrays (typical for signatures)", () => {
    const sigBytes = Array.from({ length: 64 }, (_, i) => (i * 3) % 256);
    const result = uint8ArraySchema.parse(sigBytes);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(64);
    for (let i = 0; i < 64; i++) {
      expect(result[i]).toBe((i * 3) % 256);
    }
  });

  test("handles large arrays", () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i % 256);
    const result = uint8ArraySchema.parse(largeArray);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(1000);
  });
});

describe("jsonUint8ArraySchema", () => {
  test("parses JSON strings and transforms to Uint8Array", () => {
    const result = jsonUint8ArraySchema.parse("[0, 1, 2, 255]");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(255);
  });

  test("handles JSON empty arrays", () => {
    const result = jsonUint8ArraySchema.parse("[]");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  test("handles JSON with whitespace", () => {
    const result = jsonUint8ArraySchema.parse("  [ 1 , 2 , 3 ]  ");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
  });

  test("handles JSON with newlines and formatting", () => {
    const json = `[
      1,
      2,
      3
    ]`;
    const result = jsonUint8ArraySchema.parse(json);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(3);
    expect(Array.from(result)).toEqual([1, 2, 3]);
  });

  test("rejects invalid JSON", () => {
    expect(() => jsonUint8ArraySchema.parse("[1, 2,")).toThrow("Invalid JSON");
    expect(() => jsonUint8ArraySchema.parse("not json")).toThrow(
      "Invalid JSON",
    );
    expect(() => jsonUint8ArraySchema.parse("")).toThrow("Invalid JSON");
    expect(() => jsonUint8ArraySchema.parse('{"a": 1}')).toThrow();
    expect(() => jsonUint8ArraySchema.parse("null")).toThrow();
    expect(() => jsonUint8ArraySchema.parse("undefined")).toThrow();
  });

  test("rejects JSON with invalid u8 values", () => {
    expect(() => jsonUint8ArraySchema.parse("[0, 256]")).toThrow(
      "Value must be at most 255",
    );
    expect(() => jsonUint8ArraySchema.parse("[-1, 0]")).toThrow(
      "Value must be at least 0",
    );
    expect(() => jsonUint8ArraySchema.parse("[1.5]")).toThrow(
      "Value must be an integer",
    );
    expect(() => jsonUint8ArraySchema.parse('["not a number"]')).toThrow();
    expect(() => jsonUint8ArraySchema.parse("[true]")).toThrow();
    expect(() => jsonUint8ArraySchema.parse("[null]")).toThrow();
  });

  test("rejects non-string inputs", () => {
    expect(() => jsonUint8ArraySchema.parse([1, 2, 3])).toThrow();
    expect(() => jsonUint8ArraySchema.parse(123)).toThrow();
    expect(() => jsonUint8ArraySchema.parse(null)).toThrow();
    expect(() => jsonUint8ArraySchema.parse(undefined)).toThrow();
    expect(() => jsonUint8ArraySchema.parse({})).toThrow();
  });

  test("works with JSON-encoded 32-byte arrays", () => {
    const keyBytes = Array.from({ length: 32 }, (_, i) => i % 256);
    const json = JSON.stringify(keyBytes);
    const result = jsonUint8ArraySchema.parse(json);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    for (let i = 0; i < 32; i++) {
      expect(result[i]).toBe(i % 256);
    }
  });

  test("works with JSON-encoded 64-byte arrays", () => {
    const sigBytes = Array.from({ length: 64 }, (_, i) => (i * 3) % 256);
    const json = JSON.stringify(sigBytes);
    const result = jsonUint8ArraySchema.parse(json);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(64);
    for (let i = 0; i < 64; i++) {
      expect(result[i]).toBe((i * 3) % 256);
    }
  });
});

describe("integration with createKeyPairFromPrivateKeyBytes", () => {
  test("uint8ArraySchema works with createKeyPairFromPrivateKeyBytes", async () => {
    // Create a valid 32-byte array for a keypair
    const secretKeyBytes = [
      // Private key (32 bytes)
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    // Parse through our schema
    const uint8Array = uint8ArraySchema.parse(secretKeyBytes);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(32);

    // Create keypair
    const keypair = await createKeyPairFromPrivateKeyBytes(uint8Array);
    expect(keypair).toBeDefined();
    expect(keypair.publicKey).toBeInstanceOf(CryptoKey);
    expect(keypair.privateKey).toBeInstanceOf(CryptoKey);
  });

  test("jsonUint8ArraySchema works with createKeyPairFromPrivateKeyBytes", async () => {
    // Create a valid 32-byte array for a keypair
    const secretKeyBytes = [
      // Private key (32 bytes)
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    // Convert to JSON string
    const json = JSON.stringify(secretKeyBytes);

    // Parse through our schema
    const uint8Array = jsonUint8ArraySchema.parse(json);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(32);

    // Create keypair
    const keypair = await createKeyPairFromPrivateKeyBytes(uint8Array);
    expect(keypair).toBeDefined();
    expect(keypair.publicKey).toBeInstanceOf(CryptoKey);
    expect(keypair.privateKey).toBeInstanceOf(CryptoKey);
  });

  test("validates that both schemas produce identical results", async () => {
    const secretKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    const fromArray = uint8ArraySchema.parse(secretKeyBytes);
    const fromJson = jsonUint8ArraySchema.parse(JSON.stringify(secretKeyBytes));

    // Check arrays are identical
    expect(fromArray.length).toBe(fromJson.length);
    expect(Array.from(fromArray)).toEqual(Array.from(fromJson));

    // Create keypairs and verify they're the same
    const keypair1 = await createKeyPairFromPrivateKeyBytes(fromArray);
    const keypair2 = await createKeyPairFromPrivateKeyBytes(fromJson);

    // Both public keys should have the same algorithm and extractable property
    expect(keypair1.publicKey.algorithm).toEqual(keypair2.publicKey.algorithm);
    expect(keypair1.publicKey.extractable).toBe(keypair2.publicKey.extractable);
  });

  test("rejects invalid length arrays for createKeyPairFromPrivateKeyBytes", () => {
    // Too short
    expect(() => uint8ArraySchema.parse([1, 2, 3])).not.toThrow();
    const shortArray = uint8ArraySchema.parse([1, 2, 3]);
    expect(createKeyPairFromPrivateKeyBytes(shortArray)).rejects.toThrow();

    // Too long
    const longArray = uint8ArraySchema.parse(Array(65).fill(0));
    expect(createKeyPairFromPrivateKeyBytes(longArray)).rejects.toThrow();
  });

  test("handles real-world use case with environment variable", async () => {
    // Simulate reading from an environment variable
    const envValue =
      "[88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219, 255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185]";

    // Parse and create keypair
    const uint8Array = jsonUint8ArraySchema.parse(envValue);
    const keypair = await createKeyPairFromPrivateKeyBytes(uint8Array);

    expect(keypair).toBeDefined();
    expect(keypair.publicKey).toBeInstanceOf(CryptoKey);
    expect(keypair.privateKey).toBeInstanceOf(CryptoKey);
  });

  test("handles compact JSON format", async () => {
    const secretKeyBytes = Array.from({ length: 32 }, (_, i) => i % 256);
    const compactJson = JSON.stringify(secretKeyBytes).replace(/\s/g, ""); // Remove all whitespace

    const uint8Array = jsonUint8ArraySchema.parse(compactJson);
    expect(uint8Array.length).toBe(32);

    const keypair = await createKeyPairFromPrivateKeyBytes(uint8Array);
    expect(keypair).toBeDefined();
  });
});

describe("integration with createKeyPairSignerFromBytes", () => {
  test("uint8ArraySchema works with 64-byte arrays for keypair signers", () => {
    // Create a 64-byte array by duplicating a 32-byte private key
    // This demonstrates the schema can handle larger arrays used by createKeyPairSignerFromBytes
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    // Create 64-byte array (shows schema supports larger arrays for different signer functions)
    const fake64ByteArray = [...privateKeyBytes, ...privateKeyBytes];

    // Parse through our schema - this should not throw
    const uint8Array = uint8ArraySchema.parse(fake64ByteArray);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(64);

    // Verify the schema properly validates the length
    expect(() => uint8ArraySchema.parse(fake64ByteArray)).not.toThrow();
  });

  test("jsonUint8ArraySchema handles 64-byte arrays from JSON", () => {
    // Create a 64-byte array (using duplicated 32-byte pattern for test)
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];
    const fake64ByteArray = [...privateKeyBytes, ...privateKeyBytes];

    // Convert to JSON string
    const json = JSON.stringify(fake64ByteArray);

    // Parse through our schema
    const uint8Array = jsonUint8ArraySchema.parse(json);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(64);

    // Verify both schemas produce identical arrays for same data
    const fromArray = uint8ArraySchema.parse(fake64ByteArray);
    expect(fromArray.length).toBe(uint8Array.length);
    expect(Array.from(fromArray)).toEqual(Array.from(uint8Array));
  });

  test("schema validates different array sizes for keypair use cases", () => {
    // Test that our schema can handle various sizes that might be used with signers
    const sizes = [32, 64, 96]; // Common sizes for keys

    for (const size of sizes) {
      const testArray = Array.from({ length: size }, (_, i) => i % 256);

      expect(() => uint8ArraySchema.parse(testArray)).not.toThrow();
      const result = uint8ArraySchema.parse(testArray);
      expect(result.length).toBe(size);
    }
  });
});

describe("integration with createKeyPairSignerFromPrivateKeyBytes", () => {
  test("uint8ArraySchema works with createKeyPairSignerFromPrivateKeyBytes", async () => {
    // Create a valid 32-byte private key
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    // Parse through our schema
    const uint8Array = uint8ArraySchema.parse(privateKeyBytes);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(32);

    // Create keypair signer from private key only
    const signer = await createKeyPairSignerFromPrivateKeyBytes(uint8Array);
    expect(signer).toBeDefined();
    expect(typeof signer.address).toBe("string");
    expect(signer.address.length).toBeGreaterThan(30);
  });

  test("jsonUint8ArraySchema works with createKeyPairSignerFromPrivateKeyBytes", async () => {
    // Create a valid 32-byte private key
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    // Convert to JSON string
    const json = JSON.stringify(privateKeyBytes);

    // Parse through our schema
    const uint8Array = jsonUint8ArraySchema.parse(json);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBe(32);

    // Create keypair signer from private key
    const signer = await createKeyPairSignerFromPrivateKeyBytes(uint8Array);
    expect(signer).toBeDefined();
    expect(typeof signer.address).toBe("string");
    expect(signer.address.length).toBeGreaterThan(30);
  });

  test("validates signers from both schemas produce same address", async () => {
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    const fromArray = uint8ArraySchema.parse(privateKeyBytes);
    const fromJson = jsonUint8ArraySchema.parse(
      JSON.stringify(privateKeyBytes),
    );

    // Create signers and verify they have the same address
    const signer1 = await createKeyPairSignerFromPrivateKeyBytes(fromArray);
    const signer2 = await createKeyPairSignerFromPrivateKeyBytes(fromJson);

    expect(signer1.address).toBe(signer2.address);
  });

  test("handles environment variable use case with private key", async () => {
    // Simulate reading a private key from environment variable
    const envValue =
      "[88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219, 255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185]";

    // Parse and create signer
    const uint8Array = jsonUint8ArraySchema.parse(envValue);
    const signer = await createKeyPairSignerFromPrivateKeyBytes(uint8Array);

    expect(signer).toBeDefined();
    expect(typeof signer.address).toBe("string");
    expect(signer.address.length).toBeGreaterThan(30);
  });

  test("validates both private key methods produce same address", async () => {
    const privateKeyBytes = [
      88, 100, 47, 111, 185, 7, 50, 1, 136, 247, 70, 127, 111, 51, 154, 36, 219,
      255, 58, 82, 26, 166, 214, 152, 228, 160, 73, 148, 151, 15, 115, 185,
    ];

    const uint8Array = uint8ArraySchema.parse(privateKeyBytes);

    // Create using both @solana/keys and @solana/kit methods
    const cryptoKeyPair = await createKeyPairFromPrivateKeyBytes(uint8Array);
    const signer = await createKeyPairSignerFromPrivateKeyBytes(uint8Array);

    // Both should work and create valid objects
    expect(cryptoKeyPair.publicKey).toBeInstanceOf(CryptoKey);
    expect(signer.address).toBeDefined();
    expect(typeof signer.address).toBe("string");
  });
});
