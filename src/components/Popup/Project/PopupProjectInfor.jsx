import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStaffAll } from "../../../redux/actions/staffActions";
import { createProject } from "../../../redux/actions/projectActions";
import { toast } from "react-toastify";
import {
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaUsers,
  FaUserTie,
  FaExclamationCircle,
} from "react-icons/fa";

export default function PopupProjectInfo({
  initialData,
  onClose,
  onUpdate,
  onAdd,
  readOnlyFields = [],
}) {
  const dispatch = useDispatch();
  const { staffAll } = useSelector((state) => state.staff);
  const { loading: projectLoading, error: projectError } = useSelector(
    (state) => ({
      loading: state.project?.loading || false,
      error: state.project?.error || null,
    })
  );
  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Fetch staff list when component mounts
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching staff data...");
        await dispatch(getStaffAll());
      } catch (err) {
        console.error("Error fetching staff:", err);
        toast.error("Failed to load staff data", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [dispatch]);

  // Update staffList when Redux state changes
  useEffect(() => {
    if (staffAll?.data) {
      setStaffList(staffAll.data);
    }
  }, [staffAll]);

  const [form, setForm] = useState(
    initialData || {
      _id: "",
      project_name: "",
      duration: {
        from: "",
        to: "",
      },
      pm: "",
      qa: "",
      technical_lead: [],
      ba: [],
      developers: [],
      testers: [],
      technical_consultancy: [],
    }
  );

  // Add useEffect to properly format initialData when it changes
  useEffect(() => {
    if (initialData) {
      // Create a formatted version of initialData
      const formattedData = {
        _id: initialData._id || "",
        project_name: initialData.project_name || "",
        duration: {
          from: initialData.duration?.from
            ? initialData.duration.from.split("T")[0]
            : "",
          to: initialData.duration?.to
            ? initialData.duration.to.split("T")[0]
            : "",
        },
        // Handle staff fields - convert objects to IDs if needed
        pm: initialData.pm?._id || initialData.pm || "",
        qa: initialData.qa?._id || initialData.qa || "",
        technical_lead: formatStaffArray(initialData.technical_lead),
        ba: formatStaffArray(initialData.ba),
        developers: formatStaffArray(initialData.developers),
        testers: formatStaffArray(initialData.testers),
        technical_consultancy: formatStaffArray(
          initialData.technical_consultancy
        ),
      };

      setForm(formattedData);
    }
  }, [initialData]);

  // Helper function to format staff arrays
  const formatStaffArray = (staffArray) => {
    if (!staffArray) return [];
    if (!Array.isArray(staffArray)) {
      // If it's a single object, convert to array with ID
      return staffArray._id ? [staffArray._id] : [];
    }
    // If it's already an array, extract IDs
    return staffArray.map((staff) => staff._id || staff);
  };

  // Function to check if a staff is already selected in another role
  const isStaffSelectedElsewhere = (staffId, currentFieldName) => {
    // List of fields to check
    const fieldsToCheck = [
      "pm",
      "qa",
      "technical_lead",
      "ba",
      "developers",
      "testers",
      "technical_consultancy",
    ];

    // Check each field
    for (const field of fieldsToCheck) {
      // Skip current field
      if (field === currentFieldName) continue;

      // Check single fields (pm, qa)
      if (field === "pm" || field === "qa") {
        if (form[field] === staffId) return true;
      }
      // Check array fields (technical_lead, ba, developers, ...)
      else if (Array.isArray(form[field]) && form[field].includes(staffId)) {
        return true;
      }
    }

    return false;
  };

  // Update handleCheckboxSelect to validate before selecting
  const handleCheckboxSelect = (fieldName, staffId) => {
    setForm((prev) => {
      const currentSelected = Array.isArray(prev[fieldName])
        ? prev[fieldName]
        : [];
      const isSelected = currentSelected.includes(staffId);

      // If deselecting, always allow
      if (isSelected) {
        const newValue = currentSelected.filter((id) => id !== staffId);
        // If array is empty, don't remove error
        if (newValue.length === 0) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "At least one staff member is required",
          }));
        } else {
          // Remove error if staff is still selected
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "",
          }));
        }
        return {
          ...prev,
          [fieldName]: newValue,
        };
      }

      // If selecting, check if staff is already selected elsewhere
      if (isStaffSelectedElsewhere(staffId, fieldName)) {
        toast.warning(
          "This staff is already assigned to another role. Please remove them from that role first.",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
        return prev;
      }

      // Clear error when adding staff
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));

      return {
        ...prev,
        [fieldName]: [...currentSelected, staffId],
      };
    });
  };

  // Add errors state
  const [errors, setErrors] = useState({
    project_name: "",
    duration: {
      from: "",
      to: "",
    },
    pm: "",
    qa: "",
    technical_lead: "",
    ba: "",
    developers: "",
    testers: "",
    technical_consultancy: "",
  });

  // Update handleChange to clear errors when user types
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for dates
    if (name === "from" || name === "to") {
      if (name === "to" && form.duration?.from && value) {
        if (value < form.duration.from) {
          setErrors((prev) => ({
            ...prev,
            duration: {
              ...prev.duration,
              to: "End date must be after start date",
            },
          }));
          return;
        }
      }

      if (name === "from" && form.duration?.to && value) {
        if (value > form.duration.to) {
          setErrors((prev) => ({
            ...prev,
            duration: {
              ...prev.duration,
              from: "Start date must be before end date",
            },
          }));
          return;
        }
      }

      setForm({
        ...form,
        duration: {
          ...(form.duration || {}),
          [name]: value,
        },
      });

      // Clear error
      setErrors((prev) => ({
        ...prev,
        duration: {
          ...prev.duration,
          [name]: "",
        },
      }));
      return;
    }

    // Handle other fields
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      project_name: "",
      duration: {
        from: "",
        to: "",
      },
      pm: "",
      qa: "",
      technical_lead: "",
      ba: "",
      developers: "",
      testers: "",
      technical_consultancy: "",
    };

    let isValid = true;

    // Validate project name
    if (!form.project_name?.trim()) {
      newErrors.project_name = "Project name is required";
      isValid = false;
    }

    // Validate dates
    if (!form.duration?.from) {
      newErrors.duration.from = "Start date is required";
      isValid = false;
    }
    if (!form.duration?.to) {
      newErrors.duration.to = "End date is required";
      isValid = false;
    }
    if (
      form.duration?.from &&
      form.duration?.to &&
      form.duration.from > form.duration.to
    ) {
      newErrors.duration.to = "End date must be after start date";
      isValid = false;
    }

    // Validate PM
    if (!form.pm) {
      newErrors.pm = "Project Manager is required";
      isValid = false;
    }

    // Validate QA
    if (!form.qa) {
      newErrors.qa = "QA Lead is required";
      isValid = false;
    }

    // Validate arrays
    if (!form.technical_lead?.length) {
      newErrors.technical_lead = "At least one Technical Lead is required";
      isValid = false;
    }
    if (!form.ba?.length) {
      newErrors.ba = "At least one BA is required";
      isValid = false;
    }
    if (!form.developers?.length) {
      newErrors.developers = "At least one Developer is required";
      isValid = false;
    }
    if (!form.testers?.length) {
      newErrors.testers = "At least one Tester is required";
      isValid = false;
    }
    if (!form.technical_consultancy?.length) {
      newErrors.technical_consultancy =
        "At least one Technical Consultant is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Update submit functions
  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }
    try {
      // Format data and remove _id
      const formattedData = formatFormData(form);
      delete formattedData._id;

      // Dispatch action and let saga handle it
      dispatch(createProject(formattedData));

      // Show success toast
      toast.success("Creating project...", {
        position: "top-right",
        autoClose: 3000,
      });

      // Close popup after sending request
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      return;
    }
    try {
      const formattedData = formatFormData(form);

      // Make sure _id is preserved
      if (!formattedData._id && form._id) {
        formattedData._id = form._id;
      }

      if (!formattedData._id) {
        toast.error("Cannot update: Missing project ID", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      // Show success toast
      toast.success("Updating project...", {
        position: "top-right",
        autoClose: 3000,
      });

      onUpdate?.(formattedData);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Function to clear selection
  const handleClearSelection = (fieldName) => {
    if (fieldName === "pm" || fieldName === "qa") {
      setForm((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [fieldName]: [],
      }));
    }
  };

  // Update renderStaffCheckboxes to display errors
  const renderStaffCheckboxes = (fieldName) => {
    if (isLoading) {
      return <div className="text-gray-500 p-3">Loading staff...</div>;
    }

    if (!staffList.length) {
      return <div className="text-gray-500 p-3">No staff available</div>;
    }

    const selectedCount = form[fieldName]?.length || 0;

    return (
      <div className="max-h-48 overflow-y-auto">
        {/* Header with count and clear button */}
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <span className="text-sm text-gray-600">
            Selected: {selectedCount} staff
          </span>
          {selectedCount > 0 && (
            <button
              onClick={() => handleClearSelection(fieldName)}
              className="text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <FaTimes className="w-3 h-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Staff list */}
        <div className="p-2">
          {staffList.map((staff) => {
            const isSelected = form[fieldName]?.includes(staff._id);
            const isDisabled =
              !isSelected && isStaffSelectedElsewhere(staff._id, fieldName);

            return (
              <div
                key={staff._id}
                className={`flex items-center gap-2 p-1.5 rounded ${
                  isDisabled ? "opacity-50 bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  id={`${fieldName}-${staff._id}`}
                  checked={isSelected}
                  onChange={() => handleCheckboxSelect(fieldName, staff._id)}
                  disabled={isDisabled}
                  className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500 ${
                    isDisabled ? "cursor-not-allowed" : "text-blue-600"
                  }`}
                />
                <label
                  htmlFor={`${fieldName}-${staff._id}`}
                  className={`flex-1 cursor-pointer text-sm truncate ${
                    isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  title={
                    isDisabled
                      ? "This staff is already assigned to another role"
                      : ""
                  }
                >
                  {staff.user_name}
                  {isDisabled && (
                    <span className="ml-2 text-xs text-gray-400">
                      (assigned)
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Update renderSingleSelect to display errors and fix overlap
  const renderSingleSelect = (fieldName, label) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          name={fieldName}
          value={form[fieldName] || ""}
          onChange={handleChange}
          disabled={readOnlyFields.includes(fieldName) || isLoading}
          className={`w-full rounded-lg border shadow-sm py-3 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
            errors[fieldName]
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-200"
          }`}
        >
          <option value="">Select {label}</option>
          {staffList.map((user) => {
            const isDisabled =
              user._id !== form[fieldName] &&
              isStaffSelectedElsewhere(user._id, fieldName);

            return (
              <option
                key={user._id}
                value={user._id}
                disabled={isDisabled}
                className={isDisabled ? "text-gray-400" : ""}
              >
                {user.user_name || "Unnamed Staff"}
                {isDisabled ? " (assigned)" : ""}
              </option>
            );
          })}
        </select>
        {form[fieldName] && (
          <button
            type="button"
            onClick={() => handleClearSelection(fieldName)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 p-1"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
      {errors[fieldName] && (
        <p className="text-red-500 text-xs flex items-center">
          <FaExclamationCircle className="mr-1" />
          {errors[fieldName]}
        </p>
      )}
    </div>
  );

  // Format data function
  const formatFormData = (data) => {
    if (!data) throw new Error("No data provided");

    // Format data
    const formatted = {
      _id: data._id, // Keep _id unchanged
      project_name: data.project_name?.trim() || "",
      duration: {
        from: data.duration?.from || "",
        to: data.duration?.to || "",
      },
      pm: data.pm || "",
      qa: data.qa || "",
      technical_lead: Array.isArray(data.technical_lead)
        ? data.technical_lead
        : [],
      ba: Array.isArray(data.ba) ? data.ba : [],
      developers: Array.isArray(data.developers) ? data.developers : [],
      testers: Array.isArray(data.testers) ? data.testers : [],
      technical_consultancy: Array.isArray(data.technical_consultancy)
        ? data.technical_consultancy
        : [],
    };

    return formatted;
  };

  // Monitor project creation status
  useEffect(() => {
    if (projectError) {
      toast.error(`Failed to create project: ${projectError}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [projectError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      {/* Container */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col animate-slideIn max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {initialData?._id ? "Update Project" : "Create Project"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content area with adjusted max height and better scrolling */}
        <div
          className="overflow-y-auto p-4 md:p-6"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
              <span className="ml-3 text-gray-600">Loading staff data...</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  disabled={readOnlyFields.includes("project_name")}
                  placeholder="Enter Project Name"
                  className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.project_name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                />
                {errors.project_name && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.project_name}
                  </p>
                )}
              </div>

              {/* Empty div for alignment - removed to avoid wasted space */}

              {/* Dates - more responsive grid for mobile */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="from"
                  value={form.duration?.from || ""}
                  onChange={handleChange}
                  max={form.duration?.to || ""}
                  className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.duration?.from
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                />
                {errors.duration?.from && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.duration.from}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="to"
                  value={form.duration?.to || ""}
                  onChange={handleChange}
                  min={form.duration?.from || ""}
                  className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.duration?.to
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200"
                  }`}
                />
                {errors.duration?.to && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.duration.to}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Leaders */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserTie className="mr-2 text-blue-600" />
              Project Leaders
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {renderSingleSelect("pm", "Project Manager")}
              {renderSingleSelect("qa", "QA Lead")}
            </div>
          </div>

          {/* Team Members - better responsive grid for mobile */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              Team Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Lead */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Technical Lead <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-lg border overflow-hidden ${
                    errors.technical_lead ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {renderStaffCheckboxes("technical_lead")}
                </div>
                {errors.technical_lead && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.technical_lead}
                  </p>
                )}
              </div>

              {/* Business Analyst */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Analyst <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-lg border overflow-hidden ${
                    errors.ba ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {renderStaffCheckboxes("ba")}
                </div>
                {errors.ba && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.ba}
                  </p>
                )}
              </div>

              {/* Developers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Developers <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-lg border overflow-hidden ${
                    errors.developers ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {renderStaffCheckboxes("developers")}
                </div>
                {errors.developers && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.developers}
                  </p>
                )}
              </div>

              {/* Testers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Testers <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-lg border overflow-hidden ${
                    errors.testers ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {renderStaffCheckboxes("testers")}
                </div>
                {errors.testers && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.testers}
                  </p>
                )}
              </div>

              {/* Technical Consultancy - changed from col-span-2 to more responsive layout */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Technical Consultancy <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-lg border overflow-hidden ${
                    errors.technical_consultancy
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                >
                  {renderStaffCheckboxes("technical_consultancy")}
                </div>
                {errors.technical_consultancy && (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationCircle className="mr-1" />
                    {errors.technical_consultancy}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - sticky to ensure visibility */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto sticky bottom-0 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          {onUpdate && (
            <button
              onClick={handleUpdate}
              disabled={isLoading || projectLoading}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center disabled:opacity-50"
            >
              {projectLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <FaSave className="mr-2" /> Update Project
                </>
              )}
            </button>
          )}
          {onAdd && (
            <button
              onClick={handleAdd}
              disabled={isLoading || projectLoading}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center disabled:opacity-50"
            >
              {projectLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Project"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
