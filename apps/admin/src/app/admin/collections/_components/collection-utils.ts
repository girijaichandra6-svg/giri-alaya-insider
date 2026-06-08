export interface CollectionProductRef {
  productId: string;
  title: string;
}

export interface ProductOption {
  id: string;
  title: string;
}

/**
 * Toggle a product in/out of the selected products list.
 * If the product is already selected, remove it; otherwise add it at the end.
 */
export function toggleProductInList(
  selectedProducts: CollectionProductRef[],
  productId: string,
  title: string
): CollectionProductRef[] {
  const alreadySelected = selectedProducts.some((p) => p.productId === productId);
  if (alreadySelected) {
    return selectedProducts.filter((p) => p.productId !== productId);
  } else {
    return [...selectedProducts, { productId, title }];
  }
}

/**
 * Reorder an item from one index to another within an array.
 * Returns a new array; does not mutate the original.
 * If the source index is out of bounds, returns the original array unchanged.
 */
export function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= items.length) return items;
  if (toIndex < 0 || toIndex >= items.length) return items;
  if (fromIndex === toIndex) return items;

  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  if (!moved) return items;
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Filter products by search query (case-insensitive match on title).
 */
export function filterProductsBySearch(
  products: ProductOption[],
  search: string
): ProductOption[] {
  const trimmed = search.trim();
  if (!trimmed) return products;
  return products.filter((p) =>
    p.title.toLowerCase().includes(trimmed.toLowerCase())
  );
}
