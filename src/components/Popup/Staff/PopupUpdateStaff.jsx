import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateStaff } from "../../../redux/actions/staffActions";
import { toast } from "react-toastify";
import {
  FaSave,
  FaTimes,
  FaUserEdit,
  FaBuilding,
  FaExclamationCircle,
} from "react-icons/fa";

export default function PopupUpdateStaff({ staffData, onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.staff);

  // Đặt tất cả các hook ở cấp cao nhất của component
  const authUser = useSelector((state) => state.auth.user);

  // Kiểm tra quyền admin từ nhiều nguồn
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Kiểm tra từ thông tin user lấy từ useSelector
    let admin =
      authUser?.role_name === "Administrator" ||
      authUser?.role === "Administrator";

    // Nếu không tìm thấy trong Redux, kiểm tra localStorage
    if (!admin) {
      try {
        // Kiểm tra từ localStorage
        const localRole = localStorage.getItem("role");
        if (localRole === "Administrator") {
          admin = true;
        }

        // Kiểm tra từ user object trong localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role === "Administrator" ||
            user.role_name === "Administrator"
          ) {
            admin = true;
          }
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    }

    setIsAdmin(admin);
    console.log("🔑 Is admin:", admin);
  }, [authUser]);

  const [form, setForm] = useState({
    user_name: staffData?.user_name || "",
    role_name: staffData?.role_name || "",
    department: staffData?.department || "",
    job_rank: staffData?.job_rank || "",
    salary: staffData?.salary || "",
    status: staffData?.status !== undefined ? staffData.status : true,
  });

  const [errors, setErrors] = useState({});

  const roles = ["Administrator", "Claimer", "Finance", "Approver"];
  const jobRanks = [
    "Junior Developer",
    "Senior Developer",
    "Lead Developer",
    "Architect",
    "Mid-level Manager",
    "Senior Leader",
  ];
  const departments = [
    "Cybersecurity",
    "Application Management",
    "Device Management",
    "Hardware Procurement",
    "On/offboarding",
    "Chief Technology Officer",
    "IT Manager",
  ];

  const formatUserName = (name) => {
    return name
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.user_name.trim()) {
      newErrors.user_name = "User name is required.";
    } else if (
      !/^[A-ZÀ-Ỹ][a-zà-ỹ]+(\s[A-ZÀ-Ỹ][a-zà-ỹ]+)+$/.test(
        formatUserName(form.user_name)
      )
    ) {
      newErrors.user_name =
        "User name must have at least two words, each starting with a capital letter.";
    }

    if (!form.role_name) newErrors.role_name = "Role is required.";
    if (!form.department) newErrors.department = "Department is required.";
    if (!form.job_rank) newErrors.job_rank = "Job rank is required.";
    if (form.salary <= 0)
      newErrors.salary = "Salary must be greater than zero.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value) || 0
          : value,
    }));

    // Clear error when user changes the value
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleUpdate = () => {
    if (!validateForm()) return;

    const formattedData = {
      ...form,
      user_name: formatUserName(form.user_name),
    };

    // Nếu không phải admin nhưng đang cố thay đổi role
    if (!isAdmin && formattedData.role_name !== staffData.role_name) {
      toast.warning(
        "Only Administrator can change roles. Other changes will be saved."
      );
      formattedData.role_name = staffData.role_name;
    }

    console.log("📤 Updating staff with data:", formattedData);
    dispatch(updateStaff({ _id: staffData._id, ...formattedData }));

    setTimeout(() => {
      if (!error) {
        onClose(formattedData);
      }
    }, 1000);
  };

  // Show error from Redux state as toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-4xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Update Staff Information</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(80vh - 130px)" }}
        >
          {/* Basic Information */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserEdit className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="user_name"
                  value={form.user_name}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.user_name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                  required
                />
                {errors.user_name && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.user_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.salary
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                  required
                />
                {errors.salary && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.salary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaBuilding className="mr-2 text-blue-600" />
              Role Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Dropdown Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role_name"
                  value={form.role_name}
                  onChange={handleChange}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.role_name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role_name && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.role_name}
                  </p>
                )}
              </div>

              {/* Dropdown Job Rank */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Rank <span className="text-red-500">*</span>
                </label>
                <select
                  name="job_rank"
                  value={form.job_rank}
                  onChange={handleChange}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.job_rank
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Select job rank</option>
                  {jobRanks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
                {errors.job_rank && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.job_rank}
                  </p>
                )}
              </div>

              {/* Dropdown Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.department
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Status Toggle */}
            <div className="mt-4 flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="opacity-0 w-0 h-0"
                  id="status-toggle"
                />
                <label
                  htmlFor="status-toggle"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${
                    form.status ? "bg-green-500" : "bg-gray-300"
                  }`}
                  style={{
                    transition: "0.4s",
                  }}
                >
                  <span
                    className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transform ${
                      form.status ? "translate-x-6" : "translate-x-0"
                    }`}
                    style={{
                      transition: "0.4s",
                    }}
                  ></span>
                </label>
              </div>
              <span
                className={
                  form.status
                    ? "text-green-500 text-sm font-medium"
                    : "text-gray-500 text-sm font-medium"
                }
              >
                {form.status ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Update
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">
              Updating staff information...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
