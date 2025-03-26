import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import ClaimsTable from "../../components/Table/ClaimsTable";
import "@testing-library/jest-dom";

// Mock the reducers
const financeReducer = (
  state = { loading: false, isPaidSuccess: false },
  action
) => {
  switch (action.type) {
    case "FINANCE_UPDATE_CLAIM_STATUS_REQUEST":
      return { ...state, loading: true };
    case "FINANCE_UPDATE_CLAIM_STATUS_SUCCESS":
      return { ...state, loading: false, isPaidSuccess: true };
    default:
      return state;
  }
};

const claimsReducer = (state = { loading: false }, action) => {
  switch (action.type) {
    case "UPDATE_CLAIM_STATUS_REQUEST":
      return { ...state, loading: true };
    case "UPDATE_CLAIM_STATUS_SUCCESS":
      return { ...state, loading: false };
    case "REMOVE_PROCESSED_CLAIMS":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const claimerReducer = (state = { loading: false }, action) => {
  switch (action.type) {
    case "BULK_UPDATE_CLAIM_REQUEST":
      return { ...state, loading: true };
    case "BULK_UPDATE_CLAIM_SUCCESS":
      return { ...state, loading: false };
    case "CLAIMER_REMOVE_PROCESSED_CLAIMS":
      return { ...state, loading: false };
    case "FETCH_CLAIMS_REQUEST_CLAIMER":
      return { ...state, loading: true };
    default:
      return state;
  }
};

// Mock the action creators
jest.mock("../../redux/actions/approverClaimActions", () => ({
  UPDATE_CLAIM_STATUS_REQUEST: "UPDATE_CLAIM_STATUS_REQUEST",
  removeProcessedClaims: (claimIds) => ({
    type: "REMOVE_PROCESSED_CLAIMS",
    payload: claimIds,
  }),
}));

jest.mock("../../redux/actions/claimerActions.js", () => ({
  claimerRemoveProcessedClaims: (claimIds) => ({
    type: "CLAIMER_REMOVE_PROCESSED_CLAIMS",
    payload: claimIds,
  }),
  updateClaimRequestDraft: jest.fn(),
  bulkUpdateClaimRequest: (payload) => ({
    type: "BULK_UPDATE_CLAIM_REQUEST",
    payload,
  }),
  fetchClaimsRequestClaimer: (payload) => ({
    type: "FETCH_CLAIMS_REQUEST_CLAIMER",
    payload,
  }),
}));

jest.mock("../../redux/actions/financeAction.js", () => ({
  financeUpdateClaimStatusRequest: (claimIds, status) => ({
    type: "FINANCE_UPDATE_CLAIM_STATUS_REQUEST",
    payload: { claimIds, status },
  }),
}));

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [
    {
      get: jest.fn().mockImplementation((param) => {
        if (param === "status") return "All";
        if (param === "searchTerm") return "";
        if (param === "searchField") return "all";
        if (param === "dateFrom") return "";
        if (param === "dateTo") return "";
        return "";
      }),
    },
    jest.fn(),
  ],
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components used by ClaimsTable
jest.mock("../../components/Modal/Modal.jsx", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, actionType, reason, setReason }) =>
    isOpen ? (
      <div data-testid="approver-modal">
        <span>Action: {actionType}</span>
        <input
          data-testid="reason-input"
          value={reason || ""}
          onChange={(e) => setReason(e.target.value)}
        />
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <button onClick={() => onConfirm(reason)} data-testid="modal-confirm">
          Confirm
        </button>
      </div>
    ) : null,
}));

