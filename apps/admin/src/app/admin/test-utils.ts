import { vi } from "vitest";
import { fireEvent } from "@testing-library/react";

// --------------------------------------------------------------------------
// DataTransfer mock — used for HTML5 drag-and-drop simulation
// --------------------------------------------------------------------------

export function createMockDataTransfer(): DataTransfer {
  return {
    dropEffect: "move",
    effectAllowed: "move",
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [] as string[],
    getData: () => "",
    setData: () => {},
    clearData: () => {},
    setDragImage: () => {},
  } as DataTransfer;
}

/** Simulate an HTML5 drag-and-drop gesture (dragStart → dragOver → drop → dragEnd) */
export function simulateDrag(sourceElement: HTMLElement, targetElement: HTMLElement) {
  const dt = createMockDataTransfer();
  fireEvent.dragStart(sourceElement, { dataTransfer: dt });
  fireEvent.dragOver(targetElement, { dataTransfer: dt });
  fireEvent.drop(targetElement, { dataTransfer: dt });
  fireEvent.dragEnd(sourceElement, { dataTransfer: dt });
}

// --------------------------------------------------------------------------
// Fetch mock helpers
// --------------------------------------------------------------------------

/** Spy on globalThis.fetch and resolve once with the supplied data and status */
export function mockFetchOnce(data: Record<string, unknown> = {}, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } })
  );
}

/** Spy on globalThis.fetch with a pending Promise so the request never completes */
export function mockFetchPending() {
  return vi.spyOn(globalThis, "fetch").mockImplementationOnce(
    () => new Promise<Response>(() => {})
  );
}

/** Spy on globalThis.fetch once with a text body (non-JSON) and a given status */
export function mockFetchTextOnce(body: string, status = 500) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(body, { status })
  );
}

// --------------------------------------------------------------------------
// Request body extractor
// --------------------------------------------------------------------------

/** Parse the JSON body from the first fetch call */
export function getFetchCallBody(): Record<string, unknown> {
  return JSON.parse(
    (vi.mocked(globalThis.fetch).mock.calls[0]?.[1] as RequestInit)?.body as string
  );
}
