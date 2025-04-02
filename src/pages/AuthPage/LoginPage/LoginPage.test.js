import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { loginRequest } from "../../../redux/actions/authActions";
import { MESSAGES } from "./string";
import { validateForm, handleRememberMeChange } from "./utils";
import { ROLE_REDIRECTS } from "./const";
import { toast } from "react-toastify";

jest.mock("../../../redux/actions/authActions", () => ({
  loginRequest: jest.fn(() => ({ type: "LOGIN_REQUEST" })),
}));

jest.mock("./utils", () => ({
  validateForm: jest.fn(),
  handleRememberMeChange: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock("./const", () => ({
  BACKGROUND_IMAGE_URL: "test-background-url.jpg",
  ROLE_REDIRECTS: {
    ADMIN: "/admin",
    USER: "/dashboard",
  },
}));

jest.mock("./string", () => ({
  MESSAGES: {
    SIGN_IN: "SIGN IN",
    SIGNING_IN: "SIGNING IN...",
    FORGOT_PASSWORD: "Forgot Password?",
    PLEASE_ENTER_ACCOUNT: "Please enter your email and password",
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockStore = configureStore([]);

describe("LoginPage Component", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    store = mockStore({
      auth: {
        loading: false,
        error: null,
        token: null,
        role: null,
      },
    });

    validateForm.mockImplementation(() => false);
  });

  it("clears all toasts when component mounts", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(toast.dismiss).toHaveBeenCalled();
  });

  it("disables login button when form is invalid", () => {
    validateForm.mockImplementation(() => false);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const loginButton = screen.getByRole("button", { name: MESSAGES.SIGN_IN });
    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveClass("bg-gray-400");
    expect(loginButton).toHaveClass("cursor-not-allowed");
  });

  it("enables login button when form is valid", () => {
    validateForm.mockImplementation(() => true);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const loginButton = screen.getByRole("button", { name: MESSAGES.SIGN_IN });
    expect(loginButton).not.toBeDisabled();
    expect(loginButton).toHaveClass("bg-blue-500");
    expect(loginButton).not.toHaveClass("cursor-not-allowed");
  });

  it("shows loading state when loading is true", () => {
    validateForm.mockImplementation(() => true);

    store = mockStore({
      auth: {
        loading: true,
        error: null,
        token: null,
        role: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(MESSAGES.SIGNING_IN)).toBeInTheDocument();
  });

  it("dispatches loginRequest when form is submitted with valid inputs", () => {
    validateForm.mockImplementation(() => true);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: MESSAGES.SIGN_IN }));

    expect(loginRequest).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows error toast when form is submitted with invalid inputs", () => {
    validateForm.mockImplementation(() => false);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.submit(screen.getByRole("button", { name: MESSAGES.SIGN_IN }));

    expect(toast.error).toHaveBeenCalledWith(MESSAGES.PLEASE_ENTER_ACCOUNT);

    expect(loginRequest).not.toHaveBeenCalled();
  });

  it("displays error message when authentication fails", () => {
    store = mockStore({
      auth: {
        loading: false,
        error: "Invalid credentials",
        token: null,
        role: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("navigates to forgot password page when forgot password button is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText(MESSAGES.FORGOT_PASSWORD));

    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("handles remember me checkbox change", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByLabelText(/Remember me/i));

    expect(handleRememberMeChange).toHaveBeenCalled();
  });

  it("redirects when token is available", () => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        token: { access_token: "test-token" },
        role: "USER",
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "accessToken",
      "test-token"
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith("role", "USER");

    expect(mockNavigate).toHaveBeenCalledWith(ROLE_REDIRECTS.USER);
  });

  it("redirects to login if role is not found in ROLE_REDIRECTS", () => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        token: { access_token: "test-token" },
        role: "UNKNOWN_ROLE",
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("returns null when token is available", () => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        token: { access_token: "test-token" },
        role: "USER",
      },
    });

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });
});
