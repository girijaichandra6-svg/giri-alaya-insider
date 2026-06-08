import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateBrandDialog } from "./create-brand-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<CreateBrandDialog />);
  fireEvent.click(screen.getByText("New Brand"));
}

describe("CreateBrandDialog", () => {
  it("renders closed state with New Brand button", () => {
    render(<CreateBrandDialog />);
    expect(screen.getByText("New Brand")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create brand/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create brand/i })).toBeDefined();
    expect(screen.getByPlaceholderText("Brand name")).toBeDefined();
  });

  it("creates a brand successfully", async () => {
    mockFetchOnce({ id: "b1" }, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Nike" } });
    fireEvent.change(screen.getByPlaceholderText("https://example.com/logo.png"), { target: { value: "https://example.com/nike.png" } });
    fireEvent.click(screen.getByRole("button", { name: /create brand/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Brand created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct body", async () => {
    mockFetchOnce({}, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Adidas" } });
    fireEvent.click(screen.getByRole("button", { name: /create brand/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.name).toBe("Adidas");
      expect(callBody.logoUrl).toBeNull();
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Brand name taken" }, 409);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Nike" } });
    fireEvent.click(screen.getByRole("button", { name: /create brand/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Brand name taken", variant: "error" })
      );
    });
  });

  it("disables submit with empty name", () => {
    openDialog();
    expect((screen.getByRole("button", { name: /create brand/i }) as any).disabled).toBe(true);
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create brand/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("Brand name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create brand/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
