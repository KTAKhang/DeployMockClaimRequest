import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import { MemoryRouter } from "react-router-dom";
import StaffDetail from "./StaffDetail"; 
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "123" }),
  useLocation: () => ({
    pathname: "/admin/staff/123",
    state: { staff: null },
  }),
}));

// Mock the action and import all action types
jest.mock("../../../redux/actions/staffActions", () => ({
  getStaffById: jest.fn().mockReturnValue({
    type: "GET_STAFF_BY_ID",
  }),
  GET_STAFF_BY_ID: "GET_STAFF_BY_ID",
  GET_STAFF_BY_ID_SUCCESS: "GET_STAFF_BY_ID_SUCCESS",
}));

// Import the mocked action
import { getStaffById } from "../../../redux/actions/staffActions";

// Mock the PopupUpdateStaff component
jest.mock("../../../components/Popup/PopupUpdateStaff", () => {
  return function MockPopupUpdateStaff({ staffData, onClose }) {
    return (
      <div data-testid="update-popup">
        <button
          onClick={() => onClose({ ...staffData, user_name: "Updated Name" })}
        >
          Save Changes
        </button>
        <button onClick={() => onClose()}>Cancel</button>
      </div>
    );
  };
});

const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

let store;

beforeEach(() => {
  mockNavigate.mockClear();
  jest.clearAllMocks();

  // Set up store with the correct initial state matching your reducer
  store = mockStore({
    staff: {
      staffById: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
      staffAll: {
        data: [
          {
            _id: "123",
            user_name: "John Doe",
            role_name: "Developer",
            department: "IT",
            job_rank: "Senior",
            salary: 25000000,
          },
        ],
        total: 1,
      },
      loading: false,
      error: null,
    },
  });
});

describe("StaffDetail Component", () => {
  test("Renders StaffDetail component with valid data", async () => {
    const { debug } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Simulate the action/reducer flow to ensure loading state completes
    store.dispatch({
      type: "GET_STAFF_BY_ID_SUCCESS",
      payload: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    // Increase timeout for waitFor
    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading staff details...")
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Debug DOM structure to see actual content
    debug();

    // Test for presence of key data rather than exact UI elements
    expect(document.body.textContent).toContain("John Doe");
    expect(document.body.textContent).toContain("Developer");
    expect(document.body.textContent).toContain("IT");
    expect(document.body.textContent).toContain("123");
  });

  test("Displays loading state while fetching data", () => {
    store = mockStore({
      staff: {
        staffById: null,
        staffAll: { data: [], total: 0 },
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Kiểm tra text loading chính xác
    expect(screen.getByText("Loading staff details...")).toBeInTheDocument();
  });

  test("Dispatches getStaffById when staff data is not available", () => {
    store = mockStore({
      staff: {
        staffById: null,
        staffAll: { data: [], total: 0 },
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    expect(getStaffById).toHaveBeenCalledWith("123");
  });

  test("Back button navigates to previous page", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Simulate action completion
    store.dispatch({
      type: "GET_STAFF_BY_ID_SUCCESS",
      payload: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading staff details...")
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Tìm button theo role và regex pattern thay vì text chính xác
    const backButton = screen.getAllByRole('button').find(
      button => /back/i.test(button.textContent)
    );
    
    expect(backButton).toBeTruthy();
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("Update button opens popup", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Simulate action completion
    store.dispatch({
      type: "GET_STAFF_BY_ID_SUCCESS",
      payload: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading staff details...")
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Tìm update button theo nhiều cách khác nhau
    const updateButton = screen.getAllByRole('button').find(
      button => /update|edit/i.test(button.textContent)
    );
    
    expect(updateButton).toBeTruthy();
    fireEvent.click(updateButton);
    expect(screen.getByTestId("update-popup")).toBeInTheDocument();
  });

  test("Successfully updates staff details and shows toast notification", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Simulate action completion
    store.dispatch({
      type: "GET_STAFF_BY_ID_SUCCESS",
      payload: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading staff details...")
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Tìm update button
    const updateButton = screen.getAllByRole('button').find(
      button => /update|edit/i.test(button.textContent)
    );
    
    expect(updateButton).toBeTruthy();
    fireEvent.click(updateButton);

    // Click save changes in the popup
    fireEvent.click(screen.getByText("Save Changes"));

    // Simulate successful update
    store.dispatch({
      type: "UPDATE_STAFF_SUCCESS",
      payload: {
        _id: "123",
        user_name: "Updated Name",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    // Check if toast notification was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Staff details updated successfully!",
        expect.any(Object)
      );
    });

    // Check if staff detail was updated
    await waitFor(() => {
      expect(document.body.textContent).toContain("Updated Name");
    });
  });

  test("Closing popup without changes does not show toast", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffDetail />
        </MemoryRouter>
      </Provider>
    );

    // Simulate action completion
    store.dispatch({
      type: "GET_STAFF_BY_ID_SUCCESS",
      payload: {
        _id: "123",
        user_name: "John Doe",
        role_name: "Developer",
        department: "IT",
        job_rank: "Senior",
        salary: 25000000,
      },
    });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading staff details...")
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Tìm update button
    const updateButton = screen.getAllByRole('button').find(
      button => /update|edit/i.test(button.textContent)
    );
    
    expect(updateButton).toBeTruthy();
    fireEvent.click(updateButton);

    // Close the popup without saving
    fireEvent.click(screen.getByText("Cancel"));

    // Check that toast was not called
    expect(toast.success).not.toHaveBeenCalled();
  });

  
});
