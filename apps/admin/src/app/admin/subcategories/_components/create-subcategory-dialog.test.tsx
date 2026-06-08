import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateSubcategoryDialog } from "./create-subcategory-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

const sampleCategories = [
  { id: "c1", name: "Electronics" },
  { id: "c2", name: "Clothing" },
];

function openDialog() {
  render(<CreateSubcategoryDialog categories={sampleCategories} />);
  fireEvent.click(screen.getByText("New Subcategory"));
}

describe("CreateSubcategoryDialog", () => {
  it("renders closed state with New Subcategory button", () => {
    render(<CreateSubcategoryDialog categories={sampleCategories} />);
    expect(screen.getByText("New Subcategory")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create subcategory/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create subcategory/i })).toBeDefined();
    expect(screen.getByText("Electronics")).toBeDefined();
    expect(screen.getByText("Clothing")).toBeDefined();
  });

  it("auto-generates slug from name", () => {
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Subcategory name"), { target: { value: "Smart Watches" } });
    expect((screen.getByPlaceholderText("auto-generated from name") as HTMLInputElement).value).toBe("smart-watches");
  });

  it("requires category selection", () => {
    openDialog();
    // Submit should be disabled when no category is selected
    expect((screen.getByRole("button", { name: /create subcategory/i }) as any).disabled).toBe(true);
  });

  it("creates subcategory successfully", async () => {
    mockFetchOnce({ id: "new-sub" }, 201);
    openDialog();
    // Select category
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c1" } });
    fireEvent.change(screen.getByPlaceholderText("Subcategory name"), { target: { value: "Smart Watches" } });
    fireEvent.click(screen.getByRole("button", { name: /create subcategory/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Subcategory created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct POST body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c2" } });
    fireEvent.change(screen.getByPlaceholderText("Subcategory name"), { target: { value: "T-Shirts" } });
    fireEvent.click(screen.getByRole("button", { name: /create subcategory/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.name).toBe("T-Shirts");
      expect(callBody.categoryId).toBe("c2");
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Slug exists" }, 409);
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c1" } });
    fireEvent.change(screen.getByPlaceholderText("Subcategory name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create subcategory/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Slug exists", variant: "error" })
      );
    });
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create subcategory/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c1" } });
    fireEvent.change(screen.getByPlaceholderText("Subcategory name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create subcategory/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
