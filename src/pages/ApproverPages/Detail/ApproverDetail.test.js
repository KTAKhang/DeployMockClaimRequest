import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureMockStore from "redux-mock-store";
// Remove direct thunk import since we're using RTK
import Detail from "../Detail/Detail";
import { toast } from "react-toastify";
import * as commentActions from "../../../redux/actions/commentAction";
import * as approverClaimActions from "../../../redux/actions/approverClaimActions";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "test-claim-id" }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: "/claims/vetting/test-claim-id",
    state: { mode: "vetting" },
  }),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create mock store - using RTK compatible approach
// No middleware for mock store when using newer Redux Toolkit
const mockStore = configureMockStore([]);

// Sample mock data
const mockClaim = {
  _id: "test-claim-id",
  user: {
    _id: "user-1",
    user_name: "John Doe",
    avatar: "avatar-url",
  },
  project: {
    project_name: "Test Project",
    duration: {
      from: "2023-01-01",
      to: "2023-12-31",
    },
  },
  status: {
    name: "Pending",
  },
  total_no_of_hours: 40,
  reason_claimer: "Test reason from claimer",
  reason_approver: "Test reason from approver",
};

const mockComments = [
  {
    _id: "comment-1",
    content: "This is a test comment",
    user_id: {
      _id: "user-1",
      user_name: "John Doe",
      avatar: "avatar-url",
      role_id: { name: "Claimer" },
    },
    createdAt: "2023-05-10T12:30:00Z",
    replies: [
      {
        _id: "reply-1",
        content: "This is a reply",
        user: {
          _id: "user-2",
          user_name: "Jane Smith",
          avatar: "avatar-url-2",
          role: "Approver",
        },
        createdAt: "2023-05-10T14:30:00Z",
      },
    ],
  },
];

// Setup default store
const setupStore = (customState = {}) => {
  const defaultState = {
    claims: {
      claimDetail: mockClaim,
      loading: false,
      error: null,
    },
    comment: {
      comments: mockComments,
      loadingComment: false,
      errorComment: null,
    },
    auth: {
      user: {
        _id: "user-2",
        user_name: "Jane Smith",
        avatar: "avatar-url-2",
      },
    },
  };

  return mockStore({
    ...defaultState,
    ...customState,
  });
};

// Helper function to render component with store
const renderWithProviders = (ui, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe("Detail Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn().mockImplementation((key) => {
          if (key === "role") return "Approver";
          return null;
        }),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders loading state when data is being fetched", () => {
    const store = setupStore({
      claims: {
        claimDetail: null,
        loading: true,
        error: null,
      },
    });

    renderWithProviders(<Detail />, store);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders error state when there is an error fetching claim", () => {
    const errorMessage = "Failed to fetch claim details";
    const store = setupStore({
      claims: {
        claimDetail: null,
        loading: false,
        error: errorMessage,
      },
    });

    renderWithProviders(<Detail />, store);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });

  test("renders claim not found message when claim is null", () => {
    const store = setupStore({
      claims: {
        claimDetail: null,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Detail />, store);

    expect(screen.getByText(/claim not found/i)).toBeInTheDocument();
  });

  test("renders claim details correctly when data is available", () => {
    const store = setupStore();

    renderWithProviders(<Detail />, store);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("40 hrs")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Test reason from claimer")).toBeInTheDocument();
  });

  test("allows copying claim ID when clicking on it", async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const store = setupStore();

    renderWithProviders(<Detail />, store);

    const idElement = screen.getByText("test-claim-id");
    fireEvent.click(idElement);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "test-claim-id"
      );
    });
  });

  test("does not allow comments when claim status is Paid", () => {
    const store = setupStore({
      claims: {
        claimDetail: {
          ...mockClaim,
          status: { name: "Paid" },
        },
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Detail />, store);

    expect(screen.getByText(/comments are locked/i)).toBeInTheDocument();
    // Comment input should not be present
    const commentInput = screen.queryByPlaceholderText(/add your comment/i);
    expect(commentInput).not.toBeInTheDocument();
  });
});
