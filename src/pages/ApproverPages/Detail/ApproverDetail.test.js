import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import { MemoryRouter } from "react-router-dom";
import Detail from "../Detail/Detail.jsx"; // Adjust the import path as needed
import { toast } from "react-toastify";
import {
  FETCH_CLAIM_DETAIL_REQUEST,
  UPDATE_CLAIM_STATUS_REQUEST,
  removeProcessedClaims,
} from "../../../redux/actions/approverClaimActions.js";
import {
  createCommentRequest,
  getCommentsRequest,
  replyCommentRequest,
} from "../../../redux/actions/commentAction.js";

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
  useParams: () => ({ id: "1" }),
  useLocation: () => ({
    pathname: "/approver/vetting/1",
    state: { mode: "vetting" },
  }),
}));

// Mock the Modal component to make it easier to test
jest.mock("../../../components/Modal/Modal.jsx", () => {
  return function MockedModal({ isOpen, onClose, onConfirm, actionType }) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <h2>CONFIRMATION</h2>
        <p>Are you sure you want to {actionType} this claim?</p>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onClose}>No</button>
      </div>
    );
  };
});

jest.mock("../../../redux/actions/approverClaimActions", () => ({
  FETCH_CLAIM_DETAIL_REQUEST: "FETCH_CLAIM_DETAIL_REQUEST",
  UPDATE_CLAIM_STATUS_REQUEST: "UPDATE_CLAIM_STATUS_REQUEST",
  removeProcessedClaims: jest
    .fn()
    .mockReturnValue({ type: "REMOVE_PROCESSED_CLAIMS" }),
}));

jest.mock("../../../redux/actions/commentAction.js", () => ({
  createCommentRequest: jest
    .fn()
    .mockReturnValue({ type: "CREATE_COMMENT_REQUEST" }),
  getCommentsRequest: jest
    .fn()
    .mockReturnValue({ type: "GET_COMMENTS_REQUEST" }),
  replyCommentRequest: jest
    .fn()
    .mockReturnValue({ type: "REPLY_COMMENT_REQUEST" }),
}));

const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

let store;

beforeEach(() => {
  mockNavigate.mockClear();
  jest.clearAllMocks();
  store = mockStore({
    claims: {
      claimDetail: {
        _id: "1",
        user: {
          user_name: "John Doe",
          avatar: null,
        },
        project: {
          project_name: "Project X",
          duration: {
            from: "2024-01-01T00:00:00Z",
            to: "2024-06-30T00:00:00Z",
          },
        },
        total_no_of_hours: 150,
        reason_approver: "This claim looks good",
        status: { name: "Pending" },
      },
      loading: false,
      error: null,
    },
    comment: {
      comments: [],
      loadingComment: false,
      errorComment: null,
    },
  });
});

