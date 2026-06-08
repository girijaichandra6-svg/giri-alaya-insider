import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditSubcategoryDialog } from "./edit-subcategory-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

const sampleSubcategory = {
  id: "sub-1",
  name: "Smart Watches",
  slug: "smart-watches",
  description: "High-tech timepieces",
  categoryId: "c1",
};

const sampleCategories = [
  { id: "c1", name: "Electronics" },
  { id: "c2", name: "Clothing" },
];

function openDialog() {
  render(<EditSubcategoryDialog subcategory={sampleSubcategory} categories={sampleCategories} />);
  fireEvent.click(screen.getByTitle("Edit subcategory"));
}

describe("EditSubcategoryDialog", () => {
  it("renders closed state with edit button", () => {
    render(<EditSubcategoryDialog subcategory={sampleSubcategory} categories={sampleCategories} />);
    expect(screen.getByTitle("Edit subcategory")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit subcategory/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit subcategory/i })).toBeDefined();
    expect((screen.getByDisplayValue("Smart Watches") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("smart-watches") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("High-tech timepieces") as HTMLTextAreaElement)).toBeDefined();
  });

  it("updates subcategory successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Subcategory updated", variant: "success" })
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
      expect(callBody.id).toBe("sub-1");
      expect(callBody.name).toBe("Smart Watches");
      expect(callBody.slug).toBe("smart-watches");
      expect(callBody.categoryId).toBe("c1");
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Name taken" }, 409);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Name taken", variant: "error" })
      );
    });
  });

  it("disables submit with empty name", () => {
    openDialog();
    fireEvent.change(screen.getByDisplayValue("Smart Watches"), { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit subcategory/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