jest.mock("../../components/Search/EnhancedSearch", () => ({
  __esModule: true,
  default: ({ onSearch, activeFilters, onRemoveFilter }) => (
    <div data-testid="enhanced-search">
      <input
        data-testid="search-input"
        onChange={(e) => onSearch({ term: e.target.value, field: "all" })}
      />
      <button
        data-testid="date-search-button"
        onClick={() =>
          onSearch({
            term: "",
            field: "all",
            dateFrom: "2024-01-03",
            dateTo: "2024-01-08",
          })
        }
      >
        Search by date
      </button>
      <div data-testid="active-filters">
        {activeFilters.map((filter) => (
          <span key={filter.id} data-testid={`filter-${filter.id}`}>
            {filter.label}: {filter.value}
            <button
              data-testid={`remove-filter-${filter.id}`}
              onClick={() => onRemoveFilter(filter)}
            >
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  ),
}));

jest.mock("../../components/Loading/Loading.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("../../pages/FinancePage/FinanceDownloadModal/FinanceDownLoadModal.jsx", () => ({
  __esModule: true,
  default: ({ isOpenDownloadModal, setIsOpenDownloadModal }) =>
    isOpenDownloadModal ? (
      <div data-testid="finance-download-modal">
        <button onClick={() => setIsOpenDownloadModal(false)}>Close</button>
      </div>
    ) : null,
}));

// Mock sample claims data
const mockClaimsData = [
  {
    id: "CLM001",
    staff: "John Doe",
    project: "Project Alpha",
    duration: "From 2024-01-01 To 2024-01-07",
    hours: 40,
    status: "Pending",
    updateAt: "2024-01-08",
  },
  {
    id: "CLM002",
    staff: "Jane Smith",
    project: "Project Beta",
    duration: "From 2024-01-01 To 2024-01-05",
    hours: 35,
    status: "Approved",
    updateAt: "2024-01-06",
  },
  {
    id: "CLM003",
    staff: "Mike Johnson",
    project: "Project Gamma",
    duration: "From 2024-01-03 To 2024-01-08",
    hours: 40,
    status: "Paid",
    updateAt: "2024-01-10",
  },
  {
    id: "CLM004",
    staff: "Sarah Williams",
    project: "Project Alpha",
    duration: "From 2024-01-02 To 2024-01-06",
    hours: 38,
    status: "Rejected",
    updateAt: "2024-01-07",
  },
  {
    id: "CLM005",
    staff: "Alex Brown",
    project: "Project Delta",
    duration: "From 2024-01-01 To 2024-01-05",
    hours: 37,
    status: "Draft",
    updateAt: "2024-01-05",
  },
  {
    id: "CLM006",
    staff: "Pat Wilson",
    project: "Project Epsilon",
    duration: "From 2024-01-02 To 2024-01-09",
    hours: 45,
    status: "Pending",
    updateAt: "2024-01-10",
  },
  {
    id: "CLM007",
    staff: "Robin Davis",
    project: "Project Alpha",
    duration: "From 2024-01-03 To 2024-01-07",
    hours: 36,
    status: "Approved",
    updateAt: "2024-01-08",
  },
  {
    id: "CLM008",
    staff: "Taylor Moore",
    project: "Project Zeta",
    duration: "From 2024-01-01 To 2024-01-06",
    hours: 39,
    status: "Draft",
    updateAt: "2024-01-06",
  },
  {
    id: "CLM009",
    staff: "Jordan Lee",
    project: "Project Theta",
    duration: "From 2024-01-02 To 2024-01-07",
    hours: 42,
    status: "Rejected",
    updateAt: "2024-01-08",
  },
  {
    id: "CLM010",
    staff: "Casey Martin",
    project: "Project Iota",
    duration: "From 2024-01-03 To 2024-01-08",
    hours: 41,
    status: "Pending",
    updateAt: "2024-01-09",
  },
  {
    id: "CLM011",
    staff: "Riley Thompson",
    project: "Project Kappa",
    duration: "From 2024-01-01 To 2024-01-07",
    hours: 43,
    status: "Paid",
    updateAt: "2024-01-09",
  },
];

// Create a real Redux store with middleware
const rootReducer = combineReducers({
  finance: financeReducer,
  claims: claimsReducer,
  claimer: claimerReducer,
});

const createTestStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
};

