import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard"; // Adjust import path as needed
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions";
import Loading from "../../../components/Loading/Loading";
import Typewriter from "../../../components/Typewriter/TypewriterText";

// Mock the dependencies
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../redux/actions/approverClaimActions", () => ({
  fetchClaimsRequest: jest
    .fn()
    .mockReturnValue({ type: "FETCH_CLAIMS_REQUEST" }),
}));

// Mock the components that aren't being tested
jest.mock("../../../components/Loading/Loading.jsx", () => ({
  __esModule: true,
  default: ({ message }) => (
    <div data-testid="loading-component">{message || "Loading details..."}</div>
  ),
}));

jest.mock("../../../components/Typewriter/TypewriterText", () => ({
  __esModule: true,
  default: ({ text }) => <div data-testid="typewriter">{text}</div>,
}));

// Setup mock store
const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

describe("Dashboard Component", () => {
  let store;

  // Sample claims data with more than 5 pending claims for testing the "Show More" functionality
  const sampleClaims = [
    {
      _id: "1",
      staff: "John Doe",
      project: "Project A",
      duration: "Jan-Mar 2024",
      status: "Pending",
    },
    {
      _id: "2",
      staff: "Jane Smith",
      project: "Project B",
      duration: "Feb-Apr 2024",
      status: "Pending",
    },
    {
      _id: "3",
      staff: "Mike Johnson",
      project: "Project C",
      duration: "Mar-May 2024",
      status: "Approved",
    },
    {
      _id: "4",
      staff: "Sarah Williams",
      project: "Project D",
      duration: "Apr-Jun 2024",
      status: "Paid",
    },
    {
      _id: "5",
      staff: "Robert Brown",
      project: "Project E",
      duration: "May-Jul 2024",
      status: "Pending",
    },
    {
      _id: "6",
      staff: "Emily Davis",
      project: "Project F",
      duration: "Jun-Aug 2024",
      status: "Pending",
    },
    {
      _id: "7",
      staff: "David Miller",
      project: "Project G",
      duration: "Jul-Sep 2024",
      status: "Pending",
    },
    {
      _id: "8",
      staff: "Lisa Adams",
      project: "Project H",
      duration: "Aug-Oct 2024",
      status: "Pending",
    },
    {
      _id: "9",
      staff: "Alex Turner",
      project: "Project I",
      duration: "Sep-Nov 2024",
      status: "Pending",
    },
    {
      _id: "10",
      staff: "Chris Wilson",
      project: "Project J",
      duration: "Oct-Dec 2024",
      status: "Pending",
    },
  ];

  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    store = mockStore({
      claims: {
        claims: sampleClaims,
        loading: false,
        error: null,
        lastUpdated: null,
      },
    });
  });

  test("Renders Dashboard component with welcome message", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("typewriter")).toHaveTextContent(
      "Welcome, Approver!"
    );
    // Instead of using getByText, use getAllByText and check the first occurrence
    // or check that at least one instance exists
    const pendingApprovalElements = screen.getAllByText("Pending Approvals");
    expect(pendingApprovalElements.length).toBeGreaterThan(0);
  });

  test("Displays loading state when fetching data", () => {
    store = mockStore({
      claims: {
        claims: [],
        loading: true,
        error: null,
        lastUpdated: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("loading-component")).toHaveTextContent(
      "Loading dashboard..."
    );
  });

  test("Displays error message when fetch fails", () => {
    store = mockStore({
      claims: {
        claims: [],
        loading: false,
        error: "Failed to fetch claims data",
        lastUpdated: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Failed to fetch claims data")).toBeInTheDocument();
  });

  test("Displays correct counts in statistics cards", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Find all text elements that could contain the numbers
    const elements = screen.getAllByText(/\d+/);

    // Check for the existence of "8" (pending claims count)
    const pendingCountExists = elements.some((el) => el.textContent === "8");
    expect(pendingCountExists).toBe(true);

    // Check for the existence of "1" (approved claims count)
    const approvedCountExists = elements.some((el) => el.textContent === "1");
    expect(approvedCountExists).toBe(true);

    // Verify pending count badge
    expect(screen.getByText("8 pending")).toBeInTheDocument();
  });

  test("Shows 'No pending approvals' message when no pending claims exist", () => {
    store = mockStore({
      claims: {
        claims: [
          {
            _id: "3",
            staff: "Mike Johnson",
            project: "Project C",
            duration: "Mar-May 2024",
            status: "Approved",
          },
          {
            _id: "4",
            staff: "Sarah Williams",
            project: "Project D",
            duration: "Apr-Jun 2024",
            status: "Paid",
          },
        ],
        loading: false,
        error: null,
        lastUpdated: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText("No pending approvals at the moment.")
    ).toBeInTheDocument();
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
  });

  test("Correctly navigates to claim detail page when Review button is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Find the first Review button
    const reviewButtons = screen.getAllByText("Review");
    expect(reviewButtons.length).toBeGreaterThan(0);

    // Click on the first Review button
    fireEvent.click(reviewButtons[0]);

    // Check if navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/approver/vetting/1");
  });

  test("Fetches claims data on initial load and when lastUpdated changes", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Check if fetchClaimsRequest was called initially
    expect(fetchClaimsRequest).toHaveBeenCalled();

    // Update store with a new lastUpdated value and different claims
    const updatedStore = mockStore({
      claims: {
        claims: [
          ...sampleClaims.slice(0, 5),
          {
            _id: "11",
            staff: "New Person",
            project: "New Project",
            duration: "Nov-Jan 2025",
            status: "Pending",
          },
        ],
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(), // Add a lastUpdated timestamp
      },
    });

    // Re-render with updated store
    jest.clearAllMocks();
    render(
      <Provider store={updatedStore}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // fetchClaimsRequest should be called again due to lastUpdated change
    expect(fetchClaimsRequest).toHaveBeenCalled();
  });

  test("ClaimCard component displays claim information correctly", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Check if claim details are displayed correctly
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Jan-Mar 2024")).toBeInTheDocument();

    // Check that all required claims have review buttons
    const reviewButtons = screen.getAllByText("Review");
    expect(reviewButtons.length).toBe(5); // First 5 pending claims should have Review buttons
  });
  test("Navigates correctly when statistic cards are clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Using a more robust selector approach
    const statCards = screen.getAllByText(
      /(Pending Approvals|Approved Claims|Paid Claims)/
    );

    // Click on each card's parent container
    fireEvent.click(
      statCards[0].closest("div.cursor-pointer") ||
        statCards[0].parentElement.parentElement
    );
    expect(mockNavigate).toHaveBeenCalledWith("/approver/vetting");

    fireEvent.click(
      statCards[1].closest("div.cursor-pointer") ||
        statCards[1].parentElement.parentElement
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      "/approver/history?status=Approved"
    );

    fireEvent.click(
      statCards[2].closest("div.cursor-pointer") ||
        statCards[2].parentElement.parentElement
    );
    expect(mockNavigate).toHaveBeenCalledWith("/approver/history?status=Paid");
  });

  test("Show More/Less button toggles visibility of extra claims", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Initially, only the first 5 claims should be visible
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Chris Wilson")).not.toBeInTheDocument();

    // Find and click the "Show More" button
    const showMoreButton = screen.getByText("Show More");
    fireEvent.click(showMoreButton);

    // Wait for the animation to complete and verify extra claims are now visible
    await waitFor(() => {
      expect(screen.getByText("Chris Wilson")).toBeInTheDocument();
    });

    // Button text should now be "Show Less"
    expect(screen.getByText("Show Less")).toBeInTheDocument();

    // Click "Show Less" and verify the extra claims are hidden again
    fireEvent.click(screen.getByText("Show Less"));

    await waitFor(() => {
      expect(screen.queryByText("Chris Wilson")).not.toBeInTheDocument();
    });
  });

  test("Extra claims render correctly when Show More is clicked", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Click the "Show More" button
    fireEvent.click(screen.getByText("Show More"));

    // Wait for all extra claims to be visible and verify their content
    await waitFor(() => {
      // Check for the extra claims (indices 5-9 in the sample data)
      expect(screen.getByText("Emily Davis")).toBeInTheDocument();
      expect(screen.getByText("Project F")).toBeInTheDocument();
      expect(screen.getByText("Jun-Aug 2024")).toBeInTheDocument();

      expect(screen.getByText("David Miller")).toBeInTheDocument();
      expect(screen.getByText("Project G")).toBeInTheDocument();

      expect(screen.getByText("Lisa Adams")).toBeInTheDocument();
      expect(screen.getByText("Project H")).toBeInTheDocument();

      // Verify the correct number of Review buttons (should be all pending claims)
      const reviewButtons = screen.getAllByText("Review");
      expect(reviewButtons.length).toBe(8); // All 8 pending claims
    });
  });
  test("Refetches claims when lastUpdated changes and claims are different", async () => {
    // First render with initial state
    const { rerender } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Clear the mock to ignore the initial fetch on component mount
    jest.clearAllMocks();

    // Create a modified copy of the claims array to test with
    const modifiedClaims = [
      ...sampleClaims.slice(0, 9),
      {
        _id: "11",
        staff: "New Person",
        project: "New Project",
        duration: "Nov-Jan 2025",
        status: "Pending",
      },
    ];

    // Update store with new lastUpdated value AND different claims
    const updatedStore = mockStore({
      claims: {
        claims: modifiedClaims,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(), // New timestamp
      },
    });

    // Re-render with updated store
    rerender(
      <Provider store={updatedStore}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // fetchClaimsRequest should be called since lastUpdated has changed
    expect(fetchClaimsRequest).toHaveBeenCalled();

    // Reset the mock to check the next condition
    jest.clearAllMocks();

    // Re-render with the same store (same lastUpdated and claims)
    rerender(
      <Provider store={updatedStore}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Now fetchClaimsRequest should not be called since nothing has changed
    expect(fetchClaimsRequest).not.toHaveBeenCalled();
  });
});
