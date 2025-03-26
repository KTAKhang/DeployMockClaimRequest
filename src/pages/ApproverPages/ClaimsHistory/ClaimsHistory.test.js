import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ClaimsHistory from "../ClaimsHistory/ClaimsHistory"; // Adjust the import path as needed
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions";

import ClaimsTable from "../../../components/Table/ClaimsTable";
// Mock the required dependencies
jest.mock("../../../redux/actions/approverClaimActions", () => ({
  fetchClaimsRequest: jest
    .fn()
    .mockReturnValue({ type: "FETCH_CLAIMS_REQUEST" }),
}));

// Mock the ClaimsTable component
jest.mock("../../../components/Table/ClaimsTable", () => {
  return function MockClaimsTable({
    title,
    claimsData,
    filterCondition,
    loading,
    hideUpdatedAt,
  }) {
    return (
      <div data-testid="claims-table">
        <h1>{title}</h1>
        <div data-testid="claims-count">
          {claimsData ? claimsData.length : 0}
        </div>
        <div data-testid="filter-condition">{filterCondition}</div>
        <div data-testid="loading-state">
          {loading ? "Loading" : "Not Loading"}
        </div>
        <div data-testid="hide-updated">
          {hideUpdatedAt ? "Hidden" : "Visible"}
        </div>
        {claimsData && (
          <ul data-testid="claims-list">
            {claimsData.map((claim) => (
              <li key={claim.id} data-testid={`claim-${claim.id}`}>
                {claim.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
});

const mockStore = configureStore([]);

describe("ClaimsHistory Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      claims: {
        claims: [
          { id: "1", status: "Approved", project: "Project A" },
          { id: "2", status: "Paid", project: "Project B" },
          { id: "3", status: "Pending", project: "Project C" },
          { id: "4", status: "Rejected", project: "Project D" },
          { id: "5", status: "Approved", project: "Project E" },
        ],
        loading: false,
        lastUpdated: null,
      },
    });

    // Clear mock calls between tests
    fetchClaimsRequest.mockClear();
  });

  test("Renders ClaimsHistory component with correct title", () => {
    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(screen.getByText("Paid or Approved Claims")).toBeInTheDocument();
  });

  test("Dispatches fetchClaimsRequest on initial render", () => {
    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(fetchClaimsRequest).toHaveBeenCalledTimes(1);
  });

  test("Filters claims to only show Approved and Paid claims", () => {
    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    // There should be 3 claims (2 Approved and 1 Paid)
    expect(screen.getByTestId("claims-count").textContent).toBe("3");

    // Check if the correct statuses are rendered
    expect(screen.getByTestId("claims-list").textContent).toContain("Approved");
    expect(screen.getByTestId("claims-list").textContent).toContain("Paid");
    expect(screen.getByTestId("claims-list").textContent).not.toContain(
      "Pending"
    );
    expect(screen.getByTestId("claims-list").textContent).not.toContain(
      "Rejected"
    );
  });

  test("Passes correct props to ClaimsTable", () => {
    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(screen.getByTestId("filter-condition").textContent).toBe(
      "ClaimsHistory"
    );
    expect(screen.getByTestId("loading-state").textContent).toBe("Not Loading");
    expect(screen.getByTestId("hide-updated").textContent).toBe("Hidden");
  });

  test("Shows loading state correctly", () => {
    store = mockStore({
      claims: {
        claims: [],
        loading: true,
        lastUpdated: null,
      },
    });

    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(screen.getByTestId("loading-state").textContent).toBe("Loading");
  });

  test("Re-fetches claims when lastUpdated changes", () => {
    const { rerender } = render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(fetchClaimsRequest).toHaveBeenCalledTimes(1);

    // Update the store with new lastUpdated value and different claims
    store = mockStore({
      claims: {
        claims: [
          { id: "1", status: "Approved", project: "Project A" },
          { id: "2", status: "Approved", project: "Project B" },
        ],
        loading: false,
        lastUpdated: new Date().toISOString(),
      },
    });

    rerender(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    // Check if fetchClaimsRequest was called again
    expect(fetchClaimsRequest).toHaveBeenCalledTimes(3);
  });

  test("Handles empty claims array", () => {
    store = mockStore({
      claims: {
        claims: [],
        loading: false,
        lastUpdated: null,
      },
    });

    render(
      <Provider store={store}>
        <ClaimsHistory />
      </Provider>
    );

    expect(screen.getByTestId("claims-count").textContent).toBe("0");
  });
});