describe("Detail Component", () => {
  test("Renders Detail component with valid data", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByRole("heading", { name: "Claim Detailed Information" })
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Project X")).toBeInTheDocument();
    expect(screen.getByText("150 hrs")).toBeInTheDocument();
    expect(screen.getByText("ID:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("Displays loading state while fetching data", () => {
    store = mockStore({
      claims: {
        claimDetail: null,
        loading: true,
        error: null,
      },
      comment: {
        comments: [],
        loadingComment: false,
        errorComment: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Loading claim details...")).toBeInTheDocument();
  });

  test("Displays error message when fetch fails", () => {
    store = mockStore({
      claims: {
        claimDetail: null,
        loading: false,
        error: "Failed to fetch claim details",
      },
      comment: {
        comments: [],
        loadingComment: false,
        errorComment: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText("Failed to fetch claim details")
    ).toBeInTheDocument();
  });

  test("Back button navigates to previous page", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    const backButtons = screen.getAllByText("Back");
    fireEvent.click(backButtons[0]); // Click the first Back button (breadcrumb)
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("Approve button opens confirmation modal after entering reason", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Update the reason text
    const reasonTextarea = screen.getByPlaceholderText(
      "Enter your decision reason..."
    );
    fireEvent.change(reasonTextarea, {
      target: { value: "Approved with conditions" },
    });

    // Click the Approve button
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    // The modal should be opened
    await waitFor(() => {
      expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
    });
  });

  test("Button cannot open modal if reason is empty", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Clear the reason text
    const reasonTextarea = screen.getByPlaceholderText(
      "Enter your decision reason..."
    );
    fireEvent.change(reasonTextarea, { target: { value: "" } });

    // Click the Approve button
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    // The modal should not be opened
    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
    expect(
      screen.getByText("Please provide a reason before proceeding.")
    ).toBeInTheDocument();
  });

  test("Dispatches correct actions when approving a claim", async () => {
    // Clear mocks before test
    jest.clearAllMocks();

    // Mock the removeProcessedClaims differently
    const mockRemoveProcessedClaims = jest
      .fn()
      .mockReturnValue({ type: "REMOVE_PROCESSED_CLAIMS" });
    require("../../../redux/actions/approverClaimActions.js").removeProcessedClaims =
      mockRemoveProcessedClaims;

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Update the reason text
    const reasonTextarea = screen.getByPlaceholderText(
      "Enter your decision reason..."
    );
    fireEvent.change(reasonTextarea, {
      target: { value: "Approved with conditions" },
    });

    // Click the Approve button
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    // Wait for the modal to appear and click Yes
    await waitFor(() => {
      const yesButton = screen.getByText("Yes");
      fireEvent.click(yesButton);
    });

    // Check that removeProcessedClaims was called with the right ID
    expect(mockRemoveProcessedClaims).toHaveBeenCalledWith(["1"]);

    // Check that the correct action was dispatched
    expect(store.getActions()).toContainEqual({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids: ["1"],
        status: "Approved",
        reason_approver: "Approved with conditions",
      },
    });

    // Check toast and navigation
    expect(toast.success).toHaveBeenCalledWith(
      "Claim approved successfully!",
      expect.any(Object)
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      "/approver/history?status=Approved"
    );
  });

  test("Dispatches correct actions when rejecting a claim", async () => {
    // Clear mocks before test
    jest.clearAllMocks();

    // Mock the removeProcessedClaims differently
    const mockRemoveProcessedClaims = jest
      .fn()
      .mockReturnValue({ type: "REMOVE_PROCESSED_CLAIMS" });
    require("../../../redux/actions/approverClaimActions.js").removeProcessedClaims =
      mockRemoveProcessedClaims;

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Update the reason text
    const reasonTextarea = screen.getByPlaceholderText(
      "Enter your decision reason..."
    );
    fireEvent.change(reasonTextarea, {
      target: { value: "Rejected due to insufficient documentation" },
    });

    // Click the Reject button
    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    // Wait for the modal to appear and click Yes
    await waitFor(() => {
      const yesButton = screen.getByText("Yes");
      fireEvent.click(yesButton);
    });

    // Check that removeProcessedClaims was called with the right ID
    expect(mockRemoveProcessedClaims).toHaveBeenCalledWith(["1"]);

    // Check that the correct action was dispatched
    expect(store.getActions()).toContainEqual({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids: ["1"],
        status: "Rejected",
        reason_approver: "Rejected due to insufficient documentation",
      },
    });

    // Check toast and navigation
    expect(toast.error).toHaveBeenCalledWith(
      "Claim rejected.",
      expect.any(Object)
    );
    expect(mockNavigate).toHaveBeenCalledWith("/approver/vetting");
  });

  test("Updates localReason when textarea value changes", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    const reasonTextarea = screen.getByPlaceholderText(
      "Enter your decision reason..."
    );
    fireEvent.change(reasonTextarea, {
      target: { value: "New reason text" },
    });

    expect(reasonTextarea.value).toBe("New reason text");
  });

  test("Breadcrumb navigation works correctly", () => {
    // Override the mocked useLocation for this specific test
    jest.spyOn(require("react-router-dom"), "useLocation").mockReturnValue({
      pathname: "/approver/vetting/1",
      state: { mode: "vetting" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Find the Vetting button in the breadcrumb
    const vettingButton = screen.getByText("Vetting");

    fireEvent.click(vettingButton);
    expect(mockNavigate).toHaveBeenCalledWith("/approver/vetting");
  });

  test("Displays Not Found message when claim is null", () => {
    store = mockStore({
      claims: {
        claimDetail: null,
        loading: false,
        error: null,
      },
      comment: {
        comments: [],
        loadingComment: false,
        errorComment: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Claim Not Found")).toBeInTheDocument();
  });

  test("Handles comment submission correctly", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    // Type a comment
    const commentTextArea = screen.getByPlaceholderText("Type your comment...");
    fireEvent.change(commentTextArea, { target: { value: "New comment" } });

    // Click the send button
    const sendButton = screen.getByText("Send");
    fireEvent.click(sendButton);

    // Check that createCommentRequest was called with the right params
    expect(createCommentRequest).toHaveBeenCalledWith({
      content: "New comment",
      claim_id: "1",
    });
  });

  test("Handles comment loading state correctly", () => {
    store = mockStore({
      claims: {
        claimDetail: {
          _id: "1",
          user: {
            user_name: "John Doe",
            avatar: null,
          },
          project: {
            project_name: "Project X",
          },
          status: { name: "Pending" },
        },
        loading: false,
        error: null,
      },
      comment: {
        comments: [],
        loadingComment: true,
        errorComment: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Detail />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Loading comments...")).toBeInTheDocument();
  });
});
