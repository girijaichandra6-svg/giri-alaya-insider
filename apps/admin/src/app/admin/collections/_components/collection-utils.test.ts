import { describe, it, expect } from "vitest";
import {
  toggleProductInList,
  reorderList,
  filterProductsBySearch,
  type ProductOption,
} from "./collection-utils";

// --------------------------------------------------------------------------
// toggleProductInList
// --------------------------------------------------------------------------
describe("toggleProductInList", () => {
  const products = [
    { productId: "p1", title: "Alpha" },
    { productId: "p2", title: "Beta" },
    { productId: "p3", title: "Gamma" },
  ];

  it("adds a product to an empty list", () => {
    const result = toggleProductInList([], "p1", "Alpha");
    expect(result).toEqual([{ productId: "p1", title: "Alpha" }]);
  });

  it("adds a product to the end of a non-empty list", () => {
    const result = toggleProductInList(products, "p4", "Delta");
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({ productId: "p4", title: "Delta" });
  });

  it("removes a product that is already in the list", () => {
    const result = toggleProductInList(products, "p2", "Beta");
    expect(result).toEqual([
      { productId: "p1", title: "Alpha" },
      { productId: "p3", title: "Gamma" },
    ]);
  });

  it("removes the only item", () => {
    const result = toggleProductInList(
      [{ productId: "p1", title: "Alpha" }],
      "p1",
      "Alpha"
    );
    expect(result).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const original = [...products];
    toggleProductInList(products, "p1", "Alpha");
    expect(products).toEqual(original);
  });
});

// --------------------------------------------------------------------------
// reorderList
// --------------------------------------------------------------------------
describe("reorderList", () => {
  const items = ["A", "B", "C", "D", "E"];

  it("moves an item forward (lower index to higher)", () => {
    // Move "B" (index 1) to position 3
    const result = reorderList(items, 1, 3);
    expect(result).toEqual(["A", "C", "D", "B", "E"]);
  });

  it("moves an item backward (higher index to lower)", () => {
    // Move "D" (index 3) to position 1
    const result = reorderList(items, 3, 1);
    expect(result).toEqual(["A", "D", "B", "C", "E"]);
  });

  it("handles moving the first item", () => {
    const result = reorderList(items, 0, 2);
    expect(result).toEqual(["B", "C", "A", "D", "E"]);
  });

  it("handles moving the last item", () => {
    const result = reorderList(items, 4, 1);
    expect(result).toEqual(["A", "E", "B", "C", "D"]);
  });

  it("returns the same array when fromIndex equals toIndex", () => {
    const result = reorderList(items, 2, 2);
    expect(result).toEqual(items);
  });

  it("returns the original array unchanged when fromIndex is out of bounds", () => {
    const result = reorderList(items, -1, 2);
    expect(result).toEqual(items);
  });

  it("returns the original array unchanged when fromIndex >= length", () => {
    const result = reorderList(items, 10, 2);
    expect(result).toEqual(items);
  });

  it("returns the original array unchanged when toIndex is out of bounds", () => {
    const result = reorderList(items, 1, -1);
    expect(result).toEqual(items);
  });

  it("returns the original array unchanged when toIndex >= length", () => {
    const result = reorderList(items, 1, 10);
    expect(result).toEqual(items);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    reorderList(items, 1, 3);
    expect(items).toEqual(original);
  });

  it("works with an array of objects", () => {
    const objs = [
      { id: "a", order: 0 },
      { id: "b", order: 1 },
      { id: "c", order: 2 },
    ];
    const result = reorderList(objs, 0, 2);
    expect(result).toEqual([
      { id: "b", order: 1 },
      { id: "c", order: 2 },
      { id: "a", order: 0 },
    ]);
  });

  it("works with a single-element array", () => {
    const result = reorderList(["only"], 0, 0);
    expect(result).toEqual(["only"]);
  });

  it("works with an empty array", () => {
    const result = reorderList([], 0, 0);
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// filterProductsBySearch
// --------------------------------------------------------------------------
describe("filterProductsBySearch", () => {
  const products: ProductOption[] = [
    { id: "1", title: "Luxury Watch" },
    { id: "2", title: "Designer Handbag" },
    { id: "3", title: "Premium Sneakers" },
    { id: "4", title: "Smart Watch Pro" },
  ];

  it("returns all products when search is empty", () => {
    const result = filterProductsBySearch(products, "");
    expect(result).toHaveLength(4);
    expect(result).toEqual(products);
  });

  it("returns all products when search is whitespace-only", () => {
    const result = filterProductsBySearch(products, "   ");
    expect(result).toHaveLength(4);
  });

  it("filters by case-insensitive match on title", () => {
    const result = filterProductsBySearch(products, "watch");
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["1", "4"]);
  });

  it("filters with uppercase search term", () => {
    const result = filterProductsBySearch(products, "WATCH");
    expect(result).toHaveLength(2);
  });

  it("returns empty array for no matches", () => {
    const result = filterProductsBySearch(products, "nonexistent");
    expect(result).toEqual([]);
  });

  it("matches partial words", () => {
    const result = filterProductsBySearch(products, "pre");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("3");
  });

  it("does not mutate the original array", () => {
    const original = [...products];
    filterProductsBySearch(products, "watch");
    expect(products).toEqual(original);
  });
});
