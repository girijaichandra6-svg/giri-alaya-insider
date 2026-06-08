import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditCouponDialog } from "./edit-coupon-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

const sampleCoupon = {
  id: "c1",
  code: "SAVE20",
  description: "20% off everything",
  discount: "20% OFF",
  expiresAt: "2026-12-31T00:00:00.000Z",
  product: { id: "p1", title: "Running Shoes" },
  retailer: { id: "r1", name: "Nike Store" },
};

const sampleProducts = [
  { id: "p1", title: "Running Shoes" },
  { id: "p2", title: "Yoga Mat" },
];

const sampleRetailers = [
  { id: "r1", name: "Nike Store" },
  { id: "r2", name: "Amazon" },
];

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<EditCouponDialog coupon={sampleCoupon} products={sampleProducts} retailers={sampleRetailers} />);
  fireEvent.click(screen.getByTitle("Edit coupon"));
}

describe("EditCouponDialog", () => {
  it("renders closed state with edit button", () => {
    render(<EditCouponDialog coupon={sampleCoupon} products={sampleProducts} retailers={sampleRetailers} />);
    expect(screen.getByTitle("Edit coupon")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit coupon/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit coupon/i })).toBeDefined();
    expect((screen.getByDisplayValue("SAVE20") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("20% off everything") as HTMLTextAreaElement)).toBeDefined();
    expect((screen.getByDisplayValue("20% OFF") as HTMLInputElement)).toBeDefined();
  });

  it("shows pre-selected product and retailer", () => {
    openDialog();
    expect(screen.getByDisplayValue("Running Shoes")).toBeDefined();
    expect(screen.getByDisplayValue("Nike Store")).toBeDefined();
  });

  it("updates coupon successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Coupon updated", variant: "success" })
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
      expect(callBody.id).toBe("c1");
      expect(callBody.code).toBe("SAVE20");
      expect(callBody.description).toBe("20% off everything");
      expect(callBody.discount).toBe("20% OFF");
      expect(callBody.productId).toBe("p1");
      expect(callBody.retailerId).toBe("r1");
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Update failed" }, 400);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not update coupon", variant: "error" })
      );
    });
  });

  it("disables submit with empty code", () => {
    openDialog();
    const input = screen.getByDisplayValue("SAVE20") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit coupon/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
