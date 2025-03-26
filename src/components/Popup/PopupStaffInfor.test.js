import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import PopupStaffInfor from "./PopupStaffInfor";

// Mock dependencies
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../redux/actions/staffActions", () => ({
  addStaff: jest.fn().mockReturnValue({ type: "ADD_STAFF_REQUEST" }),
}));

const mockStore = configureStore([]);
const mockOnClose = jest.fn();
let store;

beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore({
    staff: {
      loading: false,
      error: null,
    },
  });
});

describe("PopupStaffInfor Component Tests", () => {
  // Test Group 1: Component Rendering
  describe("1. Component Rendering Tests", () => {
    test("1.1 Should render all form elements correctly", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Verify component title
      expect(screen.getByText("Add New Staff")).toBeInTheDocument();

      // Verify all form fields exist
      expect(screen.getByText("User Name *")).toBeInTheDocument();
      expect(screen.getByText("Role *")).toBeInTheDocument();
      expect(screen.getByText("Department *")).toBeInTheDocument();
      expect(screen.getByText("Job Rank *")).toBeInTheDocument();
      expect(screen.getByText("Salary *")).toBeInTheDocument();
      expect(screen.getByText("Email *")).toBeInTheDocument();
      expect(screen.getByText("Password *")).toBeInTheDocument();

      // Verify form inputs exist
      expect(
        screen.getByPlaceholderText("Enter user name")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter salary")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();

      // Verify select fields exist
      expect(screen.getByText("Select role")).toBeInTheDocument();
      expect(screen.getByText("Select job rank")).toBeInTheDocument();
      expect(screen.getByText("Select department")).toBeInTheDocument();

      // Verify buttons
      expect(screen.getByText("Add")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    test("1.2 Should display loading state correctly", () => {
      store = mockStore({
        staff: {
          loading: true,
          error: null,
        },
      });

      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      const addButton = screen.getByText("Adding...");
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeDisabled();
    });

    test("1.3 Should display error messages when present", () => {
      const errorMessage = "Failed to add staff: Email already exists";
      store = mockStore({
        staff: {
          loading: false,
          error: errorMessage,
        },
      });

      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test Group 2: Form Validation Tests
  describe("2. Form Validation Tests", () => {
    test("2.1 Should show validation errors for empty fields", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Submit without filling fields
      fireEvent.click(screen.getByText("Add"));

      // Verify error messages
      const validationErrors = [
        "User name is required.",
        "Role is required.",
        "Department is required.",
        "Job rank is required.",
        "Salary must be greater than zero.",
        "Email is required.",
        "Password is required.",
      ];

      validationErrors.forEach((error) => {
        expect(screen.getByText(error)).toBeInTheDocument();
      });
    });

    test("2.2 Should validate field format requirements", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Fill form with invalid data
      fireEvent.change(screen.getByPlaceholderText("Enter user name"), {
        target: { value: "johnsmith" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter email"), {
        target: { value: "invalid-email" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter password"), {
        target: { value: "simple" },
      });

      // Submit the form
      fireEvent.click(screen.getByText("Add"));

      // Verify format validation errors
      expect(
        screen.getByText(
          "User name must have at least two words, each starting with a capital letter."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid email format.")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Password must be at least 8 characters, include 1 uppercase letter and 1 number."
        )
      ).toBeInTheDocument();
    });

    test("2.3 Should accept valid formatted inputs", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Fill with valid data
      fireEvent.change(screen.getByPlaceholderText("Enter user name"), {
        target: { value: "John Smith" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter email"), {
        target: { value: "john.smith@example.com" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter password"), {
        target: { value: "Password123" },
      });

      // Fill other required fields
      const selectRole = screen.getByDisplayValue("Select role");
      fireEvent.change(selectRole, { target: { value: "Administrator" } });

      const selectJobRank = screen.getByDisplayValue("Select job rank");
      fireEvent.change(selectJobRank, {
        target: { value: "Senior Developer" },
      });

      const selectDepartment = screen.getByDisplayValue("Select department");
      fireEvent.change(selectDepartment, { target: { value: "IT" } });

      fireEvent.change(screen.getByPlaceholderText("Enter salary"), {
        target: { value: "50000" },
      });

      // Submit form
      fireEvent.click(screen.getByText("Add"));

      // Shouldn't see validation errors for these fields
      expect(
        screen.queryByText(
          "User name must have at least two words, each starting with a capital letter."
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Invalid email format.")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Password must be at least 8 characters, include 1 uppercase letter and 1 number."
        )
      ).not.toBeInTheDocument();
    });
  });

  // Test Group 3: Form Interaction Tests
  describe("3. Form Interaction Tests", () => {
    test("3.1 Should update form state when fields change", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Form data to input
      fireEvent.change(screen.getByPlaceholderText("Enter user name"), {
        target: { value: "John Smith" },
      });

      const selectRole = screen.getByDisplayValue("Select role");
      fireEvent.change(selectRole, { target: { value: "Administrator" } });

      const selectDepartment = screen.getByDisplayValue("Select department");
      fireEvent.change(selectDepartment, {
        target: { value: "Cybersecurity" },
      });

      const selectJobRank = screen.getByDisplayValue("Select job rank");
      fireEvent.change(selectJobRank, {
        target: { value: "Senior Developer" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter salary"), {
        target: { value: "75000" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter email"), {
        target: { value: "john.smith@example.com" },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter password"), {
        target: { value: "Password123" },
      });

      // Verify all fields have expected values
      expect(screen.getByPlaceholderText("Enter user name").value).toBe(
        "John Smith"
      );
      expect(screen.getByPlaceholderText("Enter salary").value).toBe("75000");
      expect(screen.getByPlaceholderText("Enter email").value).toBe(
        "john.smith@example.com"
      );
      expect(screen.getByPlaceholderText("Enter password").value).toBe(
        "Password123"
      );
    });

    test("3.2 Should close popup when Close button is clicked", () => {
      render(
        <Provider store={store}>
          <PopupStaffInfor onClose={mockOnClose} />
        </Provider>
      );

      // Click Close button
      fireEvent.click(screen.getByText("Close"));

      // Verify onClose was called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
