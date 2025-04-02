import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import VerifyCodePage from "./VerifyCodePage";
import {
  verifyCodeRequest,
  resetVerificationCodeState,
} from "../../../redux/actions/verifyCodeActions";
import { MESSAGES } from "./string";
import { validateVerificationCode, validatePassword } from "./utils";

jest.mock("../../../redux/actions/verifyCodeActions", () => ({
  resetVerificationCodeState: jest.fn(() => ({
    type: "RESET_VERIFICATION_CODE_STATE",
  })),
  verifyCodeRequest: jest.fn(() => ({ type: "VERIFY_CODE_REQUEST" })),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    search: "?email=test@example.com",
  }),
}));

jest.mock("./utils", () => ({
  validateVerificationCode: jest.fn(),
  validatePassword: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("./string", () => ({
  MESSAGES: {
    PLEASE_WAIT_TEXT: "Please wait...",
    SUBMIT_BUTTON_TEXT: "SUBMIT",
  },
}));

const mockStore = configureStore([]);

describe("VerifyCodePage Component", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();

    store = mockStore({
      verifyCode: {
        isLoading: false,
        isCodeVerified: false,
        redirectToLoginFlag: false,
        error: null,
      },
    });

    validateVerificationCode.mockImplementation(() => "");
    validatePassword.mockImplementation(() => "");
  });

  it("renders the verification form correctly", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("VERIFICATION")).toBeInTheDocument();
    expect(screen.getByText("Enter Verification Code")).toBeInTheDocument();
    expect(screen.getByText("New password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter the verification code")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your new password")
    ).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.SUBMIT_BUTTON_TEXT)).toBeInTheDocument();
  });

  it("disables submit button when fields are empty", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    const submitButton = screen.getByText(MESSAGES.SUBMIT_BUTTON_TEXT);
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("bg-gray-400");
    expect(submitButton).toHaveClass("cursor-not-allowed");
  });

  it("enables submit button when all fields are filled", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter the verification code"),
      {
        target: { value: "123456" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
      target: { value: "NewPassword123!" },
    });

    const submitButton = screen.getByText(MESSAGES.SUBMIT_BUTTON_TEXT);
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass("bg-blue-500");
    expect(submitButton).not.toHaveClass("cursor-not-allowed");
  });

  it("shows loading state when isLoading is true", () => {
    store = mockStore({
      verifyCode: {
        isLoading: true,
        isCodeVerified: false,
        redirectToLoginFlag: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(MESSAGES.PLEASE_WAIT_TEXT)).toBeInTheDocument();
  });

  it("dispatches verifyCodeRequest when form is submitted with valid inputs", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter the verification code"),
      {
        target: { value: "123456" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.submit(screen.getByRole("button"));

    expect(verifyCodeRequest).toHaveBeenCalledWith({
      email: "test@example.com",
      verificationCode: "123456",
      password: "NewPassword123!",
    });
  });

  it("shows error message when verification code validation fails", () => {
    validateVerificationCode.mockImplementation(
      () => "Verification code must be 6 digits"
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter the verification code"),
      {
        target: { value: "123" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.submit(screen.getByRole("button"));

    expect(
      screen.getByText("Verification code must be 6 digits")
    ).toBeInTheDocument();

    expect(verifyCodeRequest).not.toHaveBeenCalled();
  });

  it("shows error message when password validation fails", () => {
    validatePassword.mockImplementation(
      () => "Password must contain at least 8 characters"
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter the verification code"),
      {
        target: { value: "123456" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
      target: { value: "weak" },
    });

    fireEvent.submit(screen.getByRole("button"));

    expect(
      screen.getByText("Password must contain at least 8 characters")
    ).toBeInTheDocument();

    expect(verifyCodeRequest).not.toHaveBeenCalled();
  });

  it("displays toast error when API returns an error", () => {
    store = mockStore({
      verifyCode: {
        isLoading: false,
        isCodeVerified: false,
        redirectToLoginFlag: false,
        error: { verificationCode: "Invalid verification code" },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    expect(require("react-toastify").toast.error).toHaveBeenCalledWith(
      "Invalid verification code",
      { autoClose: 8000 }
    );
  });

  it("redirects to login page when code is verified", async () => {
    jest.useFakeTimers();

    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    store = mockStore({
      verifyCode: {
        isLoading: false,
        isCodeVerified: true,
        redirectToLoginFlag: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    jest.advanceTimersByTime(3000);

    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });

  it("redirects to login page when redirectToLoginFlag is true", async () => {
    jest.useFakeTimers();

    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    store = mockStore({
      verifyCode: {
        isLoading: false,
        isCodeVerified: false,
        redirectToLoginFlag: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    jest.advanceTimersByTime(3000);

    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });

  it("dispatches resetVerificationCodeState on component mount", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    expect(resetVerificationCodeState).toHaveBeenCalled();
  });

  it("extracts email from URL query parameters", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VerifyCodePage />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = document.getElementById("email");
    expect(emailInput.value).toBe("test@example.com");
  });
});
