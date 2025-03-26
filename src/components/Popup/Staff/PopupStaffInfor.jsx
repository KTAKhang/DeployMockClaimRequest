import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addStaff } from "../../../redux/actions/staffActions";
import { toast } from "react-toastify";

export default function PopupStaffInfor({ onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.staff);

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
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const formattedData = {
      ...form,
      user_name: formatUserName(form.user_name),
    };

    console.log("📤 Sending data to API:", formattedData);
    dispatch(addStaff(formattedData));

    setTimeout(() => {
      if (!error) {
        toast.success("Staff added successfully!");
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Add New Staff</h2>

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
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "Enter email",
            },
            {
              label: "Password",
              name: "password",
              type: "password",
              placeholder: "Enter password",
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

          <div className="flex flex-col">
            <label className="font-bold">Role *</label>
            <select
              name="role"
              value={form.role}
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
            {errors.role && (
              <span className="text-red-500 text-sm">{errors.role}</span>
            )}
          </div>

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
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-6 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
