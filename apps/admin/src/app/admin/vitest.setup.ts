import { vi, beforeEach, afterEach, type Mock } from "vitest";
import "@testing-library/jest-dom/vitest";

// --------------------------------------------------------------------------
// Global mock variables — hoisted so vi.mock() factories can capture them
// --------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  mockRefresh: vi.fn() as Mock,
  mockPush: vi.fn() as Mock,
  mockAddToast: vi.fn() as Mock,
}));

export const mockRefresh: Mock = mocks.mockRefresh;
export const mockPush: Mock = mocks.mockPush;
export const mockAddToast: Mock = mocks.mockAddToast;

// --------------------------------------------------------------------------
// Global module mocks — centralized since they use bare specifiers
// --------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.mockRefresh, push: mocks.mockPush }),
}));

// --------------------------------------------------------------------------
// Global lifecycle — every test gets clean mocks
// --------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
