import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage"; // Đảm bảo đường dẫn chính xác đến file LoginPage
import store from "../../../redux/store"; // Đảm bảo bạn có store redux đúng

jest.mock("react-toastify", () => ({
  toast: {
    dismiss: jest.fn(),
    success: jest.fn(),
  },
}));

import { useNavigate } from "react-router-dom";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("LoginPage", () => {
  test("click on 'Forgot Password' redirects to forgot-password page", async () => {
    const navigateMock = jest.fn(); // Tạo mock cho navigate

    // Sử dụng mock navigate
    useNavigate.mockReturnValue(navigateMock);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    // Tìm nút "Forgot Password" và mô phỏng click vào đó
    const forgotPasswordButton = screen.getByText(/forgot password/i);

    // Click vào nút "Forgot Password"
    fireEvent.click(forgotPasswordButton);

    // Kiểm tra xem navigate có được gọi với đường dẫn đúng không
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/forgot-password");
    });
  });

  // Các test khác vẫn giữ nguyên ở đây
});

describe("LoginPage", () => {
  test("renders login form correctly", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    // Kiểm tra các phần tử trong form
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  test("submit button is disabled when form is invalid", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    // Kiểm tra khi email và password chưa nhập
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();

    // Nhập email và password nhưng không submit
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  test("shows error message when login fails", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    // Mô phỏng một lỗi từ redux
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Mô phỏng hành động dispatch loginRequest và tạo response lỗi
    await waitFor(() => {
      expect(screen.getByText(/account does not exist/i)).toBeInTheDocument(); // Xác định thông báo lỗi
    });
  });

  // test("redirects to correct page based on role", async () => {
  //   render(
  //     <Provider store={store}>
  //       <BrowserRouter>
  //         <LoginPage />
  //       </BrowserRouter>
  //     </Provider>
  //   );

  //   // Mô phỏng login thành công với token và role
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "admin@example.com" },
  //   });
  //   fireEvent.change(screen.getByLabelText(/password/i), {
  //     target: { value: "adminpassword" },
  //   });

  //   fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  //   // Giả lập action redux dispatch và response
  //   await waitFor(() => {
  //     expect(window.location.pathname).toBe("/admin");
  //   });
  // });

  test("remembers user when 'remember me' is checked", () => {
    window.confirm = jest.fn().mockReturnValue(true);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Tìm checkbox "Remember me" và click vào đó
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

    // Kiểm tra checkbox trước khi nhấp
    expect(rememberMeCheckbox).not.toBeChecked();

    // Click vào checkbox "Remember me"
    fireEvent.click(rememberMeCheckbox);

    // Kiểm tra nếu confirm đã được gọi
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure to save your account?"
    );

    // Kiểm tra nếu checkbox được đánh dấu sau khi xác nhận
    expect(rememberMeCheckbox).toBeChecked();
  });
});
