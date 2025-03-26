import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateStaff } from "../../../redux/actions/staffActions";
import { toast } from "react-toastify";

export default function PopupUpdateStaff({ staffData, onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.staff);
  
  // 👇 Đặt tất cả các hook ở cấp cao nhất của component
  const authUser = useSelector((state) => state.auth.user);
  
  // Kiểm tra quyền admin từ nhiều nguồn
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Kiểm tra từ thông tin user lấy từ useSelector
    let admin = 
      authUser?.role_name === 'Administrator' || 
      authUser?.role === 'Administrator';
    
    // Nếu không tìm thấy trong Redux, kiểm tra localStorage
    if (!admin) {
      try {
        // Kiểm tra từ localStorage
        const localRole = localStorage.getItem('role');
        if (localRole === 'Administrator') {
          admin = true;
        }
        
        // Kiểm tra từ user object trong localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'Administrator' || user.role_name === 'Administrator') {
            admin = true;
          }
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    }
    
    setIsAdmin(admin);
    console.log("🔑 Is admin:", admin);
  }, [authUser]); // 👈 Thêm authUser vào dependency array

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
      [name]: type === "checkbox" ? checked : 
              type === "number" ? Number(value) || 0 : value,
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
      toast.warning("Only Administrator can change roles. Other changes will be saved.");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Update Staff Information
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex flex-col gap-4">
          {[
            {
              label: "User Name",
              name: "user_name",
              type: "text",
              placeholder: "Enter user name",
            },
            {
              label: "Salary",
              name: "salary",
              type: "number",
              placeholder: "Enter salary",
            },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className="flex flex-col">
              <label className="font-bold">{label} *</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`border rounded p-3 w-full h-12 ${errors[name] ? "border-red-500" : ""
                  }`}
                required
              />
              {errors[name] && (
                <span className="text-red-500 text-sm">{errors[name]}</span>
              )}
            </div>
          ))}

          {/* Dropdown Role */}
          <div className="flex flex-col">
            <label className="font-bold">Role *</label>
            <select
              name="role_name"
              value={form.role_name}
              onChange={handleChange}
              className="border rounded p-3 w-full h-12"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role_name && (
              <span className="text-red-500 text-sm">{errors.role_name}</span>
            )}
          </div>

          {/* Dropdown Job Rank */}
          <div className="flex flex-col">
            <label className="font-bold">Job Rank *</label>
            <select
              name="job_rank"
              value={form.job_rank}
              onChange={handleChange}
              className="border rounded p-3 w-full h-12"
            >
              <option value="">Select job rank</option>
              {jobRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
            {errors.job_rank && (
              <span className="text-red-500 text-sm">{errors.job_rank}</span>
            )}
          </div>

          {/* Dropdown Department */}
          <div className="flex flex-col">
            <label className="font-bold">Department *</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="border rounded p-3 w-full h-12"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <span className="text-red-500 text-sm">{errors.department}</span>
            )}
          </div>

          {/* Thêm toggle switch cho status */}
          <div className="flex items-center gap-2">
            <label className="font-bold">Status *</label>
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
                  form.status ? 'bg-green-500' : 'bg-gray-300'
                }`}
                style={{
                  transition: '0.4s',
                }}
              >
                <span
                  className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transform ${
                    form.status ? 'translate-x-6' : 'translate-x-0'
                  }`}
                  style={{
                    transition: '0.4s',
                  }}
                ></span>
              </label>
            </div>
            <span className={form.status ? "text-green-500" : "text-gray-500"}>
              {form.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Updating ..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
