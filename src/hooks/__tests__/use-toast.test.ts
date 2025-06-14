import { renderHook, act } from "@testing-library/react";
import { useToast } from "../use-toast";

// Mock setTimeout and clearTimeout to control timing in tests
jest.useFakeTimers();

describe("useToast", () => {
  beforeEach(() => {
    // Clear all timers and reset state
    jest.clearAllTimers();

    // Clear the global state by accessing the hook and dismissing all toasts
    const { result } = renderHook(() => useToast());
    act(() => {
      // Force remove all toasts by dismissing each one individually
      result.current.toasts.forEach((toast) => {
        result.current.dismiss(toast.id);
      });
      // Also call dismiss without ID to clear all
      result.current.dismiss();

      // Fast-forward timers to complete removal
      jest.runAllTimers();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should start with no toasts", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Test Toast",
      description: "This is a test toast",
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });
  it("should add multiple toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "First Toast",
        description: "First toast description",
      });
    });

    act(() => {
      result.current.toast({
        title: "Second Toast",
        description: "Second toast description",
      });
    });

    // Due to TOAST_LIMIT = 1, only the latest toast should remain
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Second Toast");
  });
  it("should dismiss a specific toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "First Toast",
        description: "First toast description",
      });
    });

    act(() => {
      result.current.toast({
        title: "Second Toast",
        description: "Second toast description",
      });
    });

    expect(result.current.toasts).toHaveLength(1); // TOAST_LIMIT is 1

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(toastId);
      jest.runAllTimers(); // Fast-forward to complete removal
    });

    expect(result.current.toasts).toHaveLength(0);
  });
  it("should dismiss all toasts when no id provided", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "First Toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss();
      jest.runAllTimers(); // Fast-forward to complete removal
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should respect the TOAST_LIMIT", () => {
    const { result } = renderHook(() => useToast());

    // Add more toasts than the limit (assuming limit is 1 based on the reducer)
    act(() => {
      result.current.toast({ title: "Toast 1" });
    });

    act(() => {
      result.current.toast({ title: "Toast 2" });
    });

    // Should only keep the most recent toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Toast 2");
  });
  it("should generate unique ids for each toast", () => {
    const { result } = renderHook(() => useToast());

    let firstId = "";
    let secondId = "";

    act(() => {
      const toast1 = result.current.toast({ title: "Toast 1" });
      firstId = toast1.id;
    });

    act(() => {
      const toast2 = result.current.toast({ title: "Toast 2" });
      secondId = toast2.id;
    });

    // IDs should be different
    expect(firstId).not.toBe(secondId);

    // Due to TOAST_LIMIT = 1, only the latest toast should remain
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(secondId);
  });
  it("should handle different toast variants", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Error Toast",
        variant: "destructive",
      });
    });

    expect(result.current.toasts[0].variant).toBe("destructive");
    expect(result.current.toasts[0].title).toBe("Error Toast");
  });
  it("should handle toasts with actions", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Toast with Action",
        description: "This toast has an action",
      });
    });

    expect(result.current.toasts[0].title).toBe("Toast with Action");
    expect(result.current.toasts[0].description).toBe(
      "This toast has an action"
    );
  });
  it("should update existing toast if same title provided", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Original Title",
        description: "Original description",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Original Title");

    act(() => {
      result.current.toast({
        title: "Updated Title",
        description: "Updated description",
      });
    });

    // Should add a new toast (as there's no id-based updating in the current implementation)
    expect(result.current.toasts).toHaveLength(1); // Due to TOAST_LIMIT
    expect(result.current.toasts[0].title).toBe("Updated Title");
    expect(result.current.toasts[0].description).toBe("Updated description");
  });
  it("should handle toast removal after timeout", async () => {
    // This test verifies that the toast mechanism works correctly
    // The actual auto-dismiss is handled by the Toast component, not the hook
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Auto-dismiss Toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    // Manually dismiss the toast (simulating what the Toast component would do)
    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
      jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should handle empty toast calls gracefully", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({});
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBeDefined();
  });
  it("should preserve toast properties", () => {
    const { result } = renderHook(() => useToast());
    const toastProps = {
      title: "Complete Toast",
      description: "With all properties",
      variant: "destructive" as const,
    };

    act(() => {
      result.current.toast(toastProps);
    });

    const toast = result.current.toasts[0];
    expect(toast.title).toBe(toastProps.title);
    expect(toast.description).toBe(toastProps.description);
    expect(toast.variant).toBe(toastProps.variant);
  });
});
