import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import VerifyCodePage from "./VerifyCodePage"; // Đảm bảo đường dẫn này chính xác
import axios from "axios";
import { toast } from "react-toastify";
import userEvent from "@testing-library/user-event";

// Mock các phần phụ thuộc
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = () =>
  render(
    <Router>
      <VerifyCodePage />
    </Router>
  );

describe("VerifyCodePage", () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
  });

  test("renders verify code page with email from URL", () => {
    // Mô phỏng URL có email
    window.history.pushState(
      {},
      "Test page",
      "/verify-code?email=test@example.com"
    );

    renderWithRouter();

    // Kiểm tra nếu email có trên form
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  test("displays validation errors when OTP is invalid", async () => {
    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), {
      target: { value: "123" }, // OTP không hợp lệ
    });

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "NewPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid OTP. Please enter a 6-digit OTP./i)
      ).toBeInTheDocument();
    });
  });

  test("displays validation errors when password is invalid", async () => {
    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), {
      target: { value: "123456" }, // OTP hợp lệ
    });

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "short" }, // Mật khẩu không hợp lệ
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Password must contain at least 8 characters, including uppercase and a number./i
        )
      ).toBeInTheDocument();
    });
  });

  test("displays success message and redirects when password reset is successful", async () => {
    // Mock API response thành công
    axios.post.mockResolvedValueOnce({
      data: { status: "OK", message: "Password reset successfully" },
    });

    renderWithRouter();

    // Nhập giá trị hợp lệ
    fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "NewPass123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    // Kiểm tra nếu API đã được gọi đúng với dữ liệu
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://ojtbe-production.up.railway.app/api/auth/reset-password",
        {
          email: "test@example.com",
          otp: "123456",
          newPassword: "NewPass123",
        }
      );
    });

    // Kiểm tra thông báo thành công
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Password has been successfully reset!",
        { autoClose: 8000 }
      );
    });

    // Kiểm tra chuyển hướng
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("displays error message when API call fails", async () => {
    // Mock API lỗi
    axios.post.mockRejectedValueOnce(new Error("API Error"));

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "NewPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/You entered the wrong OTP code. Please try again./i)
      ).toBeInTheDocument();
    });
  });
});
