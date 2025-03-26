import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { updateStaff } from "../../redux/actions/staffActions";
import PopupUpdateStaff from "./PopupUpdateStaff";

// Mock the redux actions
jest.mock("../../redux/actions/staffActions", () => ({
  updateStaff: jest.fn(),
}));

// Mock toast for notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock setTimeout
jest.useFakeTimers();

// Configure mock store without thunk middleware
const mockStore = configureStore([]);
const mockOnClose = jest.fn();

const staffData = {
  _id: "123",
  user_name: "John Doe",
  role_name: "Administrator",
  department: "Cybersecurity",
  job_rank: "Senior Developer",
  salary: 50000,
};

describe("PopupUpdateStaff Component", () => {
  let store;

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Configure store with initial state
    store = mockStore({
      staff: {
        loading: false,
        error: null,
        staffAll: { data: [staffData], total: 1 },
      },
    });

    // Mock dispatch to return a promise
    store.dispatch = jest.fn().mockResolvedValue({ success: true });

    // Mock updateStaff to return a regular action object instead of a thunk function
    updateStaff.mockReturnValue({
      type: "UPDATE_STAFF",
      payload: expect.any(Object),
    });
  });

  afterEach(() => {
    // Reset any pending timers after each test
    jest.clearAllTimers();
  });

  test("renders the component correctly", () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    expect(screen.getByText("Update Staff Information")).toBeInTheDocument();

    // Find inputs by their placeholder or value rather than label
    const userNameInput = screen.getByDisplayValue("John Doe");
    expect(userNameInput).toBeInTheDocument();

    // Find salary input - convert to string because form values are strings
    const salaryInput = screen.getByDisplayValue("50000");
    expect(salaryInput).toBeInTheDocument();

    // Find dropdowns by their values
    expect(screen.getByDisplayValue("Administrator")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cybersecurity")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Senior Developer")).toBeInTheDocument();
  });

  test("validates required fields before submission", async () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={{}} onClose={mockOnClose} />
      </Provider>
    );

    // Find inputs by their placeholders or test IDs
    const userNameInput = screen.getByPlaceholderText("Enter user name");
    fireEvent.change(userNameInput, { target: { value: "" } });

    // Find selects by their role
    const selects = screen.getAllByRole("combobox");
    // Clear all select fields (role, department, job rank)
    selects.forEach((select) => {
      fireEvent.change(select, { target: { value: "" } });
    });

    // Find salary input by placeholder
    const salaryInput = screen.getByPlaceholderText("Enter salary");
    fireEvent.change(salaryInput, { target: { value: "0" } });

    // Try to submit the form
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    // Wait for validation errors to be shown
    await waitFor(() => {
      // Check that all required errors are shown
      expect(screen.getByText("User name is required.")).toBeInTheDocument();
      expect(screen.getByText("Role is required.")).toBeInTheDocument();
      expect(screen.getByText("Department is required.")).toBeInTheDocument();
      expect(screen.getByText("Job rank is required.")).toBeInTheDocument();
      expect(
        screen.getByText("Salary must be greater than zero.")
      ).toBeInTheDocument();
    });

    // Verify that dispatch was not called
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test("submits the form with correct data", async () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Modify user name with a valid format (First Last)
    const userNameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(userNameInput, { target: { value: "Jane Doe" } });

    // Submit the form
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    // Check that updateStaff was called with the correct data
    await waitFor(() => {
      expect(updateStaff).toHaveBeenCalledWith({
        _id: "123",
        user_name: "Jane Doe",
        role_name: "Administrator",
        department: "Cybersecurity",
        job_rank: "Senior Developer",
        salary: 50000,
      });
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  test("displays error message if update fails", async () => {
    // Configure store with error state
    store = mockStore({
      staff: {
        loading: false,
        error: "Update failed",
        staffAll: { data: [staffData], total: 1 },
      },
    });

    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Error should be displayed immediately
    expect(screen.getByText("Update failed")).toBeInTheDocument();
  });

  test("shows loading state when updating", async () => {
    // Configure store with loading state
    store = mockStore({
      staff: {
        loading: true,
        error: null,
        staffAll: { data: [staffData], total: 1 },
      },
    });

    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Should show loading text in button
    expect(screen.getByText("Updating ...")).toBeInTheDocument();
  });

  test("closes modal when Close button is clicked", () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Click the close button
    fireEvent.click(screen.getByText("Close"));

    // Verify the onClose callback was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not submit form if salary is zero or negative", async () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Find salary input by value
    const salaryInput = screen.getByDisplayValue("50000");
    fireEvent.change(salaryInput, { target: { value: "-1000" } });

    // Try to submit the form
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    // Check for validation error
    await waitFor(() => {
      expect(
        screen.getByText("Salary must be greater than zero.")
      ).toBeInTheDocument();
    });

    // Verify dispatch was not called
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test("updates store when staff update is successful", async () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Submit the form
    fireEvent.click(screen.getByText("Update"));

    // Wait for the dispatch to be called
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
    });

    // Fast-forward timers to trigger the setTimeout callback
    jest.advanceTimersByTime(1000);

    // Now onClose should have been called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("validates user name format", async () => {
    render(
      <Provider store={store}>
        <PopupUpdateStaff staffData={staffData} onClose={mockOnClose} />
      </Provider>
    );

    // Find user name input and set to an invalid format
    const userNameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(userNameInput, { target: { value: "janedoe" } });

    // Try to submit the form
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    // Check for validation error
    await waitFor(() => {
      expect(
        screen.getByText(
          "User name must have at least two words, each starting with a capital letter."
        )
      ).toBeInTheDocument();
    });

    // Verify dispatch was not called
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
