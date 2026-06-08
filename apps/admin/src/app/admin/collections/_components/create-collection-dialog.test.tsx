import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateCollectionDialog } from "./create-collection-dialog";
import {
  simulateDrag,
  mockFetchOnce,
  mockFetchPending,
  mockFetchTextOnce,
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
  { id: "p4", title: "Smart Watch Pro" },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function openDialog() {
  render(<CreateCollectionDialog products={sampleProducts} />);
  fireEvent.click(screen.getByText("New Collection"));
}

function getTitleInput(): HTMLInputElement {
  return screen.getByPlaceholderText("Collection title") as HTMLInputElement;
}

function getSlugInput(): HTMLInputElement {
  return screen.getByPlaceholderText("auto-generated from title") as HTMLInputElement;
}

function getSubmitButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /create collection/i }) as HTMLButtonElement;
}

function getHeading(): HTMLElement {
  return screen.getByRole("heading", { name: /create collection/i });
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("CreateCollectionDialog", () => {
  // --- Rendering ---

  it("renders the closed state with a New Collection button", () => {
    render(<CreateCollectionDialog products={sampleProducts} />);
    expect(screen.getByText("New Collection")).toBeDefined();
    expect(screen.queryByRole("button", { name: /create collection/i })).toBeNull();
  });

  it("opens the dialog when the button is clicked", () => {
    openDialog();
    expect(getHeading()).toBeDefined();
    expect(getTitleInput()).toBeDefined();
  });

  // --- Title & Slug ---

  it("auto-generates slug from the title", () => {
    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Summer Sale" } });
    expect(getSlugInput().value).toBe("summer-sale");
  });

  it("auto-slug handles special characters", () => {
    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Luxury! Watches & Co." } });
    expect(getSlugInput().value).toBe("luxury-watches-co");
  });

  it("does not override slug after manual edit", () => {
    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Summer" } });
    fireEvent.change(getSlugInput(), { target: { value: "my-custom-slug" } });
    fireEvent.change(getTitleInput(), { target: { value: "Winter" } });
    expect(getSlugInput().value).toBe("my-custom-slug");
  });

  // --- Product Search & Filtering ---

  it("shows all products by default in the checkbox list", () => {
    openDialog();
    sampleProducts.forEach((p) => {
      expect(screen.getByText(p.title)).toBeDefined();
    });
  });

  it("filters products when searching", () => {
    openDialog();
    const searchInput = screen.getByPlaceholderText("Search products to assign...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "Watch" } });
    expect(screen.getByText("Luxury Watch")).toBeDefined();
    expect(screen.getByText("Smart Watch Pro")).toBeDefined();
    expect(screen.queryByText("Designer Handbag")).toBeNull();
    expect(screen.queryByText("Premium Sneakers")).toBeNull();
  });

  it('shows "No products found" when search matches nothing', () => {
    openDialog();
    const searchInput = screen.getByPlaceholderText("Search products to assign...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "zzzzz" } });
    expect(screen.getByText("No products found.")).toBeDefined();
  });

  // --- Product Selection ---

  it("checks a product checkbox to add it to selected list", () => {
    openDialog();
    const checkbox = screen.getAllByRole("checkbox")[0]! as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText("Products (1 selected)")).toBeDefined();
  });

  it("unchecks a product checkbox to remove it from selected list", () => {
    openDialog();
    const checkbox = screen.getAllByRole("checkbox")[0]! as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(screen.getByText("Products (0 selected)")).toBeDefined();
  });

  it("shows position numbers for each selected product", () => {
    openDialog();
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[1]!);
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("removes a product from the selected section via the X button", () => {
    openDialog();
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    expect(screen.getByText("Products (1 selected)")).toBeDefined();
    const removeBtn = screen.getByTitle("Remove");
    fireEvent.click(removeBtn);
    expect(screen.getByText("Products (0 selected)")).toBeDefined();
  });

  // --- Drag-and-drop reorder ---

  it("reorders selected products when dragged down", () => {
    openDialog();
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[1]!);
    fireEvent.click(checkboxes[2]!);

    const dragDivs = screen
      .getAllByRole("generic")
      .filter((el) => el.getAttribute("draggable") === "true");
    expect(dragDivs).toHaveLength(3);

    // Drag first item to third position (index 0 → index 2)
    simulateDrag(dragDivs[0]!, dragDivs[2]!);

    // After reorder: Fashion Handbag, Premium Sneakers, Luxury Watch
    const positionSpans = screen
      .getAllByText(/^[0-9]+$/)
      .filter((el) => el.className?.includes("font-mono") ?? false);

    expect(positionSpans[0]?.textContent).toBe("1");
    expect(positionSpans[1]?.textContent).toBe("2");
    expect(positionSpans[2]?.textContent).toBe("3");
  });

  it("reorders selected products when dragged up", () => {
    openDialog();
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[1]!);
    fireEvent.click(checkboxes[2]!);

    const dragDivs = screen
      .getAllByRole("generic")
      .filter((el) => el.getAttribute("draggable") === "true");

    // Drag third item to first position (index 2 → index 0)
    simulateDrag(dragDivs[2]!, dragDivs[0]!);

    const positionSpans = screen
      .getAllByText(/^[0-9]+$/)
      .filter((el) => el.className?.includes("font-mono") ?? false);

    expect(positionSpans[0]?.textContent).toBe("1");
    expect(positionSpans[1]?.textContent).toBe("2");
    expect(positionSpans[2]?.textContent).toBe("3");
  });

  // --- Form submission ---

  it("submits the form successfully and refreshes the router", async () => {
    mockFetchOnce({ id: "new-collection" }, 201);

    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Test Collection" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Collection created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits selected productIds with correct order", async () => {
    mockFetchOnce({ id: "new-collection" }, 201);

    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "My Collection" } });

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[1]!);
    fireEvent.click(checkboxes[2]!);

    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalled();
    });

    const callBody = getFetchCallBody();
    expect(callBody.productIds).toEqual([
      { productId: "p1", order: 0 },
      { productId: "p2", order: 1 },
      { productId: "p3", order: 2 },
    ]);
  });

  it("shows an error toast when the API returns an error", async () => {
    mockFetchOnce({ error: "Slug already exists" }, 409);

    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Test" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Slug already exists",
          variant: "error",
        })
      );
    });
  });

  it("shows a fallback error toast when API response has no error field", async () => {
    mockFetchTextOnce("Internal Server Error", 500);

    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Test" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Failed to create collection",
          variant: "error",
        })
      );
    });
  });

  it("does not submit when the title is empty", () => {
    openDialog();
    expect(getSubmitButton().disabled).toBe(true);
  });

  // --- Close behavior ---

  it("closes the dialog when clicking Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create collection/i })).toBeNull();
  });

  it("resets form state when closed and reopened", () => {
    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "My Title" } });
    expect(getTitleInput().value).toBe("My Title");

    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("New Collection"));

    expect(getTitleInput().value).toBe("");
    expect(getSlugInput().value).toBe("");
  });

  it("disables the submit button while loading", async () => {
    mockFetchPending();

    openDialog();
    fireEvent.change(getTitleInput(), { target: { value: "Test" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeDefined();
    });
    // Button should be disabled while loading
    const creatingButton = screen.getByText("Creating...").closest("button");
    expect(creatingButton).not.toBeNull();
    expect((creatingButton as HTMLButtonElement).disabled).toBe(true);
  });
});
