import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { MESSAGES } from "./string";

// Mock các dependencies
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Tạo mock cho useNavigate
const mockNavigate = jest.fn();

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
  });

  // Test case 1: Render component đúng
  test("renders forgot password page correctly", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Kiểm tra tiêu đề
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();

    // Kiểm tra form và các phần tử input
    expect(screen.getByLabelText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Code" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to Login" })
    ).toBeInTheDocument();
  });

  // Test case 2: Hiển thị lỗi khi email không hợp lệ
  // test("shows error message for invalid email", async () => {
  //   render(
  //     <MemoryRouter>
  //       <ForgotPasswordPage />
  //     </MemoryRouter>
  //   );

  //   // Nhập email không hợp lệ
  //   fireEvent.change(screen.getByLabelText("Enter your email"), {
  //     target: { value: "invalid-email" },
  //   });

  //   // Click button Send Code
  //   fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

  //   // Kiểm tra hiển thị thông báo lỗi
  //   // expect(
  //   //   screen.getByText(MESSAGES.PLEASE_ENTER_VALID_EMAIL)
  //   // ).toBeInTheDocument();

  //   // Kiểm tra hiển thị thông báo lỗi bằng cách dùng findByText
  //     await waitFor(() => {
  //     const errorMessage = screen.getByText(MESSAGES.PLEASE_ENTER_VALID_EMAIL);
  //     expect(errorMessage).toBeInTheDocument();
  //   });

  //   // Kiểm tra không có call API
  //   expect(axios.post).not.toHaveBeenCalled();
  // });

  test("disables send code button for invalid email input", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Lấy input email và nút Send Code
    const emailInput = screen.getByLabelText("Enter your email");
    const sendCodeButton = screen.getByRole("button", { name: "Send Code" });

    // Kiểm tra trạng thái ban đầu của nút
    expect(sendCodeButton).toBeDisabled();

    // Nhập email không hợp lệ
    fireEvent.change(emailInput, {
      target: { value: "invalid-email" },
    });

    // Kiểm tra nút vẫn bị disabled
    expect(sendCodeButton).toBeDisabled();

    // Nhập email hợp lệ
    fireEvent.change(emailInput, {
      target: { value: "valid.email@example.com" },
    });

    // Kiểm tra nút được enable
    expect(sendCodeButton).not.toBeDisabled();
  });

  // Test case 3: Xử lý thành công khi gửi email
  test("successfully sends verification code and navigates to verify page", async () => {
    // Mock API response
    axios.post.mockResolvedValueOnce({
      data: { status: "OK", message: "Verification code sent" },
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Nhập email hợp lệ
    fireEvent.change(screen.getByLabelText("Enter your email"), {
      target: { value: "test@example.com" },
    });

    // Click button Send Code
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    // Kiểm tra gọi API với đúng tham số
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://ojtbe-production.up.railway.app/api/auth/forgot-password",
        { email: "test@example.com" }
      );
    });

    // Kiểm tra hiển thị toast thành công
    expect(toast.success).toHaveBeenCalledWith(
      "Verification code sent successfully!"
    );

    // Kiểm tra chuyển hướng tới trang xác thực
    expect(mockNavigate).toHaveBeenCalledWith(
      "/verify-code?email=test@example.com"
    );
  });

  // Test case 4: Xử lý khi API trả về lỗi
  test("handles API error response", async () => {
    // Mock API response với lỗi
    axios.post.mockResolvedValueOnce({
      data: { status: "ERROR", message: "User not found" },
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Nhập email hợp lệ
    fireEvent.change(screen.getByLabelText("Enter your email"), {
      target: { value: "unknown@example.com" },
    });

    // Click button Send Code
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    // Kiểm tra hiển thị thông báo lỗi từ API
    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });

    // Kiểm tra không chuyển hướng
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test case 5: Xử lý khi API gọi thất bại
  test("handles API call failure", async () => {
    // Mock API throw error
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Nhập email hợp lệ
    fireEvent.change(screen.getByLabelText("Enter your email"), {
      target: { value: "test@example.com" },
    });

    // Click button Send Code
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    // Kiểm tra hiển thị thông báo lỗi mặc định
    await waitFor(() => {
      expect(
        screen.getByText(
          "There was an error sending the verification code. Please try again."
        )
      ).toBeInTheDocument();
    });

    // Kiểm tra không chuyển hướng
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