const initialState = {
  finance: { loading: false, isPaidSuccess: false },
  claims: { loading: false },
  claimer: { loading: false },
};

// Setup test wrapper with necessary providers
const renderWithProviders = (
  ui,
  {
    preloadedState = initialState,
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Spy on store.dispatch
const spyOnDispatch = (store) => {
  const originalDispatch = store.dispatch;
  store.dispatch = jest.fn(originalDispatch);
  return store;
};

describe("ClaimsTable Component", () => {
  let store;

  beforeEach(() => {
    // Create a fresh store before each test
    store = spyOnDispatch(createTestStore(initialState));
    jest.clearAllMocks();
  });

  // Test 1: Finance actions work correctly
  test("finance payment action works correctly", async () => {
    const { getByText, getByTestId, getAllByRole } = renderWithProviders(
      <ClaimsTable
        title="Finance Approved Claims"
        claimsData={mockClaimsData.filter(
          (claim) => claim.status === "Approved"
        )}
        filterCondition="FinanceApproved"
      />,
      { store }
    );

    // Wait for component to finish loading
    await waitFor(() => {
      expect(getByText("PayAll")).toBeInTheDocument();
    });

    // Select a claim
    const checkboxes = getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // First checkbox after "select all"

    // Click the PayAll button
    fireEvent.click(getByText("PayAll"));

    // Modal should open
    await waitFor(() => {
      expect(getByTestId("approver-modal")).toBeInTheDocument();
    });

    // Confirm the action
    fireEvent.click(getByTestId("modal-confirm"));

    // Check if the correct action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "FINANCE_UPDATE_CLAIM_STATUS_REQUEST",
        payload: expect.objectContaining({
          status: "Paid",
        }),
      })
    );
  });

  // Test 2: Loading state works correctly
  test("displays loading indicator when loading is true", async () => {
    const loadingState = {
      finance: { loading: false },
      claims: { loading: false },
      claimer: { loading: true }, // Set claimer loading to true
    };

    const { getByTestId } = renderWithProviders(
      <ClaimsTable
        title="Test Claims Table"
        claimsData={[]} // Empty data to ensure loading state
        filterCondition="Draft"
      />,
      { preloadedState: loadingState }
    );

    // Should display loading component
    await waitFor(() => {
      expect(getByTestId("loading")).toBeInTheDocument();
    });
  });

  // Test 3: Submit action works correctly
  test("submit action works correctly for Draft claims", async () => {
    const { getByText, getByTestId, getAllByRole } = renderWithProviders(
      <ClaimsTable
        title="Draft Claims"
        claimsData={mockClaimsData.filter((claim) => claim.status === "Draft")}
        filterCondition="Draft"
      />,
      { store }
    );

    // Wait for component to finish loading
    await waitFor(() => {
      expect(getByText("SubmitAll")).toBeInTheDocument();
    });

    // Select a claim
    const checkboxes = getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // First checkbox after "select all"

    // Click the SubmitAll button
    fireEvent.click(getByText("SubmitAll"));

    // Modal should open
    await waitFor(() => {
      expect(getByTestId("approver-modal")).toBeInTheDocument();
    });

    // Confirm the action
    fireEvent.click(getByTestId("modal-confirm"));

    // Check if the correct action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "BULK_UPDATE_CLAIM_REQUEST",
        payload: expect.objectContaining({
          status: "Pending",
        }),
      })
    );
  });

  // Test 4: Select all works correctly
  test("select all checkbox works correctly", async () => {
    const { getAllByRole } = renderWithProviders(
      <ClaimsTable
        title="Test Claims Table"
        claimsData={mockClaimsData.filter(
          (claim) => claim.status === "Pending"
        )}
        filterCondition="ForMyVetting"
      />,
      { store }
    );

    // Wait for component to finish loading
    await waitFor(() => {
      const rows = getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });

    // Find the select all checkbox
    const checkboxes = getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0];

    // Initially no checkboxes should be checked
    expect(selectAllCheckbox).not.toBeChecked();

    // Click to select all
    fireEvent.click(selectAllCheckbox);

    // All visible checkboxes should be checked
    await waitFor(() => {
      const updatedCheckboxes = getAllByRole("checkbox");
      updatedCheckboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    // Click again to deselect all
    fireEvent.click(selectAllCheckbox);

    // All checkboxes should be unchecked
    await waitFor(() => {
      const updatedCheckboxes = getAllByRole("checkbox");
      updatedCheckboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  // Test 5: Cancel action works correctly
  test("cancel action works correctly for Draft claims", async () => {
    const { getByText, getByTestId, getAllByRole } = renderWithProviders(
      <ClaimsTable
        title="Draft Claims"
        claimsData={mockClaimsData.filter((claim) => claim.status === "Draft")}
        filterCondition="Draft"
      />,
      { store }
    );

    // Wait for component to finish loading
    await waitFor(() => {
      expect(getByText("CancelAll")).toBeInTheDocument();
    });

    // Select a claim
    const checkboxes = getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // First checkbox after "select all"

    // Click the CancelAll button
    fireEvent.click(getByText("CancelAll"));

    // Modal should open
    await waitFor(() => {
      expect(getByTestId("approver-modal")).toBeInTheDocument();
    });

    // Confirm the action
    fireEvent.click(getByTestId("modal-confirm"));

    // Check if the correct action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "BULK_UPDATE_CLAIM_REQUEST",
        payload: expect.objectContaining({
          status: "Cancelled",
        }),
      })
    );
  });

  // Test 6: Status filter in URL works correctly
  test("status filter from URL works correctly", async () => {
    // Mock the useSearchParams to return a specific status
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "Pending";
          return "";
        }),
      },
      jest.fn(),
    ];

    const { getAllByRole, queryByText } = renderWithProviders(
      <ClaimsTable
        title="Claims Table"
        claimsData={mockClaimsData}
        filterCondition="All"
      />,
      { store }
    );

    // Wait for the component to update with the filter
    await waitFor(() => {
      const rows = getAllByRole("row");
      expect(rows.length).toBe(4); // Header + 3 Pending claims

      // Check that only Pending claims are visible
      expect(queryByText("CLM001")).toBeInTheDocument();
      expect(queryByText("CLM006")).toBeInTheDocument();
      expect(queryByText("CLM010")).toBeInTheDocument();
      expect(queryByText("CLM002")).not.toBeInTheDocument(); // Approved claim
    });
  });

  // Test 7: Status filter changes update URL parameters
  test("status filter changes update URL parameters", async () => {
    const mockSetSearchParams = jest.fn();

    // Mock the useSearchParams
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          return "";
        }),
      },
      mockSetSearchParams,
    ];

    const { getByRole } = renderWithProviders(
      <ClaimsTable
        title="Claims Table with Status Filter"
        claimsData={mockClaimsData}
        filterCondition="ClaimsHistory"
      />,
      { store }
    );

    // Find the status filter dropdown
    await waitFor(() => {
      const statusDropdown = getByRole("combobox");
      expect(statusDropdown).toBeInTheDocument();

      // Change the status filter
      fireEvent.change(statusDropdown, { target: { value: "Approved" } });
    });

    // Check if setSearchParams was called with the correct status
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "Approved",
      })
    );
  });

  // Test 8: Status filter preserves search parameters when changed
  test("status filter preserves search parameters when changed", async () => {
    const mockSetSearchParams = jest.fn();

    // Mock the useSearchParams with active search
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          if (param === "searchTerm") return "Project";
          if (param === "searchField") return "project";
          return "";
        }),
      },
      mockSetSearchParams,
    ];

    const { getByRole } = renderWithProviders(
      <ClaimsTable
        title="Claims Table with Search and Filter"
        claimsData={mockClaimsData}
        filterCondition="ClaimsHistory"
      />,
      { store }
    );

    // Find the status dropdown
    await waitFor(() => {
      const statusDropdown = getByRole("combobox");

      // Change the status filter
      fireEvent.change(statusDropdown, { target: { value: "Paid" } });
    });

    // Check if setSearchParams was called with both status and search parameters
    expect(mockSetSearchParams).toHaveBeenCalledWith({
      status: "Paid",
      searchTerm: "Project",
      searchField: "project",
    });
  });

  // Test 9: Total claims counter displays correct count
  test("total claims counter displays correct count", async () => {
    // Mock the useSearchParams
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "Approved";
          return "";
        }),
      },
      jest.fn(),
    ];

    const { getByText } = renderWithProviders(
      <ClaimsTable
        title="Claims Counter Test"
        claimsData={mockClaimsData}
        filterCondition="ClaimsHistory"
      />,
      { store }
    );

    // Wait for component to load and filter to apply
    await waitFor(() => {
      // There are 2 Approved claims in the mock data
      expect(getByText(/total claims:/i)).toBeInTheDocument();
      expect(getByText("2")).toBeInTheDocument();
    });
  });

  // Test 10: Combined search and date filters work correctly
  test("combined search and date filters work correctly", async () => {
    // Mock search params with both text and date filters
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          if (param === "searchTerm") return "Alpha";
          if (param === "searchField") return "project";
          if (param === "dateFrom") return "2024-01-03";
          if (param === "dateTo") return "2024-01-08";
          return "";
        }),
      },
      jest.fn(),
    ];

    const { queryByText } = renderWithProviders(
      <ClaimsTable
        title="Claims Table with Combined Filters"
        claimsData={mockClaimsData}
        filterCondition="history" // Using appropriate view type
      />,
      { store }
    );

    // Wait for filters to apply
    await waitFor(() => {
      // Only Project Alpha claims with dates between Jan 3-8 should be visible
      expect(queryByText("CLM007")).toBeInTheDocument(); // Project Alpha, From 2024-01-03 To 2024-01-07

      // Other Project Alpha claims outside date range should not be visible
      expect(queryByText("CLM001")).not.toBeInTheDocument(); // Project Alpha, From 2024-01-01 To 2024-01-07
      expect(queryByText("CLM004")).not.toBeInTheDocument(); // Project Alpha, From 2024-01-02 To 2024-01-06

      // Claims matching date but not project should not be visible
      expect(queryByText("CLM003")).not.toBeInTheDocument(); // Project Gamma, From 2024-01-03 To 2024-01-08
    });
  });

  // Test 11: Field-specific search works correctly
  test("field-specific search works correctly", async () => {
    // Mock search params with field-specific search
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          if (param === "searchTerm") return "Johnson";
          if (param === "searchField") return "staff"; // Only search in staff field
          return "";
        }),
      },
      jest.fn(),
    ];

    const { queryByText } = renderWithProviders(
      <ClaimsTable
        title="Claims Table with Field-Specific Search"
        claimsData={mockClaimsData}
        filterCondition="vetting" // Using appropriate view type
      />,
      { store }
    );

    // Wait for filters to apply
    await waitFor(() => {
      // Only staff with "Johnson" should be visible
      expect(queryByText("CLM003")).toBeInTheDocument(); // Mike Johnson

      // Other claims should not be visible
      expect(queryByText("CLM001")).not.toBeInTheDocument(); // John Doe
      expect(queryByText("CLM002")).not.toBeInTheDocument(); // Jane Smith
    });
  });

  // Test 12: Test search with console warnings for invalid data
  test("logs console warnings for claims with unexpected duration format", async () => {
    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    // Create data with invalid duration format
    const invalidFormatData = [
      ...mockClaimsData,
      {
        id: "CLM014",
        staff: "Complex Object User",
        project: "Project Nu",
        duration: { from: "2024-01-01", to: "2024-01-05" }, // Object instead of string
        hours: 40,
        status: "Pending",
        updateAt: "2024-01-08",
      },
    ];

    // Mock search params to trigger filtering
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          if (param === "dateFrom") return "2024-01-01";
          if (param === "dateTo") return "2024-01-10";
          return "";
        }),
      },
      jest.fn(),
    ];

    renderWithProviders(
      <ClaimsTable
        title="Claims Table"
        claimsData={invalidFormatData}
        filterCondition="history" // Using appropriate view type
      />,
      { store }
    );

    // Wait to ensure filtering has been applied
    await waitFor(() => {
      // Should log warning about unexpected format
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Claim CLM014 has duration in unexpected format:"
        ),
        expect.anything()
      );
    });

    // Clean up
    consoleWarnSpy.mockRestore();
  });
  // Test 13: Test pagination functionality
  test("pagination works correctly", async () => {
    // Mock a large dataset to trigger pagination
    const manyClaimsData = Array(25)
      .fill()
      .map((_, index) => ({
        id: `CLM${String(index + 100).padStart(3, "0")}`,
        staff: `Staff ${index}`,
        project: `Project ${index % 5}`,
        duration: `From 2024-01-01 To 2024-01-${String(
          (index % 7) + 1
        ).padStart(2, "0")}`,
        hours: 35 + (index % 10),
        status: ["Pending", "Approved", "Paid", "Rejected", "Draft"][index % 5],
        updateAt: `2024-01-${String((index % 28) + 1).padStart(2, "0")}`,
      }));

    const { getByText, getAllByRole, queryByText } = renderWithProviders(
      <ClaimsTable
        title="Paginated Claims Table"
        claimsData={manyClaimsData}
        filterCondition="history"
      />,
      { store }
    );

    // Wait for items from the first page to be visible
    await waitFor(() => {
      expect(queryByText("CLM100")).toBeInTheDocument();
    });

    // Should only show 10 items per page
    const initialRows = getAllByRole("row");
    expect(initialRows.length).toBe(11); // 10 items + header row

    // First page should show first 10 items
    expect(queryByText("CLM100")).toBeInTheDocument();
    expect(queryByText("CLM109")).toBeInTheDocument();
    expect(queryByText("CLM110")).not.toBeInTheDocument();

    // Find and click the next page button (it might not say "Next" exactly)
    const nextButton = getByText(/next/i);
    fireEvent.click(nextButton);

    // Should now show next 10 items
    await waitFor(() => {
      expect(queryByText("CLM100")).not.toBeInTheDocument();
      expect(queryByText("CLM110")).toBeInTheDocument();
      expect(queryByText("CLM119")).toBeInTheDocument();
    });
  });

  // Test 14: Test filtering by date range
  test("date range filter works correctly", async () => {
    const mockSetSearchParams = jest.fn();

    // Mock the useSearchParams to return search parameters
    require("react-router-dom").useSearchParams = () => [
      {
        get: jest.fn().mockImplementation((param) => {
          if (param === "status") return "All";
          return "";
        }),
      },
      mockSetSearchParams,
    ];

    const { getByTestId } = renderWithProviders(
      <ClaimsTable
        title="Date Filter Claims Table"
        claimsData={mockClaimsData}
        filterCondition="history"
      />,
      { store }
    );

    // Wait for the search component to render
    await waitFor(() => {
      expect(getByTestId("date-search-button")).toBeInTheDocument();
    });

    // Click the date search button
    fireEvent.click(getByTestId("date-search-button"));

    // Check if setSearchParams was called with the correct date range
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: "2024-01-03",
        dateTo: "2024-01-08",
      })
    );
  });
  1;
});
