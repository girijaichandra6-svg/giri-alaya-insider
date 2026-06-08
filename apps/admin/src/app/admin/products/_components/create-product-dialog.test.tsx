import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProductDialog } from "./create-product-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("./use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<CreateProductDialog />);
  fireEvent.click(screen.getByText("New Product"));
}

describe("CreateProductDialog", () => {
  it("renders closed state with New Product button", () => {
    render(<CreateProductDialog />);
    expect(screen.getByText("New Product")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create product/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create product/i })).toBeDefined();
    expect(screen.getByPlaceholderText("Product name")).toBeDefined();
    expect(screen.getByPlaceholderText("Product description")).toBeDefined();
    expect(screen.getByPlaceholderText("Brand name")).toBeDefined();
    expect(screen.getByPlaceholderText("0.00")).toBeDefined();
  });

  it("creates a product successfully", async () => {
    mockFetchOnce({ id: "p1" }, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Running Shoes" } });
    fireEvent.change(screen.getByPlaceholderText("Product description"), { target: { value: "Comfortable running shoes" } });
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Nike" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "99.99" } });
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Product created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct POST body", async () => {
    mockFetchOnce({}, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Running Shoes" } });
    fireEvent.change(screen.getByPlaceholderText("Product description"), { target: { value: "Comfortable running shoes" } });
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Nike" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "99.99" } });
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.title).toBe("Running Shoes");
      expect(callBody.description).toBe("Comfortable running shoes");
      expect(callBody.brand).toBe("Nike");
      expect(callBody.basePrice).toBe(99.99);
    });
  });

  it("submits null for empty optional fields", async () => {
    mockFetchOnce({}, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Test Product" } });
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.brand).toBeNull();
      expect(callBody.basePrice).toBeNull();
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Product already exists" }, 409);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Duplicate" } });
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not create product", variant: "error" })
      );
    });
  });

  it("disables submit with empty title", () => {
    openDialog();
    expect((screen.getByRole("button", { name: /create product/i }) as any).disabled).toBe(true);
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create product/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
