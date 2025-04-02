import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStaffAll } from "../../../redux/actions/staffActions";
import { createProject } from "../../../redux/actions/projectActions";
import { toast } from "react-toastify";

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

  // Fetch staff list khi component mount
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      try {
        // Thêm log để debug
        console.log("Fetching staff data...");
        await dispatch(getStaffAll());
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [dispatch]);

  // Cập nhật staffList khi Redux state thay đổi
  useEffect(() => {
    console.log("staffAll changed:", staffAll); // Debug log

    if (staffAll?.data) {
      console.log("Setting staff list:", staffAll.data);
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
      console.log("Initializing form with data:", initialData);

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

      console.log("Formatted form data:", formattedData);
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

  // Thêm hàm để kiểm tra xem một staff đã được chọn vào vị trí nào chưa
  const isStaffSelectedElsewhere = (staffId, currentFieldName) => {
    // Danh sách các trường cần kiểm tra
    const fieldsToCheck = [
      "pm",
      "qa",
      "technical_lead",
      "ba",
      "developers",
      "testers",
      "technical_consultancy",
    ];

    // Kiểm tra từng trường
    for (const field of fieldsToCheck) {
      // Bỏ qua trường hiện tại
      if (field === currentFieldName) continue;

      // Kiểm tra nếu là trường đơn (pm, qa)
      if (field === "pm" || field === "qa") {
        if (form[field] === staffId) return true;
      }
      // Kiểm tra nếu là trường mảng (technical_lead, ba, developers, ...)
      else if (Array.isArray(form[field]) && form[field].includes(staffId)) {
        return true;
      }
    }

    return false;
  };

  // Cập nhật hàm handleCheckboxSelect để kiểm tra trước khi chọn
  const handleCheckboxSelect = (fieldName, staffId) => {
    setForm((prev) => {
      const currentSelected = Array.isArray(prev[fieldName])
        ? prev[fieldName]
        : [];
      const isSelected = currentSelected.includes(staffId);

      // Nếu đang bỏ chọn, luôn cho phép
      if (isSelected) {
        const newValue = currentSelected.filter((id) => id !== staffId);
        // Nếu mảng rỗng, không xóa lỗi
        if (newValue.length === 0) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "At least one staff member is required",
          }));
        } else {
          // Xóa lỗi nếu vẫn còn staff được chọn
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

      // Nếu đang chọn, kiểm tra xem staff đã được chọn ở vị trí khác chưa
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

      // Xóa lỗi khi thêm staff
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

  // Thêm state errors
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

  // Cập nhật hàm handleChange để xóa lỗi khi user nhập
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho ngày tháng
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

    // Xử lý các trường khác
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

  const handleMultiSelect = (e, fieldName) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setForm((prev) => ({
      ...prev,
      [fieldName]: selectedValues,
    }));
  };

  // Thêm hàm validate form
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

  // Cập nhật các hàm xử lý submit
  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }
    try {
      // Format data và loại bỏ _id
      const formattedData = formatFormData(form);
      delete formattedData._id;

      console.log("Submitting project data:", formattedData);

      // Dispatch action và để saga xử lý
      dispatch(createProject(formattedData));

      // Đóng popup ngay sau khi gửi request
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

      // Đảm bảo _id được giữ nguyên
      if (!formattedData._id && form._id) {
        formattedData._id = form._id;
      }

      console.log("Sending update data to BE:", formattedData);
      console.log("Project ID:", formattedData._id);

      if (!formattedData._id) {
        toast.error("Cannot update: Missing project ID");
        return;
      }

      onUpdate?.(formattedData);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project. Please try again.");
    }
  };

  // Thêm hàm clear selection
  const handleClearSelection = (fieldName) => {
    // Check if it's a single-select field (pm, qa) or multi-select field
    if (fieldName === "pm" || fieldName === "qa") {
      setForm((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    } else {
      // For multi-select fields (arrays)
      setForm((prev) => ({
        ...prev,
        [fieldName]: [],
      }));
    }
  };

  // Cập nhật renderStaffCheckboxes để hiển thị lỗi
  const renderStaffCheckboxes = (fieldName) => {
    if (isLoading) {
      return <div className="text-gray-500">Loading staff...</div>;
    }

    if (!staffList.length) {
      return <div className="text-gray-500">No staff available</div>;
    }

    const selectedCount = form[fieldName]?.length || 0;

    return (
      <div
        className={`bg-white rounded-lg border ${
          errors[fieldName] ? "border-red-500" : "border-gray-300"
        }`}
      >
        {/* Header với số lượng và nút clear */}
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <span className="text-sm text-gray-600">
            Selected: {selectedCount} staff
          </span>
          {selectedCount > 0 && (
            <button
              onClick={() => handleClearSelection(fieldName)}
              className="text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Danh sách staff */}
        <div className="max-h-48 overflow-y-auto p-2">
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
                  className={`flex-1 cursor-pointer text-sm ${
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
                      (already in another role)
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
        {errors[fieldName] && (
          <div className="px-2 pb-2">
            <span className="text-red-500 text-xs">{errors[fieldName]}</span>
          </div>
        )}
      </div>
    );
  };

  // Thêm useEffect để debug state changes
  useEffect(() => {
    console.log("Current state:", {
      isLoading,
      staffListLength: staffList.length,
      formData: form,
    });
  }, [isLoading, staffList, form]);

  // Thêm useEffect để debug staffList
  useEffect(() => {
    console.log("Current staffList:", staffList);
  }, [staffList]);

  // Cập nhật renderStaffOptions để hiển thị trạng thái disabled
  const renderStaffOptions = () => {
    if (isLoading) {
      return <option value="">Loading staff...</option>;
    }

    if (!staffList || staffList.length === 0) {
      return <option value="">No staff available</option>;
    }

    return staffList.map((user) => {
      const isDisabled = isStaffSelectedElsewhere(user._id, "");

      return (
        <option
          key={user._id}
          value={user._id}
          disabled={isDisabled}
          className={isDisabled ? "text-gray-400" : ""}
        >
          {user.user_name || "Unnamed Staff"}
          {isDisabled ? " (assigned elsewhere)" : ""}
        </option>
      );
    });
  };

  // Cập nhật renderSingleSelect để hiển thị lỗi
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
          className={`w-full rounded-lg border ${
            errors[fieldName] ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8`}
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
                {isDisabled ? " (assigned elsewhere)" : ""}
              </option>
            );
          })}
        </select>
        {form[fieldName] && (
          <button
            onClick={() => handleClearSelection(fieldName)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {errors[fieldName] && (
        <span className="text-red-500 text-xs">{errors[fieldName]}</span>
      )}
    </div>
  );

  // Thêm hàm format data
  const formatFormData = (data) => {
    // Validate input data
    if (!data) throw new Error("No data provided");

    // Format data
    const formatted = {
      _id: data._id, // Đảm bảo _id được giữ nguyên
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

    // Log formatted data
    console.log("Formatted project data:", formatted);

    return formatted;
  };

  // Thêm useEffect để theo dõi trạng thái tạo project
  useEffect(() => {
    if (projectError) {
      toast.error(`Failed to create project: ${projectError}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [projectError]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[900px] max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Project Information
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the project details and assign team members
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading staff data...</span>
          </div>
        )}

        {/* Error State */}
        {/* {!isLoading && staffList.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="ml-3 text-yellow-700">No staff data available. Please check your API connection.</p>
            </div>
            <button 
              onClick={() => {
                setIsLoading(true);
                dispatch(getStaffAll(1, 100));
              }}
              className="mt-3 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )} */}

        {/* Form Content */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Project Basic Info Section */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
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
                  className={`w-full rounded-lg border ${
                    errors.project_name ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                />
                {errors.project_name && (
                  <span className="text-red-500 text-xs">
                    {errors.project_name}
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
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
                    className={`w-full rounded-lg border ${
                      errors.duration?.from
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.duration?.from && (
                    <span className="text-red-500 text-xs">
                      {errors.duration.from}
                    </span>
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
                    className={`w-full rounded-lg border ${
                      errors.duration?.to ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.duration?.to && (
                    <span className="text-red-500 text-xs">
                      {errors.duration.to}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Leaders Section */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Project Leaders
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {renderSingleSelect("pm", "Project Manager")}
              {renderSingleSelect("qa", "QA Lead")}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Team Members
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Technical Lead */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Technical Lead <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300">
                  {renderStaffCheckboxes("technical_lead")}
                </div>
              </div>

              {/* Business Analyst */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Analyst <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300">
                  {renderStaffCheckboxes("ba")}
                </div>
              </div>

              {/* Developers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Developers <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300">
                  {renderStaffCheckboxes("developers")}
                </div>
              </div>

              {/* Testers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Testers <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300">
                  {renderStaffCheckboxes("testers")}
                </div>
              </div>

              {/* Technical Consultancy */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Technical Consultancy <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300">
                  {renderStaffCheckboxes("technical_consultancy")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={projectLoading}
          >
            Cancel
          </button>
          {onUpdate && (
            <button
              onClick={handleUpdate}
              disabled={isLoading || projectLoading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {projectLoading ? "Updating..." : "Update Project"}
            </button>
          )}
          {onAdd && (
            <button
              onClick={handleAdd}
              disabled={isLoading || projectLoading}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
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
