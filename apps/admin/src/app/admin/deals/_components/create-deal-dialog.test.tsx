import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateDealDialog } from "./create-deal-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

const sampleProducts = [
  { id: "p1", title: "Running Shoes" },
  { id: "p2", title: "Yoga Mat" },
];

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<CreateDealDialog products={sampleProducts} />);
  fireEvent.click(screen.getByText("New Deal"));
}

describe("CreateDealDialog", () => {
  it("renders closed state with New Deal button", () => {
    render(<CreateDealDialog products={sampleProducts} />);
    expect(screen.getByText("New Deal")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /create deal/i })).toBeNull();
  });

  it("opens dialog when button is clicked", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /create deal/i })).toBeDefined();
    expect(screen.getByText("Select a product...")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Summer Sale - 20% off")).toBeDefined();
    expect(screen.getByPlaceholderText("SAVE20")).toBeDefined();
  });

  it("shows product options in select", () => {
    openDialog();
    expect(screen.getByText("Running Shoes")).toBeDefined();
    expect(screen.getByText("Yoga Mat")).toBeDefined();
  });

  it("creates a deal successfully", async () => {
    mockFetchOnce({ id: "d1" }, 201);
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Summer Sale - 20% off"), { target: { value: "Summer Sale" } });
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "SUMMER20" } });
    fireEvent.change(screen.getByPlaceholderText("20"), { target: { value: "20" } });
    const emptyInputs = screen.getAllByDisplayValue("");
    const dates = emptyInputs.slice(-2);
    fireEvent.change(dates[0]!, { target: { value: "2026-06-01" } });
    fireEvent.change(dates[1]!, { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create deal/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Deal created", variant: "success" })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("submits correct POST body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Summer Sale - 20% off"), { target: { value: "Summer Sale" } });
    fireEvent.change(screen.getByPlaceholderText("SAVE20"), { target: { value: "SUMMER20" } });
    fireEvent.change(screen.getByPlaceholderText("20"), { target: { value: "20" } });
    const emptyInputs = screen.getAllByDisplayValue("");
    const dates = emptyInputs.slice(-2);
    fireEvent.change(dates[0]!, { target: { value: "2026-06-01" } });
    fireEvent.change(dates[1]!, { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create deal/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.productId).toBe("p1");
      expect(callBody.title).toBe("Summer Sale");
      expect(callBody.code).toBe("SUMMER20");
      expect(callBody.discount).toBe(20);
      expect(callBody.startDate).toBe("2026-06-01");
      expect(callBody.endDate).toBe("2026-07-01");
    });
  });

  it("submits null for empty optional fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Summer Sale - 20% off"), { target: { value: "Sale" } });
    const emptyInputs = screen.getAllByDisplayValue("");
    const dates = emptyInputs.slice(-2);
    fireEvent.change(dates[0]!, { target: { value: "2026-06-01" } });
    fireEvent.change(dates[1]!, { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create deal/i }));

    await waitFor(() => {
      const callBody = getFetchCallBody();
      expect(callBody.description).toBeNull();
      expect(callBody.code).toBeNull();
      expect(callBody.discount).toBeNull();
    });
  });

  it("shows error toast on API failure", async () => {
    mockFetchOnce({ error: "Deal conflict" }, 409);
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Summer Sale - 20% off"), { target: { value: "Sale" } });
    const emptyInputs = screen.getAllByDisplayValue("");
    const dates = emptyInputs.slice(-2);
    fireEvent.change(dates[0]!, { target: { value: "2026-06-01" } });
    fireEvent.change(dates[1]!, { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create deal/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Could not create deal", variant: "error" })
      );
    });
  });

  it("disables submit without required fields", () => {
    openDialog();
    expect((screen.getByRole("button", { name: /create deal/i }) as any).disabled).toBe(true);
  });

  it("closes dialog on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /create deal/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Summer Sale - 20% off"), { target: { value: "Sale" } });
    const emptyInputs = screen.getAllByDisplayValue("");
    const dates = emptyInputs.slice(-2);
    fireEvent.change(dates[0]!, { target: { value: "2026-06-01" } });
    fireEvent.change(dates[1]!, { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create deal/i }));

    await waitFor(() => { expect(screen.getByText("Creating...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /creating/i }) as any).disabled).toBe(true);
  });
});
