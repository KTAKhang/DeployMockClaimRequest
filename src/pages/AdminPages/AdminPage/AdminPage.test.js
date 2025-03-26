import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import { MemoryRouter } from "react-router-dom";
import AdminPage from "../AdminPage"; // Ensure this is the correct path

import { getStaffAll } from "../../../redux/actions/staffActions";
import { getProjectsAll } from "../../../redux/actions/projectActions";

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock Redux actions
jest.mock("../../../redux/actions/staffActions", () => ({
  getStaffAll: jest.fn(() => ({ type: "GET_STAFF_ALL_REQUEST" })),
}));

jest.mock("../../../redux/actions/projectActions", () => ({
  getProjectsAll: jest.fn(() => ({ type: "GET_PROJECTS_ALL_REQUEST" })),
}));

// Mock ApexCharts
jest.mock("react-apexcharts", () => () => (
  <div data-testid="mock-chart">Mock Chart</div>
));

const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

// Sample mock data
const mockStaffData = [
  {
    _id: "staff1",
    user_name: "John Doe",
    role_name: "Developer",
    status: true,
  },
  {
    _id: "staff2",
    user_name: "Jane Smith",
    role_name: "Designer",
    status: true,
  },
  {
    _id: "staff3",
    user_name: "Bob Johnson",
    role_name: "Manager",
    status: false,
  },
];

const mockProjectData = [
  { _id: "proj1", project_name: "Website Redesign", status: true },
  { _id: "proj2", project_name: "Mobile App Development", status: false },
  { _id: "proj3", project_name: "Database Migration", status: false },
  { _id: "proj4", project_name: "API Integration", status: true },
  { _id: "proj5", project_name: "Security Audit", status: false },
];

let store;

beforeEach(() => {
  mockNavigate.mockClear();
  jest.clearAllMocks();

  store = mockStore({
    staff: { staffAll: { data: mockStaffData }, loading: false },
    projects: { projectsAll: { data: mockProjectData }, loading: false },
  });

  store.dispatch = jest.fn(); // Ensure dispatch calls are tracked
});

describe("AdminPage Component", () => {
  test("Renders AdminPage component with data", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Total projects count
    expect(screen.getByText("Active Staff")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Active staff count
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("Displays loading state when fetching data", () => {
    store = mockStore({
      staff: { staffAll: null, loading: true },
      projects: { projectsAll: null, loading: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Loading chart...")).toBeInTheDocument();
  });

  test("Navigates to project page when Total Projects card is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /total projects/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/project");
  });

  test("Navigates to staff page when Active Staff card is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /active staff/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/staff");
  });

  test("Dispatches actions on component mount", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    expect(getStaffAll).toHaveBeenCalled();
    expect(getProjectsAll).toHaveBeenCalled();
  });
});
