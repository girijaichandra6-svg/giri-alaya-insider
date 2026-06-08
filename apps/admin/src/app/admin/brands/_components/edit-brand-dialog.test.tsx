import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditBrandDialog } from "./edit-brand-dialog";
import { mockFetchOnce, mockFetchPending, getFetchCallBody } from "../../test-utils";
import { mockRefresh, mockAddToast } from "../../vitest.setup";

vi.mock("../../products/_components/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function openDialog() {
  render(<EditBrandDialog brandId="b1" initialName="Nike" initialLogoUrl="https://example.com/logo.png" />);
  fireEvent.click(screen.getByTitle("Edit brand"));
}

describe("EditBrandDialog", () => {
  it("renders closed state with edit button", () => {
    render(<EditBrandDialog brandId="b1" initialName="Nike" initialLogoUrl={null} />);
    expect(screen.getByTitle("Edit brand")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /edit brand/i })).toBeNull();
  });

  it("opens with pre-filled data", () => {
    openDialog();
    expect(screen.getByRole("heading", { name: /edit brand/i })).toBeDefined();
    expect((screen.getByDisplayValue("Nike") as HTMLInputElement)).toBeDefined();
    expect((screen.getByDisplayValue("https://example.com/logo.png") as HTMLInputElement)).toBeDefined();
  });

  it("updates brand successfully", async () => {
    mockFetchOnce({}, 200);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Brand updated", variant: "success" })
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
      expect(callBody.id).toBe("b1");
      expect(callBody.name).toBe("Nike");
      expect(callBody.logoUrl).toBe("https://example.com/logo.png");
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
    const input = screen.getByDisplayValue("Nike") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect((screen.getByRole("button", { name: /save changes/i }) as any).disabled).toBe(true);
  });

  it("closes on Cancel", () => {
    openDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("heading", { name: /edit brand/i })).toBeNull();
  });

  it("disables button while loading", async () => {
    mockFetchPending();
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => { expect(screen.getByText("Saving...")).toBeDefined(); });
    expect((screen.getByRole("button", { name: /saving/i }) as any).disabled).toBe(true);
  });
});
