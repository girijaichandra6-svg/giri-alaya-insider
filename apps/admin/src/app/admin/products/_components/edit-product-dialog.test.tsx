import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditProductDialog } from "./edit-product-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("./use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(
    <EditProductDialog
      productId="p1"
      initialTitle="Running Shoes"
      initialDescription="Comfortable running shoes"
      initialBasePrice={99.99}
      initialCurrency="USD"
      initialIsActive={true}
    />
  );
  fireEvent.click(screen.getByTitle("Edit product"));
}

describe("EditProductDialog", () => {
  it("renders closed state with edit button", () => {
    render(
      <EditProductDialog
        productId="p1"
        initialTitle="Test"
        initialDescription=""
        initialBasePrice={null}
        initialCurrency="USD"
        initialIsActive={false}
      />
    );
    expect(screen.getByTitle("Edit product")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit product/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit product/i })).toBeDefined();
    expect((screen.getByDisplayValue("Running Shoes") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("Comfortable running shoes") as HTMLTextAreaElement)).toBeDefined();
    expect((screen.getByDisplayValue("99.99") as HTMLInputElement)).toBeDefined();
    expect(screen.getByText("Price (USD)")).toBeDefined();
  });

  it("renders with active status selected", () => {
    openDialog();
    const statusSelect = screen.getByDisplayValue("Active") as HTMLSelectElement;
    expect(statusSelect).toBeDefined();
  });

  it("updates product successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Product updated", variant: "success" })
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
      expect(callBody.id).toBe("p1");
      expect(callBody.title).toBe("Running Shoes");
      expect(callBody.description).toBe("Comfortable running shoes");
      expect(callBody.basePrice).toBe(99.99);
      expect(callBody.isActive).toBe(true);
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Update failed" }, 400);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not update product", variant: "error" })
      );
    });
  });

  it("disables submit with empty title", () => {
    openDialog();
    const input = screen.getByDisplayValue("Running Shoes") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit product/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
