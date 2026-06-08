import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditDealDialog } from "./edit-deal-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

const sampleDeal = {
  id: "d1",
  title: "Summer Sale",
  description: "20% off all running shoes",
  code: "SUMMER20",
  discount: 20,
  startDate: "2026-06-01T00:00:00.000Z",
  endDate: "2026-07-01T00:00:00.000Z",
  isActive: true,
  product: { id: "p1", title: "Running Shoes" },
};

const sampleProducts = [
  { id: "p1", title: "Running Shoes" },
  { id: "p2", title: "Yoga Mat" },
];

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<EditDealDialog deal={sampleDeal} products={sampleProducts} />);
  fireEvent.click(screen.getByTitle("Edit deal"));
}

describe("EditDealDialog", () => {
  it("renders closed state with edit button", () => {
    render(<EditDealDialog deal={sampleDeal} products={sampleProducts} />);
    expect(screen.getByTitle("Edit deal")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit deal/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit deal/i })).toBeDefined();
    expect((screen.getByDisplayValue("Summer Sale") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("SUMMER20") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("20") as HTMLInputElement)).toBeDefined();
  });

  it("shows disabled product select with pre-selected product", () => {
    openDialog();
    const productSelect = screen.getByDisplayValue("Running Shoes") as HTMLSelectElement;
    expect(productSelect).toBeDefined();
    expect(productSelect.disabled).toBe(true);
  });

  it("renders active status selected", () => {
    openDialog();
    expect(screen.getByDisplayValue("Active")).toBeDefined();
  });

  it("updates deal successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Deal updated", variant: "success" })
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
      expect(callBody.id).toBe("d1");
      expect(callBody.title).toBe("Summer Sale");
      expect(callBody.code).toBe("SUMMER20");
      expect(callBody.discount).toBe(20);
      expect(callBody.isActive).toBe(true);
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Update failed" }, 400);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not update deal", variant: "error" })
      );
    });
  });

  it("disables submit with empty title", () => {
    openDialog();
    const input = screen.getByDisplayValue("Summer Sale") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit deal/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
