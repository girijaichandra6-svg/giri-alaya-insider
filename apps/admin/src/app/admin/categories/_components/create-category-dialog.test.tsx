import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateCategoryDialog } from "./create-category-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

const sampleCategories = [
  { id: "c1", name: "Electronics", parentId: null },
  { id: "c2", name: "Clothing", parentId: null },
  { id: "c3", name: "Laptops", parentId: "c1" },
];

function openDialog() {
  render(<CreateCategoryDialog categories={sampleCategories} />);
  fireEvent.click(screen.getByText("New Category"));
}

describe("CreateCategoryDialog", () => {
  it("renders closed state with New Category button", () => {
    render(<CreateCategoryDialog categories={sampleCategories} />);
    expect(screen.getByText("New Category")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create category/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create category/i })).toBeDefined();
  });

  it("auto-generates slug from name", () => {
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Home & Garden" } });
    expect((screen.getByPlaceholderText("auto-generated from name") as HTMLInputElement).value).toBe("home-garden");
  });

  it("does not override slug after manual edit", () => {
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Food" } });
    fireEvent.change(screen.getByPlaceholderText("auto-generated from name"), { target: { value: "my-slug" } });
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Drinks" } });
    expect((screen.getByPlaceholderText("auto-generated from name") as HTMLInputElement).value).toBe("my-slug");
  });

  it("shows top-level categories in parent dropdown", () => {
    openDialog();
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(screen.getByText("Electronics")).toBeDefined();
    expect(screen.getByText("Clothing")).toBeDefined();
    expect(screen.queryByText("Laptops")).toBeNull(); // has parentId, not top-level
  });

  it("creates category successfully", async () => {
    mockFetchOnce({ id: "new-cat" }, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "New Cat" } });
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Category created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct POST body with metadata", async () => {
    mockFetchOnce({}, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Test" } });
    // Set accent color
    const colorInputs = screen.getAllByDisplayValue("#D4FF00");
    fireEvent.change(colorInputs[0]!, { target: { value: "#FF0000" } });
    // Set metadata
    const metadataTextarea = screen.getByPlaceholderText('{"key": "value"}');
    fireEvent.change(metadataTextarea, { target: { value: '{"priority": "high"}' } });
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.name).toBe("Test");
      expect(callBody.metadata).toEqual({ priority: "high" });
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Slug exists" }, 409);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Slug exists", variant: "error" })
      );
    });
  });

  it("disables submit with empty name", () => {
    openDialog();
    expect((screen.getByRole("button", { name: /create category/i }) as any).disabled).toBe(true);
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create category/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
