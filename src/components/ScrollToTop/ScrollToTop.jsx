import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Khi đường dẫn URL thay đổi, cuộn lên đầu trang
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Thêm hiệu ứng cuộn mượt
    });
  }, [pathname]);

  return null; // Component này không render bất kỳ nội dung nào
}

export default ScrollToTop;