import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import Modal from "./Modal";

// Mock dependencies
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("Modal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders modal content when isOpen is true", () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Delete"
        source="ClaimsTable"
      />
    );

    // Use getByRole to find elements by their role
    expect(screen.getByText("CONFIRMATION")).toBeInTheDocument();

    // Use a more flexible approach for checking text
    const modalText = screen.getByText(/Are you sure you want to/i);
    expect(modalText).toBeInTheDocument();

    // Check for the presence of the action text without being strict about its container
    expect(
      screen.getByText(/delete this claim/i, { exact: false })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/This action cannot be undone/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  test("does not render modal when isOpen is false", () => {
    render(
      <Modal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Delete"
        source="ClaimsTable"
      />
    );

    expect(screen.queryByText("CONFIRMATION")).not.toBeInTheDocument();
  });

  test("displays reason input for approval/rejection actions and validates it", () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Approve"
        source="ClaimsTable"
      />
    );

    // Check if textarea is present
    const reasonInput = screen.getByPlaceholderText("Enter reason...");
    expect(reasonInput).toBeInTheDocument();

    // Try to confirm without entering a reason
    fireEvent.click(screen.getByText("Yes"));

    // Should show error toast
    expect(toast.error).toHaveBeenCalledWith(
      "⚠️ Please enter a reason before proceeding.",
      expect.any(Object)
    );

    // onConfirm should not be called
    expect(mockOnConfirm).not.toHaveBeenCalled();

    // Now enter a reason and try again
    fireEvent.change(reasonInput, { target: { value: "Valid reason" } });
    fireEvent.click(screen.getByText("Yes"));

    // Advance timers to simulate the timeout
    jest.advanceTimersByTime(1500);

    // onConfirm should be called with the reason
    expect(mockOnConfirm).toHaveBeenCalledWith("Valid reason");
  });

  test("calls onClose when No button is clicked", () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Delete"
        source="ClaimsTable"
      />
    );

    fireEvent.click(screen.getByText("No"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test("shows processing state and disables buttons during confirmation", async () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="DeleteAll"
        source="ClaimsTable"
      />
    );

    // Click confirm button
    fireEvent.click(screen.getByText("Yes"));

    // Check that the button text changes and buttons are disabled
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByText("Processing...")).toBeDisabled();
    expect(screen.getByText("No")).toBeDisabled();

    // Advance timers to complete processing
    jest.advanceTimersByTime(1500);

    // onConfirm should have been called
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  // Fixed test case to check different action types
  test("displays correct action message based on actionType", () => {
    // Test with SubmitAll action type
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="SubmitAll"
        source="ClaimsTable"
      />
    );

    // Use a more flexible selector with partial matching
    expect(
      screen.getByText(/submit all claim/i, { exact: false })
    ).toBeInTheDocument();

    // Test with PayAll action type
    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="PayAll"
        source="ClaimsTable"
      />
    );

    // Use a more flexible selector with partial matching
    expect(
      screen.getByText(/mark selected claims as paid/i, { exact: false })
    ).toBeInTheDocument();

    // Test with Cancelled action type
    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Cancelled"
        source="ClaimsTable"
      />
    );

    // Use a more flexible selector with partial matching
    expect(
      screen.getByText(/cancel this claim/i, { exact: false })
    ).toBeInTheDocument();
  });

  // Add one more test for button color based on action type
  test("applies correct color class to confirmation button based on actionType", () => {
    // Test with Approve action type (should have green background)
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Approve"
        source="ClaimsTable"
      />
    );

    const confirmButton = screen.getByText("Yes");
    expect(confirmButton.className).toContain("bg-green-400");

    // Test with Delete action type (should have red background)
    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Delete"
        source="ClaimsTable"
      />
    );

    expect(screen.getByText("Yes").className).toContain("bg-red-500");

    // Test with Paid action type (should have blue background)
    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        actionType="Paid"
        source="ClaimsTable"
      />
    );

    expect(screen.getByText("Yes").className).toContain("bg-blue-400");
  });
});
