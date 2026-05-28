import { COLORS } from "../colors";

describe("COLORS", () => {
  it("has all required color keys", () => {
    expect(COLORS).toHaveProperty("primary");
    expect(COLORS).toHaveProperty("secondary");
    expect(COLORS).toHaveProperty("background");
    expect(COLORS).toHaveProperty("card");
    expect(COLORS).toHaveProperty("text");
    expect(COLORS).toHaveProperty("subText");
    expect(COLORS).toHaveProperty("success");
    expect(COLORS).toHaveProperty("danger");
    expect(COLORS).toHaveProperty("border");
  });

  it("uses orange as primary color", () => {
    expect(COLORS.primary).toBe("#ff6b00");
  });

  it("uses white background", () => {
    expect(COLORS.background).toBe("#ffffff");
  });
});
