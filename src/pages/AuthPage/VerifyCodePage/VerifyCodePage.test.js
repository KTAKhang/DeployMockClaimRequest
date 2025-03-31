import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VerifyCodePage from "./VerifyCodePage"; // Đảm bảo đường dẫn này chính xác
import axios from "axios";
import { toast } from "react-toastify";
import { MESSAGES } from "./string";
import { API_URL } from "./const";

// Mock các phần phụ thuộc
jest.mock('axios');
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Khai báo mockNavigate
const mockNavigate = jest.fn();

// Điều chỉnh mock của react-router-dom để sử dụng mockNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Gán mockNavigate ở đây
  useLocation: () => ({
    search: "?email=test@example.com"
  })
}));

// const renderWithRouter = () =>
//   render(
//     <Router>
//       <VerifyCodePage />
//     </Router>
//   );
describe("VerifyCodePage", () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  const renderComponent = (
    initialEntries = ["/verify-code?email=test@example.com"]
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <VerifyCodePage />
      </MemoryRouter>
    );
  };
  test("renders verify code page with email from URL", () => {
    // Mô phỏng URL có email
    window.history.pushState(
      {},
      "Test page",
      "/verify-code?email=test@example.com"
    );

    renderComponent();

    // Kiểm tra nếu email có trên form
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  test("displays validation errors when OTP is invalid", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nhập Mã Xác Minh/i), {
      target: { value: "123" }, // OTP không hợp lệ
    });

    fireEvent.change(screen.getByLabelText(/Mật Khẩu Mới/i), {
      target: { value: "NewPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    await waitFor(() => {
      expect(screen.getByText(MESSAGES.INVALID_OTP)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("displays validation errors when password is invalid", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nhập Mã Xác Minh/i), {
      target: { value: "123456" }, // OTP hợp lệ
    });

    fireEvent.change(screen.getByLabelText(/Mật Khẩu Mới/i), {
      target: { value: "short" }, // Mật khẩu không hợp lệ
    });

    // fireEvent.click(
    //   screen.getByRole("button", { name: MESSAGES.SUBMIT_BUTTON_TEXT })
    // );
    const submitButton = screen.getByRole("button", {
      name: /Gửi/i, // Đảm bảo tên khớp với giá trị trong MESSAGES
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(MESSAGES.INVALID_PASSWORD)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("displays success message and redirects when password reset is successful", async () => {
    // Mock API response thành công
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderComponent();

    // Nhập giá trị hợp lệ
    fireEvent.change(screen.getByLabelText(/Nhập Mã Xác Minh/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/Mật Khẩu Mới/i), {
      target: { value: "NewPass123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    // Kiểm tra nếu API đã được gọi đúng với dữ liệu
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(API_URL, {
        email: "test@example.com",
        otp: "123456",
        newPassword: "NewPass123",
      });
    });

    // Kiểm tra thông báo thành công
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        MESSAGES.PASSWORD_RESET_SUCCESS,
        { autoClose: 8000 }
      );
    });

    // Chạy setTimeout ngay lập tức
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Kiểm tra chuyển hướng - đã sửa lại đúng cú pháp
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("displays error message when API call fails", async () => {
    // Mock API lỗi
    axios.post.mockRejectedValueOnce(new Error("API Error"));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nhập Mã Xác Minh/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/Mật Khẩu Mới/i), {
      target: { value: "NewPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Bạn đã nhập sai mã OTP. Vui lòng thử lại./i)
      ).toBeInTheDocument();
    });
  });
});
