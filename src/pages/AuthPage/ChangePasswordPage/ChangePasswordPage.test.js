import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { toast } from "react-toastify";
import ChangePasswordPage from "./ChangePasswordPage";

const mockOnClose = jest.fn();
// Mock các dependencies
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = { token: "fake-token" };
  return {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("ChangePasswordPage", () => {
  // Mock function cho onClose prop
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
  });

  // Test case 1: Render component đúng
  test("renders change password page correctly", () => {
    render(<ChangePasswordPage onClose={mockOnClose} />);

    // Kiểm tra tiêu đề
    expect(screen.getByText("Change Password")).toBeInTheDocument();

    // Kiểm tra form và các phần tử input
    expect(screen.getByLabelText("OLD PASSWORD")).toBeInTheDocument();
    expect(screen.getByLabelText("NEW PASSWORD")).toBeInTheDocument();
    expect(screen.getByLabelText("CONFIRM NEW PASSWORD")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CONTINUE" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    // Kiểm tra trạng thái nút CONTINUE ban đầu (disabled)
    expect(screen.getByRole("button", { name: "CONTINUE" })).toBeDisabled();
  });

  // Test case 2: Hiển thị lỗi khi mật khẩu xác nhận không khớp
  test("shows error when passwords do not match", async () => {
    render(<ChangePasswordPage onClose={mockOnClose} />);

    // Nhập mật khẩu cũ hợp lệ
    fireEvent.change(screen.getByLabelText("OLD PASSWORD"), {
      target: { value: "OldPass123" },
    });

    // Nhập mật khẩu mới hợp lệ
    fireEvent.change(screen.getByLabelText("NEW PASSWORD"), {
      target: { value: "NewPass123" },
    });

    // Nhập mật khẩu xác nhận không khớp
    fireEvent.change(screen.getByLabelText("CONFIRM NEW PASSWORD"), {
      target: { value: "DifferentPass123" },
    });

    // Kiểm tra rằng nút CONTINUE vẫn bị disabled
    expect(screen.getByRole("button", { name: "CONTINUE" })).toBeDisabled();

    // Gọi submit form mặc dù nút CONTINUE bị disabled
    const form = screen.getByRole("form"); // Sử dụng đúng cách để lấy form
    fireEvent.submit(form);

    // Kiểm tra thông báo lỗi "Mật khẩu xác nhận không khớp" xuất hiện
    await waitFor(() => {
      expect(
        screen.getByText("Mật khẩu xác nhận không khớp")
      ).toBeInTheDocument();
    });

    // Kiểm tra không có cuộc gọi API
    expect(axios.put).not.toHaveBeenCalled();
  });
  // Test case 3: Hiển thị lỗi khi mật khẩu mới không hợp lệ
  test("shows error when new password is invalid", async () => {
    render(<ChangePasswordPage onClose={mockOnClose} />);

    // Nhập mật khẩu cũ
    fireEvent.change(screen.getByLabelText("OLD PASSWORD"), {
      target: { value: "OldPass123" },
    });

    // Nhập mật khẩu mới không hợp lệ (không có chữ hoa)
    fireEvent.change(screen.getByLabelText("NEW PASSWORD"), {
      target: { value: "newpass123" },
    });

    // Nhập mật khẩu xác nhận giống mật khẩu mới
    fireEvent.change(screen.getByLabelText("CONFIRM NEW PASSWORD"), {
      target: { value: "newpass123" },
    });

    // Submit form
    const form = screen
      .getByRole("button", { name: "CONTINUE" })
      .closest("form");
    fireEvent.submit(form);

    // Kiểm tra hiển thị thông báo lỗi
    expect(
      screen.getByText(
        "Password must contain at least 8 characters, including uppercase and number"
      )
    ).toBeInTheDocument();

    // Kiểm tra không có call API
    expect(axios.put).not.toHaveBeenCalled();
  });

  // Test case 4: Hiển thị lỗi khi mật khẩu cũ không chính xác
  test("shows error when old password is incorrect", async () => {
    // Mock API response cho mật khẩu cũ không đúng
    axios.put.mockResolvedValueOnce({
      status: 200,
      data: {
        status: "ERR",
        message: "Old password is incorrect",
      },
    });

    render(<ChangePasswordPage onClose={mockOnClose} />);

    // Nhập mật khẩu cũ
    fireEvent.change(screen.getByLabelText("OLD PASSWORD"), {
      target: { value: "WrongOldPass1" },
    });

    // Nhập mật khẩu mới hợp lệ
    fireEvent.change(screen.getByLabelText("NEW PASSWORD"), {
      target: { value: "NewPass123" },
    });

    // Nhập mật khẩu xác nhận giống mật khẩu mới
    fireEvent.change(screen.getByLabelText("CONFIRM NEW PASSWORD"), {
      target: { value: "NewPass123" },
    });

    // Bây giờ nút CONTINUE được kích hoạt
    expect(screen.getByRole("button", { name: "CONTINUE" })).toBeEnabled();

    // Click nút CONTINUE
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

    // Kiểm tra gọi API với đúng tham số
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "https://ojtbe-production.up.railway.app/api/user/change-password",
        {
          old_password: "WrongOldPass1",
          new_password: "NewPass123",
        },
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );
    });

    // Kiểm tra hiển thị thông báo lỗi về mật khẩu cũ
    await waitFor(() => {
      expect(
        screen.getByText("Mật khẩu cũ không chính xác.")
      ).toBeInTheDocument();
    });

    // Kiểm tra không đóng popup
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Test case 5: Thay đổi mật khẩu thành công
  test("successfully changes password", async () => {
    // Mock API response cho thay đổi mật khẩu thành công
    axios.put.mockResolvedValueOnce({
      status: 200,
      data: {
        status: "OK",
        message: "Change password success",
      },
    });

    render(<ChangePasswordPage onClose={mockOnClose} />);

    // Nhập mật khẩu cũ
    fireEvent.change(screen.getByLabelText("OLD PASSWORD"), {
      target: { value: "CorrectOldPass1" },
    });

    // Nhập mật khẩu mới hợp lệ
    fireEvent.change(screen.getByLabelText("NEW PASSWORD"), {
      target: { value: "NewPass123" },
    });

    // Nhập mật khẩu xác nhận giống mật khẩu mới
    fireEvent.change(screen.getByLabelText("CONFIRM NEW PASSWORD"), {
      target: { value: "NewPass123" },
    });

    // Click nút CONTINUE
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

    // Kiểm tra gọi API với đúng tham số
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "https://ojtbe-production.up.railway.app/api/user/change-password",
        {
          old_password: "CorrectOldPass1",
          new_password: "NewPass123",
        },
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );
    });

    // Kiểm tra hiển thị toast thành công
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Password has been successfully changed!"
      );
    });

    // Kiểm tra đóng popup
    expect(mockOnClose).toHaveBeenCalled();
  });
});
