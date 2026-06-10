import { sanitize, sanitizeOptional } from "../sanitize";

describe("sanitize", () => {
  it("strips HTML tags", () => {
    expect(sanitize("<script>alert('xss')</script>")).toBe("alert(xss)");
  });

  it("removes angle brackets from partial tag", () => {
    expect(sanitize("hello<")).toBe("hello");
  });

  it("removes double quotes", () => {
    expect(sanitize('test"value')).toBe("testvalue");
  });

  it("removes backslashes", () => {
    expect(sanitize("test\\value")).toBe("testvalue");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("preserves normal text", () => {
    expect(sanitize("Hello, this is a normal order.")).toBe("Hello, this is a normal order.");
  });

  it("handles empty string", () => {
    expect(sanitize("")).toBe("");
  });
});

describe("sanitizeOptional", () => {
  it("returns empty string for null", () => {
    expect(sanitizeOptional(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(sanitizeOptional(undefined)).toBe("");
  });

  it("sanitizes a provided string", () => {
    expect(sanitizeOptional("<b>hello</b>")).toBe("hello");
  });
});
