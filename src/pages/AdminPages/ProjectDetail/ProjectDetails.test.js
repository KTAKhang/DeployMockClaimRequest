import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import ProjectDetail from "./ProjectDetail";
import "@testing-library/jest-dom";

// Mock necessary actions
jest.mock("../../../redux/actions/projectActions", () => ({
  getProjectById: jest.fn().mockReturnValue({ type: "GET_PROJECT_BY_ID" }),
  updateProject: jest.fn().mockReturnValue({ type: "UPDATE_PROJECT" }),
  toggleProjectStatus: jest
    .fn()
    .mockReturnValue({ type: "TOGGLE_PROJECT_STATUS" }),
}));

// Mock react-router hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: "project123" }),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
  useLocation: jest.fn().mockReturnValue({ state: null }),
}));

// Mock PopupProjectInfo component
jest.mock("../../../components/Popup/PopupProjectInfor", () => {
  return jest.fn(({ initialData, onClose, onUpdate }) => (
    <div data-testid="project-popup">
      <button
        data-testid="update-button"
        onClick={() =>
          onUpdate({ ...initialData, project_name: "Updated Project" })
        }
      >
        Update Project
      </button>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  ));
});

// Mock Modal component
jest.mock("../../../components/Modal/Modal", () => {
  return jest.fn(({ isOpen, onClose, onConfirm }) =>
    isOpen ? (
      <div data-testid="status-modal">
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null
  );
});

// Mock Loading component
jest.mock("../../../components/Loading/Loading", () => {
  return jest.fn(({ message }) => (
    <div data-testid="loading-component">{message}</div>
  ));
});

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Configure mock store
const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

describe("ProjectDetail Component", () => {
  let store;

  const mockProject = {
    _id: "project123",
    project_name: "Test Project",
    status: true,
    description: "This is a test project description",
    duration: {
      from: "2023-01-01T00:00:00.000Z",
      to: "2023-12-31T00:00:00.000Z",
    },
    pm: { user_name: "PM User" },
    qa: { user_name: "QA User" },
    technical_lead: [
      { user_name: "Tech Lead 1" },
      { user_name: "Tech Lead 2" },
    ],
    ba: [{ user_name: "BA User" }],
    developers: [{ user_name: "Dev 1" }, { user_name: "Dev 2" }],
    testers: [{ user_name: "Tester 1" }],
    technical_consultancy: [{ user_name: "Consultant 1" }],
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default store
    store = mockStore({
      projects: {
        projectById: mockProject,
        projectsAll: {
          data: [mockProject],
        },
        loading: false,
        error: null,
        statusChangeSuccess: false,
      },
    });
  });

  // Test Case 1: Render project details correctly
  it("renders project details correctly when data is available", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      </Provider>
    );

    // Check page title and breadcrumbs
    const projectDetailElements = screen.getAllByText("Project Detail");
    expect(projectDetailElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Project Management >")).toBeInTheDocument();

    // Check project information
    expect(screen.getByText(/project123/)).toBeInTheDocument();
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();

    // Check team members
    expect(screen.getByText(/PM User/)).toBeInTheDocument();
    expect(screen.getByText(/QA User/)).toBeInTheDocument();
    expect(screen.getByText(/Tech Lead 1, Tech Lead 2/)).toBeInTheDocument();

    // Check dates
    expect(screen.getByText(/Start Date:/)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/End Date:/)).toBeInTheDocument();
    expect(screen.getByText(/2023-12-31/)).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText("This is a test project description")
    ).toBeInTheDocument();

    // Check status and buttons - FIX: use getAllByText instead of getByText for "Active"
    const activeElements = screen.getAllByText("Active");
    expect(activeElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Set Inactive")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  // Test Case 2: Display loading state
  it("displays loading state when fetching project details", () => {
    // Create store with loading state
    const loadingStore = mockStore({
      projects: {
        projectById: null,
        projectsAll: { data: [] },
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={loadingStore}>
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      </Provider>
    );

    // Assert loading component is shown
    expect(screen.getByTestId("loading-component")).toBeInTheDocument();
    expect(screen.getByText("Loading project details...")).toBeInTheDocument();
  });

  // Test Case 3: Open and submit update project popup
  it("opens update project popup and submits changes", async () => {
    const { updateProject } = require("../../../redux/actions/projectActions");

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      </Provider>
    );

    // Click update button to open popup
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    // Check if popup is displayed
    expect(screen.getByTestId("project-popup")).toBeInTheDocument();

    // Click update in popup
    const confirmUpdateButton = screen.getByTestId("update-button");
    fireEvent.click(confirmUpdateButton);

    // Verify updateProject action was called with correct data
    expect(updateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "project123",
        project_name: "Updated Project",
      })
    );

    // Popup should close after submission
    const closeButton = screen.getByTestId("close-button");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("project-popup")).not.toBeInTheDocument();
    });
  });

  // Test Case 4: Toggle project status
  it("toggles project status correctly", async () => {
    const {
      toggleProjectStatus,
    } = require("../../../redux/actions/projectActions");

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      </Provider>
    );

    // Click on status toggle button (current status is active -> setting to inactive)
    const statusToggleButton = screen.getByText("Set Inactive");
    fireEvent.click(statusToggleButton);

    // Check if confirmation modal is displayed
    expect(screen.getByTestId("status-modal")).toBeInTheDocument();

    // Confirm status change
    const confirmButton = screen.getByTestId("confirm-button");
    fireEvent.click(confirmButton);

    // Verify toggleProjectStatus action was called with correct parameters
    expect(toggleProjectStatus).toHaveBeenCalledWith("project123", false);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId("status-modal")).not.toBeInTheDocument();
    });
  });

  // Test Case 5: Navigate back when back button is clicked
  it("navigates back when back button is clicked", () => {
    const { useNavigate } = require("react-router-dom");
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      </Provider>
    );

    // Click back button
    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    // Verify navigate was called with -1 (go back)
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
