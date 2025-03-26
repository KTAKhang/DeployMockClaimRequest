import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";
import ClaimModal from "../../../pages/ClaimerPage/ClaimModal/ClaimModal";
import {
  updateClaimRequest,
  resetUpdateState,
} from "../../../redux/actions/claimerActions";

const UpdateClaimForm = ({ initialData, onClose, onSubmit, claimId }) => {
  const dispatch = useDispatch();
  const { updateClaimLoading, updateClaimError, updateClaimSuccess } =
    useSelector((state) => state.claimer);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Manage validation errors
  const [errors, setErrors] = useState({
    from_date: "",
    to_date: "",
    totalNoOfHours: "",
    reason_claimer: "",
  });

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUpdateState());
    };
  }, [dispatch]);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`,
    };
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return "";
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const [formData, setFormData] = useState({
    staffName: initialData.staffName || "",
    projectName: initialData.projectName || "",
    date: getCurrentDate().date,
    time: getCurrentDate().time,
    day: getDayOfWeek(getCurrentDate().date),
    from_date: initialData.from_date || "",
    to_date: initialData.to_date || "",
    from_time: "09:00",
    to_time: "17:00",
    totalNoOfHours: initialData.totalHours || "",
    reason_claimer: initialData.reason || "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentDateTime = getCurrentDate();
      setFormData((prev) => ({
        ...prev,
        date: currentDateTime.date,
        time: currentDateTime.time,
        day: getDayOfWeek(currentDateTime.date),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle successful update
  useEffect(() => {
    if (updateClaimSuccess) {
      setNotification({
        message: "Claim updated successfully!",
        type: "success",
      });

      // Delay form closing
      const timer = setTimeout(() => {
        onSubmit(formData);
        onClose();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [updateClaimSuccess]);

  // Handle errors
  useEffect(() => {
    if (updateClaimError) {
      setNotification({
        message: updateClaimError,
        type: "error",
      });
    }
  }, [updateClaimError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user changes the value
    setErrors((prev) => ({
      ...prev,
      [field]: "",
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

  const validateForm = () => {
    const newErrors = {
      from_date: "",
      to_date: "",
      totalNoOfHours: "",
      reason_claimer: "",
    };

    let isValid = true;

    // Check from_date
    if (!formData.from_date) {
      newErrors.from_date = "Start date is required";
      isValid = false;
    }

    // Check to_date
    if (!formData.to_date) {
      newErrors.to_date = "End date is required";
      isValid = false;
    } else if (
      formData.from_date &&
      new Date(formData.from_date) > new Date(formData.to_date)
    ) {
      newErrors.to_date = "End date must be after start date";
      isValid = false;
    }

    // Check totalNoOfHours
    if (!formData.totalNoOfHours) {
      newErrors.totalNoOfHours = "Total working hours is required";
      isValid = false;
    } else {
      const hours = parseFloat(formData.totalNoOfHours);
      if (isNaN(hours) || hours <= 0) {
        newErrors.totalNoOfHours =
          "Total working hours must be a positive number";
        isValid = false;
      }
    }

    // Check reason_claimer
    if (!formData.reason_claimer) {
      newErrors.reason_claimer = "Reason is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = () => {
    const formattedData = {
      date: formData.date,
      from: formData.from_date,
      to: formData.to_date,
      total_no_of_hours: parseFloat(formData.totalNoOfHours),
      project_id: initialData.projectId,
      project_name: formData.projectName, // Include project name in submission
      reason_claimer: formData.reason_claimer,
    };

    // Call the callback to handle the update
    onSubmit(formattedData);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white z-50 flex items-center gap-2 animate-fadeIn`}
        >
          {notification.type === "success" ? (
            <FaSave className="text-white" />
          ) : (
            <FaExclamationCircle className="text-white" />
          )}
          {notification.message}
        </div>
      )}

      {/* Modified container styling to ensure buttons are visible */}
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-4xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Update Claim</h2>
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
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Staff name
                </label>
                <input
                  type="text"
                  value={formData.staffName}
                  className="border border-gray-200 rounded-lg p-3 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Project name <span className="text-red-500">*</span>
                </label>
                {/* Changed from readOnly to allow editing */}
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleChange("projectName", e.target.value)}
                  className="border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Claim Details */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-blue-600" />
              Claim Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.date}
                    className="border border-gray-200 rounded-lg p-2 w-28 bg-gray-50 text-sm"
                    readOnly
                  />
                  <input
                    type="time"
                    value={formData.time}
                    step="1"
                    className="border border-gray-200 rounded-lg p-2 w-30 bg-gray-50 text-sm"
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <input
                  type="text"
                  value={formData.day}
                  className="border border-gray-200 rounded-lg p-3 w-full bg-gray-50 text-sm"
                  readOnly
                />
              </div>
              <div></div> {/* Empty div for grid alignment */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date from <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => handleChange("from_date", e.target.value)}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${errors.from_date
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200"
                    }`}
                  required
                />
                {errors.from_date && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.from_date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date to <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => handleChange("to_date", e.target.value)}
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${errors.to_date
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200"
                    }`}
                  required
                />
                {errors.to_date && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.to_date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Total Working Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.totalNoOfHours}
                  onChange={(e) =>
                    handleChange("totalNoOfHours", e.target.value)
                  }
                  className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${errors.totalNoOfHours
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200"
                    }`}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.totalNoOfHours && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.totalNoOfHours}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason_claimer}
                onChange={(e) => handleChange("reason_claimer", e.target.value)}
                className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm min-h-[100px] resize-none ${errors.reason_claimer
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-200"
                  }`}
                required
                placeholder="Enter your reason here..."
              />
              {errors.reason_claimer && (
                <p className="text-red-500 text-xs flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  {errors.reason_claimer}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Now in a separate flex item to ensure visibility */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center"
            onClick={onClose}
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center"
            onClick={() => openModal("Save")}
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      <ClaimModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        actionType={actionType}
      />

      {/* Loading Overlay */}
      {updateClaimLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">
              Updating claim...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateClaimForm;
