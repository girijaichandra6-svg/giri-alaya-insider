import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateCouponDialog } from "./create-coupon-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

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
  render(<CreateCouponDialog products={sampleProducts} retailers={sampleRetailers} />);
  fireEvent.click(screen.getByText("New Coupon"));
}

describe("CreateCouponDialog", () => {
  it("renders closed state with New Coupon button", () => {
    render(<CreateCouponDialog products={sampleProducts} retailers={sampleRetailers} />);
    expect(screen.getByText("New Coupon")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create coupon/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create coupon/i })).toBeDefined();
    expect(screen.getByPlaceholderText("SAVE20")).toBeDefined();
    expect(screen.getByPlaceholderText("Coupon description")).toBeDefined();
    expect(screen.getByText("Any product...")).toBeDefined();
    expect(screen.getByText("Any retailer...")).toBeDefined();
  });

  it("shows product and retailer options in selects", () => {
    openDialog();
    expect(screen.getByText("Running Shoes")).toBeDefined();
    expect(screen.getByText("Yoga Mat")).toBeDefined();
    expect(screen.getByText("Nike Store")).toBeDefined();
    expect(screen.getByText("Amazon")).toBeDefined();
  });

  it("creates a coupon successfully", async () => {
    mockFetchOnce({ id: "c1" }, 201);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "SAVE20" } });
    fireEvent.change(screen.getByPlaceholderText("Coupon description"), { target: { value: "20% off everything" } });
    fireEvent.click(screen.getByRole("button", { name: /create coupon/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Coupon created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct POST body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "SAVE20" } });
    fireEvent.change(screen.getByPlaceholderText("Coupon description"), { target: { value: "20% off" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 20% OFF"), { target: { value: "20% OFF" } });
    fireEvent.click(screen.getByRole("button", { name: /create coupon/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.code).toBe("SAVE20");
      expect(callBody.description).toBe("20% off");
      expect(callBody.discount).toBe("20% OFF");
      expect(callBody.productId).toBeNull();
      expect(callBody.retailerId).toBeNull();
    });
  });

  it("submits with product and retailer selections", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "NIKE10" } });
    fireEvent.change(screen.getByPlaceholderText("Coupon description"), { target: { value: "Nike 10% off" } });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0]!, { target: { value: "p1" } });
    fireEvent.change(selects[1]!, { target: { value: "r1" } });
    fireEvent.click(screen.getByRole("button", { name: /create coupon/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.code).toBe("NIKE10");
      expect(callBody.productId).toBe("p1");
      expect(callBody.retailerId).toBe("r1");
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Coupon code taken" }, 409);
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "TAKEN" } });
    fireEvent.change(screen.getByPlaceholderText("Coupon description"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create coupon/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not create coupon", variant: "error" })
      );
    });
  });

  it("disables submit with empty required fields", () => {
    openDialog();
    expect((screen.getByRole("button", { name: /create coupon/i }) as any).disabled).toBe(true);
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create coupon/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "LOAD" } });
    fireEvent.change(screen.getByPlaceholderText("Coupon description"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create coupon/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
