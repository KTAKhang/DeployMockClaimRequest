import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import ForgotPasswordPage from "./ForgotPasswordPage";
import configureMockStore from "redux-mock-store";
import { MESSAGES } from "./string";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

import { useNavigate } from "react-router-dom";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockStore = configureMockStore();
let store;

describe("ForgotPasswordPage", () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    store = mockStore({
      forgotPassword: {
        isVerificationSent: false,
        errorMessage: "",
        isLoading: false,
      },
    });

    useNavigate.mockReturnValue(navigateMock);
  });

  test("renders the forgot password form correctly", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByLabelText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to login/i)).toBeInTheDocument();
  });

  test("disables submit button when email is invalid", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "invalid-email" },
    });
    expect(screen.getByRole("button", { name: /Send Code/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "test@example.com" },
    });
    expect(screen.getByRole("button", { name: /Send Code/i })).toBeEnabled();
  });

  test("displays success message when verification code is sent", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Code/i }));

    expect(screen.getByText(/Go to login/i)).toBeInTheDocument();
  });

  test("navigates to login page when 'Go to login' is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Code/i }));

    const goToLoginButton = screen.getByText(/Go to login/i);

    fireEvent.click(goToLoginButton);

    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
