import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import ForMyVetting from "../ForMyVetting/ForMyVetting";
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions";

// Mock the dependencies
jest.mock("../../../redux/actions/approverClaimActions", () => ({
  fetchClaimsRequest: jest
    .fn()
    .mockReturnValue({ type: "FETCH_CLAIMS_REQUEST" }),
}));

// Mock the ClaimsTable component
jest.mock("../../../components/Table/ClaimsTable", () => ({
  __esModule: true,
  default: ({ title, claimsData, filterCondition, loading, hideUpdatedAt }) => (
    <div data-testid="claims-table">
      <h2>{title}</h2>
      <div data-testid="claims-count">{claimsData?.length || 0}</div>
      <div data-testid="filter-condition">{filterCondition}</div>
      <div data-testid="loading-state">
        {loading ? "Loading" : "Not Loading"}
      </div>
      <div data-testid="hide-updated">
        {hideUpdatedAt ? "Hidden" : "Visible"}
      </div>
      {claimsData && claimsData.length > 0 ? (
        <ul data-testid="claims-list">
          {claimsData.map((claim) => (
            <li key={claim._id} data-testid={`claim-${claim._id}`}>
              {claim.staff} - {claim.project} - {claim.status}
            </li>
          ))}
        </ul>
      ) : (
        <div data-testid="no-claims">No claims available</div>
      )}
    </div>
  ),
}));

// Setup mock store
const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

describe("ForMyVetting Component", () => {
  let store;

  // Sample claims data
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
  ];

  beforeEach(() => {
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

  test("Renders ForMyVetting component with correct title", () => {
    render(
      <Provider store={store}>
        <ForMyVetting />
      </Provider>
    );

    expect(
      screen.getByText("Summary of Claims for Approval")
    ).toBeInTheDocument();
  });

  test("Filters and displays only pending claims", () => {
    render(
      <Provider store={store}>
        <ForMyVetting />
      </Provider>
    );

    // There should be 3 pending claims
    expect(screen.getByTestId("claims-count").textContent).toBe("3");

    // Check if pending claims are displayed
    expect(screen.getByTestId("claims-list")).toBeInTheDocument();
    expect(screen.getByTestId("claim-1")).toBeInTheDocument();
    expect(screen.getByTestId("claim-2")).toBeInTheDocument();
    expect(screen.getByTestId("claim-5")).toBeInTheDocument();

    // Make sure non-pending claims aren't displayed
    expect(screen.queryByTestId("claim-3")).not.toBeInTheDocument();
    expect(screen.queryByTestId("claim-4")).not.toBeInTheDocument();
  });

  test("Displays loading state correctly", () => {
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
        <ForMyVetting />
      </Provider>
    );

    expect(screen.getByTestId("loading-state").textContent).toBe("Loading");
  });

  test("Fetches claims data on initial render", () => {
    render(
      <Provider store={store}>
        <ForMyVetting />
      </Provider>
    );

    expect(fetchClaimsRequest).toHaveBeenCalledTimes(1);
  });

  test("Refetches claims when lastUpdated changes and claims differ", async () => {
    const { rerender } = render(
      <Provider store={store}>
        <ForMyVetting />
      </Provider>
    );

    // Clear initial call
    jest.clearAllMocks();

    // Update store with new lastUpdated value and changed claims
    const updatedStore = mockStore({
      claims: {
        claims: [
          ...sampleClaims,
          {
            _id: "6",
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
    rerender(
      <Provider store={updatedStore}>
        <ForMyVetting />
      </Provider>
    );

    // Check if fetchClaimsRequest was called again
    expect(fetchClaimsRequest).toHaveBeenCalledTimes(2);
  });

  test("Passes correct props to ClaimsTable component", () => {
    render(
      <Provider store={store}>
        <ForMyVetting />
      </Provider>
    );

    expect(screen.getByTestId("filter-condition").textContent).toBe(
      "ForMyVetting"
    );
    expect(screen.getByTestId("hide-updated").textContent).toBe("Hidden");
  });

  test("Shows 'No claims available' when there are no pending claims", () => {
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
        <ForMyVetting />
      </Provider>
    );

    expect(screen.getByTestId("no-claims")).toBeInTheDocument();
    expect(screen.getByTestId("no-claims").textContent).toBe(
      "No claims available"
    );
  });
});
