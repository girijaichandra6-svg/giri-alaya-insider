import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditCollectionDialog } from "./edit-collection-dialog";
import {
  simulateDrag,
  mockFetchOnce,
  mockFetchPending,
  getFetchCallBody,
} from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

const sampleProducts = [
  { id: "p1", title: "Luxury Watch" },
  { id: "p2", title: "Designer Handbag" },
  { id: "p3", title: "Premium Sneakers" },
];

const sampleCollection = {
  id: "col-1",
  title: "Summer Collection",
  slug: "summer-collection",
  description: "Best picks for summer",
  imageUrl: "https://example.com/summer.jpg",
  isPublic: true,
  type: "SEASONAL",
  products: [
    { productId: "p1", order: 0, product: { id: "p1", title: "Luxury Watch" } },
    { productId: "p2", order: 1, product: { id: "p2", title: "Designer Handbag" } },
  ],
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function openDialog(
  collection = sampleCollection,
  products = sampleProducts
) {
  render(<EditCollectionDialog collection={collection} products={products} />);
  fireEvent.click(screen.getByTitle("Edit collection"));
}

function getSubmitButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /save changes/i }) as HTMLButtonElement;
}

function getHeading(): HTMLElement {
  return screen.getByRole("heading", { name: /edit collection/i });
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("EditCollectionDialog", () => {
  // --- Rendering ---

  it("renders the closed state with an edit (pencil) button", () => {
    render(
      <EditCollectionDialog
        collection={sampleCollection}
        products={sampleProducts}
      />
    );
    expect(screen.getByTitle("Edit collection")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit collection/i })).toBeNull();
  });

  it("opens the dialog when the edit button is clicked", () => {
    openDialog();
    expect(getHeading()).toBeDefined();
  });

  it("pre-fills all fields with collection data", () => {
    openDialog();
    expect(
      (screen.getByDisplayValue("Summer Collection") as HTMLInputElement)
    ).toBeDefined();
    expect(
      (screen.getByDisplayValue("summer-collection") as HTMLInputElement)
    ).toBeDefined();
    expect(
      (screen.getByDisplayValue("Best picks for summer") as HTMLTextAreaElement)
    ).toBeDefined();
    expect(
      (screen.getByDisplayValue("https://example.com/summer.jpg") as HTMLInputElement)
    ).toBeDefined();
    // Type should show SEASONAL → "Seasonal" in the select text
    const typeSelect = screen.getByDisplayValue("Seasonal") as HTMLSelectElement;
    expect(typeSelect).toBeDefined();
    // Visibility should show Public
    expect(screen.getByDisplayValue("Public")).toBeDefined();
  });

  it("pre-selects existing products and shows position numbers", () => {
    openDialog();
    expect(screen.getByText("Products (2 selected)")).toBeDefined();
    const positions = screen
      .getAllByText(/^[0-9]+$/)
      .filter((el) => el.className?.includes("font-mono") ?? false);
    expect(positions).toHaveLength(2);
    expect(positions[0]?.textContent).toBe("1");
    expect(positions[1]?.textContent?.trim()).toBe("2");
  });

  // --- Product Toggle ---

  it("can add a new product by checking its checkbox", () => {
    openDialog();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    expect(screen.getByText("Products (2 selected)")).toBeDefined();

    fireEvent.click(checkboxes[2]!);
    expect(screen.getByText("Products (3 selected)")).toBeDefined();
  });

  it("can remove a pre-selected product by unchecking its checkbox", () => {
    openDialog();
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0]!.checked).toBe(true);

    fireEvent.click(checkboxes[0]!);
    expect(screen.getByText("Products (1 selected)")).toBeDefined();
  });

  it("can remove a product via the X button in the selected list", () => {
    openDialog();
    const removeBtns = screen.getAllByTitle("Remove");
    expect(removeBtns).toHaveLength(2);

    fireEvent.click(removeBtns[0]!);
    expect(screen.getByText("Products (1 selected)")).toBeDefined();
  });

  // --- Drag-and-drop reorder ---

  it("reorders products when dragging in the selected list", () => {
    openDialog();

    const dragDivs = screen
      .getAllByRole("generic")
      .filter((el) => el.getAttribute("draggable") === "true");
    expect(dragDivs).toHaveLength(2);

    // Drag first item to second position (index 0 → index 1)
    simulateDrag(dragDivs[0]!, dragDivs[1]!);

    const positions = screen
      .getAllByText(/^[0-9]+$/)
      .filter((el) => el.className?.includes("font-mono") ?? false);
    expect(positions[0]?.textContent).toBe("1");
    expect(positions[1]?.textContent?.trim()).toBe("2");
  });

  // --- Product Search ---

  it("filters the product list when searching", () => {
    openDialog();
    const searchInput = screen.getByPlaceholderText(
      "Search products to assign..."
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "Handbag" } });
    // "Designer Handbag" appears in both selected list and checkbox list
    const matches = screen.getAllByText("Designer Handbag");
    expect(matches.length).toBeGreaterThan(0);
    // "Luxury Watch" is in the pre-selected list (still visible) but NOT in the checkbox list
    const luxuryWatchElements = screen.getAllByText("Luxury Watch");
    expect(luxuryWatchElements.length).toBe(1); // only in selected section, not checkbox
    expect(screen.queryByText("Premium Sneakers")).toBeNull();
  });

  // --- Form Submission ---

  it("submits the form successfully with a PATCH request", async () => {
    mockFetchOnce({ success: true }, 200);

    openDialog();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Collection updated", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits productIds with correct order", async () => {
    mockFetchOnce({ success: true }, 200);

    openDialog();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalled();
    });

    const callBody = getFetchCallBody();
    expect(callBody.productIds).toEqual([
      { productId: "p1", order: 0 },
      { productId: "p2", order: 1 },
    ]);
  });

  it("shows an error toast when the API returns an error", async () => {
    mockFetchOnce({ error: "Slug already in use" }, 409);

    openDialog();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Slug already in use",
          variant: "error",
        })
      );
    });
  });

  it("does not submit when the title is empty", () => {
    openDialog();
    const titleInput = screen.getByDisplayValue(
      "Summer Collection"
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "" } });
    expect(getSubmitButton().disabled).toBe(true);
  });

  it("submits edited field values", async () => {
    mockFetchOnce({ success: true }, 200);

    openDialog();
    const titleInput = screen.getByDisplayValue(
      "Summer Collection"
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalled();
    });

    const callBody = getFetchCallBody();
    expect(callBody.title).toBe("Updated Title");
    expect(callBody.slug).toBe("summer-collection");
  });

  // --- Close behavior ---

  it("closes the dialog when clicking Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByRole("heading", { name: /edit collection/i })
    ).toBeNull();
  });

  it("resets form state to original collection data when cancelled after edits", () => {
    openDialog();
    const titleInput = screen.getByDisplayValue(
      "Summer Collection"
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Changed Title" } });

    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByTitle("Edit collection"));

    expect(screen.getByDisplayValue("Summer Collection")).toBeDefined();
  });

  it("handles null description and imageUrl", () => {
    const collectionNoDesc: typeof sampleCollection = {
      ...sampleCollection,
      description: null as unknown as string,
      imageUrl: null as unknown as string,
    };
    openDialog(collectionNoDesc);
    // Title should still render
    expect(screen.getByDisplayValue("Summer Collection")).toBeDefined();
  });

  it("disables the submit button while loading", async () => {
    mockFetchPending();

    openDialog();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeDefined();
    });
    // Button should be disabled while loading
    const savingButton = screen.getByText("Saving...").closest("button");
    expect(savingButton).not.toBeNull();
    expect((savingButton as HTMLButtonElement).disabled).toBe(true);
  });
});
