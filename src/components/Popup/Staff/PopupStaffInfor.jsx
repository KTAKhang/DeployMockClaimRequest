import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSave,
  FaTimes,
  FaUserAlt,
  FaBriefcase,
  FaExclamationCircle,
} from "react-icons/fa";
import { addStaff } from "../../../redux/actions/staffActions";
import { toast } from "react-toastify";

export default function PopupStaffInfor({ onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.staff);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState("");

  const [form, setForm] = useState({
    user_name: "",
    role: "",
    department: "",
    job_rank: "",
    salary: 0,
    email: "",
    password: "",
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
      !/^[A-ZÀ-Ỹ][a-zà-ỹ]+(\s[A-ZÀ-Ỹ][a-zà-ỹ]+)+$/.test(form.user_name)
    ) {
      newErrors.user_name =
        "User name must have at least two words, each starting with a capital letter.";
    }

    if (!form.role) newErrors.role = "Role is required.";
    if (!form.department) newErrors.department = "Department is required.";
    if (!form.job_rank) newErrors.job_rank = "Job rank is required.";
    if (form.salary <= 0)
      newErrors.salary = "Salary must be greater than zero.";

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "number" ? Number(value) || 0 : value,
    }));

    // Clear error when user changes the value
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const openModal = (type) => {
    // Validate form before opening modal
    if (!validateForm()) {
      return;
    }

    setActionType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Modify handleConfirm function
  const handleConfirm = () => {
    const formattedData = {
      ...form,
      user_name: formatUserName(form.user_name),
    };

    setIsSubmitting(true); // Use local state to show loading
    console.log("📤 Sending data to API:", formattedData);

    // Show toast notification for adding staff
    toast.info("Adding staff member...", {
      position: "top-right",
      autoClose: 2000,
    });

    dispatch(addStaff(formattedData));

    // Close the modal
    closeModal();

    // Check for success after a delay
    setTimeout(() => {
      if (!error) {
        toast.success("Staff added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Close the form after showing success message
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        toast.error(error, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      setIsSubmitting(false); // Turn off local loading state
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      {/* Main container */}
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Add New Staff</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content area with specific max height to ensure action buttons remain visible */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(80vh - 130px)" }}
        >
          {/* Basic Information */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserAlt className="mr-2 text-blue-600" />
              Personal Information
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
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                  errors.password
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200"
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-blue-600" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${
                    errors.role
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
                {errors.role && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Salary ($) <span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center"
            onClick={onClose}
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center"
            onClick={() => openModal("Add")}
            disabled={isSubmitting}
          >
            <FaSave className="mr-2" />{" "}
            {isSubmitting ? "Adding..." : "Add Staff"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm {actionType}</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to add this staff member?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">
              Adding staff...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
