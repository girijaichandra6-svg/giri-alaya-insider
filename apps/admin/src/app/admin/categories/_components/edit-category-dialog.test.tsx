import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditCategoryDialog } from "./edit-category-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

const sampleCategory = {
  id: "cat-1",
  name: "Electronics",
  slug: "electronics",
  description: "All things electronic",
  accentColor: "#FF0000",
  parentId: null as string | null,
  imageUrl: "https://example.com/electronics.jpg",
  metadata: { featured: true },
};

const sampleCategories = [
  { id: "cat-1", name: "Electronics", parentId: null },
  { id: "cat-2", name: "Clothing", parentId: null },
];

function openDialog() {
  render(<EditCategoryDialog category={sampleCategory} categories={sampleCategories} />);
  fireEvent.click(screen.getByTitle("Edit category"));
}

describe("EditCategoryDialog", () => {
  it("renders closed state with edit button", () => {
    render(<EditCategoryDialog category={sampleCategory} categories={sampleCategories} />);
    expect(screen.getByTitle("Edit category")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit category/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit category/i })).toBeDefined();
    expect((screen.getByDisplayValue("Electronics") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("electronics") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("All things electronic") as HTMLTextAreaElement)).toBeDefined();
    expect((screen.getByDisplayValue("https://example.com/electronics.jpg") as HTMLInputElement)).toBeDefined();
  });

  it("excludes self from parent dropdown", () => {
    openDialog();
    // Only "Clothing" should appear (Electronics is excluded)
    expect(screen.queryByText("Electronics")).toBeNull();
    expect(screen.getByText("Clothing")).toBeDefined();
  });

  it("updates category successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Category updated", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct PATCH body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.id).toBe("cat-1");
      expect(callBody.name).toBe("Electronics");
      expect(callBody.metadata).toEqual({ featured: true });
    });
  });

  it("shows error toast on invalid JSON metadata", async () => {
    openDialog();
    const metadataTextarea = screen.getByPlaceholderText('{"key": "value"}');
    fireEvent.change(metadataTextarea, { target: { value: "not-json" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Invalid JSON in metadata field", variant: "error" })
      );
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Slug taken" }, 409);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Slug taken", variant: "error" })
      );
    });
  });

  it("disables submit with empty name", () => {
    openDialog();
    fireEvent.change(screen.getByDisplayValue("Electronics"), { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit category/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
