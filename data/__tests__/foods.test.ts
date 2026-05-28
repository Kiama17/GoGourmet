import { foods } from "../foods";

describe("foods data", () => {
  it("has 12 food items", () => {
    expect(foods).toHaveLength(12);
  });

  it("each item has required fields", () => {
    foods.forEach((food) => {
      expect(food).toHaveProperty("id");
      expect(food).toHaveProperty("name");
      expect(food).toHaveProperty("price");
      expect(food).toHaveProperty("image");
      expect(food).toHaveProperty("description");
      expect(food).toHaveProperty("category");
      expect(food).toHaveProperty("rating");
    });
  });

  it("has unique ids", () => {
    const ids = foods.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has prices as positive numbers", () => {
    foods.forEach((food) => {
      expect(food.price).toBeGreaterThan(0);
    });
  });

  it("has ratings between 0 and 5", () => {
    foods.forEach((food) => {
      expect(food.rating).toBeGreaterThanOrEqual(0);
      expect(food.rating).toBeLessThanOrEqual(5);
    });
  });

  it("includes all expected food items", () => {
    const names = foods.map((f) => f.name);
    expect(names).toContain("Burger Deluxe");
    expect(names).toContain("Pepperoni Pizza");
    expect(names).toContain("Chicken Wrap");
    expect(names).toContain("Loaded Fries");
    expect(names).toContain("Milkshake");
    expect(names).toContain("Nyama Choma");
    expect(names).toContain("Pilau");
    expect(names).toContain("Ugali & Fish");
    expect(names).toContain("Chapati & Beans");
    expect(names).toContain("Samosas (6 pcs)");
    expect(names).toContain("Mukimo");
    expect(names).toContain("Mandazi (4 pcs)");
  });

  it("has valid image URLs", () => {
    foods.forEach((food) => {
      expect(food.image).toMatch(/^https?:\/\/.+/);
    });
  });
});
