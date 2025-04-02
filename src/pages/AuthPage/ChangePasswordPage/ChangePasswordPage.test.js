import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ChangePasswordPage from "./ChangePasswordPage";
import { changePasswordRequest } from "../../../redux/actions/changePasswordActions";
import { MESSAGES } from "./string";
import { validatePassword } from "./utils";

jest.mock("../../../redux/actions/changePasswordActions", () => ({
  changePasswordRequest: jest.fn(() => ({ type: "CHANGE_PASSWORD_REQUEST" })),
}));

jest.mock("./utils", () => ({
  validatePassword: jest.fn(),
}));

jest.mock("./string", () => ({
  MESSAGES: {
    PASSWORD_VALIDATION:
      "Password must contain at least 8 characters, including uppercase and number",
    CANCEL: "CANCEL",
  },
}));

const mockStore = configureStore([]);

describe("ChangePasswordPage Component", () => {
  let store;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    store = mockStore({
      changePassword: {
        isLoading: false,
        successMessage: "",
        errorMessage: "",
      },
    });

    validatePassword.mockImplementation(() => true);
  });

  it("renders the change password form correctly", () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    expect(screen.getByText("Change Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/OLD PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByTestId("new-password-input")).toBeInTheDocument();
    expect(screen.getByLabelText(/CONFIRM NEW PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByText("CONTINUE")).toBeInTheDocument();
    expect(screen.getByText("CANCEL")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.click(screen.getByText("CANCEL"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("disables continue button when new password is empty", () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    const continueButton = screen.getByText("CONTINUE");
    expect(continueButton).toHaveClass("bg-gray-400");
    expect(continueButton).toHaveClass("cursor-not-allowed");
  });

  it("enables continue button when new password is entered", () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "NewPassword123!" },
    });

    const continueButton = screen.getByText("CONTINUE");
    expect(continueButton).toHaveClass("bg-blue-500");
    expect(continueButton).not.toHaveClass("cursor-not-allowed");
  });

  it("shows loading state when isLoading is true", () => {
    store = mockStore({
      changePassword: {
        isLoading: true,
        successMessage: "",
        errorMessage: "",
      },
    });

    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    expect(screen.getByText("In Progress...")).toBeInTheDocument();
  });

  it("dispatches changePasswordRequest when form is submitted with valid inputs", async () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("old-password-input"), {
      target: { value: "OldPassword123!" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "NewPassword123!" },
    });
    fireEvent.change(screen.getByTestId("confirm-password-input"), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.submit(screen.getByTestId("change-password-form"));

    expect(changePasswordRequest).toHaveBeenCalledWith(
      "OldPassword123!",
      "NewPassword123!"
    );
  });

  it("shows error message when password validation fails", async () => {
    validatePassword.mockImplementation(() => false);

    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("old-password-input"), {
      target: { value: "OldPassword123!" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "weak" },
    });
    fireEvent.change(screen.getByTestId("confirm-password-input"), {
      target: { value: "weak" },
    });

    fireEvent.submit(screen.getByTestId("change-password-form"));

    expect(screen.getByText(MESSAGES.PASSWORD_VALIDATION)).toBeInTheDocument();

    expect(changePasswordRequest).not.toHaveBeenCalled();
  });

  it("shows error message when passwords do not match", async () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("old-password-input"), {
      target: { value: "OldPassword123!" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "NewPassword123!" },
    });
    fireEvent.change(screen.getByTestId("confirm-password-input"), {
      target: { value: "DifferentPassword123!" },
    });

    fireEvent.submit(screen.getByTestId("change-password-form"));

    expect(
      screen.getByText("Incorrect confirm password, Please try again")
    ).toBeInTheDocument();

    expect(changePasswordRequest).not.toHaveBeenCalled();
  });

  it("shows error message when old password is empty", async () => {
    render(
      <Provider store={store}>
        <ChangePasswordPage onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "NewPassword123!" },
    });
    fireEvent.change(screen.getByTestId("confirm-password-input"), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.submit(screen.getByTestId("change-password-form"));

    expect(
      screen.getByText("Please enter your old password")
    ).toBeInTheDocument();

    expect(changePasswordRequest).not.toHaveBeenCalled();
  });
});
