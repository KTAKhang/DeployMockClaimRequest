import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { toast } from "react-toastify";
import Navbar from "./Navbar";

// Mock the modules we need
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    dismiss: jest.fn()
  },
}));

jest.mock("../../redux/actions/authActions", () => ({
  logout: () => ({ type: "LOGOUT" }),
}));

// Create a mock store
const mockStore = configureStore([]);

describe("Navbar Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          user_name: "Test User",
          role_name: "Claimer",
          avatar: null,
        },
      },
    });

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  // Test 1: Renders navbar with correct elements
  test("renders navbar with user information and logo", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={jest.fn()}
            isSidebarOpen={false}
            isMobileView={false}
          />
        </BrowserRouter>
      </Provider>
    );

    // Check if user name is rendered
    expect(screen.getByText("Test User")).toBeInTheDocument();
    // Check if role is rendered
    expect(screen.getByText("Claimer")).toBeInTheDocument();
    // Check if logo is rendered
    expect(screen.getByAltText("FPT Software Logo")).toBeInTheDocument();
  });

  // Test 2: Toggle sidebar button works
  test("calls toggleSidebar when toggle button is clicked", () => {
    const mockToggleSidebar = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={mockToggleSidebar}
            isSidebarOpen={false}
            isMobileView={false}
          />
        </BrowserRouter>
      </Provider>
    );

    // Find and click the toggle sidebar button
    const toggleButton = screen.getByLabelText("Toggle sidebar");
    fireEvent.click(toggleButton);

    // Check if the toggleSidebar function was called
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  // Test 3: Dropdown menu opens on click
  test("opens dropdown menu when profile is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={jest.fn()}
            isSidebarOpen={false}
            isMobileView={false}
          />
        </BrowserRouter>
      </Provider>
    );

    // Dropdown should not be visible initially
    expect(screen.queryByText("My Profile")).not.toBeInTheDocument();

    // Find and click the profile section
    const profileSection = screen.getByText("Test User");
    fireEvent.click(profileSection);

    // Dropdown should now be visible
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  // Test 4: Logout functionality
  test("dispatches logout action and navigates to login page when sign out is clicked", () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockImplementation(() => mockNavigate);

    jest.useFakeTimers();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={jest.fn()}
            isSidebarOpen={false}
            isMobileView={false}
          />
        </BrowserRouter>
      </Provider>
    );

    // Open dropdown menu
    fireEvent.click(screen.getByText("Test User"));

    // Click sign out button
    fireEvent.click(screen.getByText("Sign Out"));

    // Check if toast.dismiss was called
    expect(toast.dismiss).toHaveBeenCalled();

    // Check if store received logout action
    const actions = store.getActions();
    expect(actions).toEqual([{ type: "LOGOUT" }]);

    // Fast-forward timeout
    jest.advanceTimersByTime(3000);

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });

  // Test 5: Mobile view rendering
  test("renders mobile view hamburger menu when isMobileView is true", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={jest.fn()}
            isSidebarOpen={false}
            isMobileView={true}
          />
        </BrowserRouter>
      </Provider>
    );

    // In mobile view, the FaBars icon should be rendered instead of RxTextAlignJustify
    // We can't directly test for the specific icon component, but we can check that the button is present
    const toggleButton = screen.getByLabelText("Toggle sidebar");
    expect(toggleButton).toBeInTheDocument();
  });

  // Test 6: Profile path generation based on role
  test("generates correct profile paths based on user role", () => {
    // Create a different store with Administrator role
    const adminStore = mockStore({
      auth: {
        user: {
          user_name: "Admin User",
          role_name: "Administrator",
          avatar: null,
        },
      },
    });

    render(
      <Provider store={adminStore}>
        <BrowserRouter>
          <Navbar
            toggleSidebar={jest.fn()}
            isSidebarOpen={false}
            isMobileView={false}
          />
        </BrowserRouter>
      </Provider>
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Admin User"));

    // Check if the profile link has the correct path attribute
    const profileLink = screen.getByText("My Profile").closest("a");
    expect(profileLink).toHaveAttribute("href", "/admin/profile");
  });
});
