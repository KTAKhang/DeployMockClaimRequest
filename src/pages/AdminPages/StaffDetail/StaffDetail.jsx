import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getStaffById,
  GET_STAFF_ALL,
} from "../../../redux/actions/staffActions";
import {
  FaFileAlt,
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaDollarSign,
  FaEdit,
  FaArrowLeft,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import profileImage from "../../../assets/img/profile.png";
import PopupUpdateStaff from "../../../components/Popup/Staff/PopupUpdateStaff";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import từ các file đã tách
import { ROUTES, UI_CONSTANTS, TOAST_CONFIG, FIELD_TYPES } from "./constants";
import {
  PAGE_STRINGS,
  SECTION_HEADERS,
  FIELD_LABELS,
  QUICK_STATS_LABELS,
  BUTTON_STRINGS,
  DEFAULT_VALUES,
  TOAST_MESSAGES,
  LOADING_STRINGS,
} from "./strings";
import {
  formatCurrency,
  getBadgeColorClass,
  getStatusBadgeColor,
  formatStatusText,
  getStaffAvatar,
  truncateId,
  isObjectChanged,
  mergeStaffData,
} from "./utils";

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { staffById, staffAll, loading } = useSelector((state) => state.staff);

  const staffFromRedux =
    Array.isArray(staffAll?.data) && staffAll.data.find((s) => s._id === id);
  const staffFromState = location.state?.staff;

  const [staffDetail, setStaffDetail] = useState(
    staffFromRedux || staffFromState || {}
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!staffFromRedux && !staffFromState) {
      dispatch(getStaffById(id));
    } else {
      setTimeout(() => setIsLoading(false), UI_CONSTANTS.LOADING_DELAY);
    }
  }, [dispatch, id, staffFromRedux, staffFromState]);

  useEffect(() => {
    dispatch({ type: GET_STAFF_ALL }); // Fetch latest data
  }, [dispatch]);

  useEffect(() => {
    if (staffById && staffById._id === id) {
      setTimeout(() => setIsLoading(false), UI_CONSTANTS.LOADING_DELAY);
      setStaffDetail(staffById);
    }
  }, [staffById, id]);

  useEffect(() => {
    if (staffFromRedux) {
      setTimeout(() => setIsLoading(false), UI_CONSTANTS.LOADING_DELAY);
      setStaffDetail(staffFromRedux);
    }
  }, [staffFromRedux]);

  const handleUpdateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = (updatedStaffData) => {
    setIsPopupOpen(false);

    if (
      updatedStaffData &&
      Object.keys(updatedStaffData).length > 0 &&
      isObjectChanged(updatedStaffData, staffDetail)
    ) {
      setStaffDetail((prev) => mergeStaffData(prev, updatedStaffData));
      setIsLoading(false);
      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS, TOAST_CONFIG);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, UI_CONSTANTS.COPY_TIMEOUT);
      })
      .catch(() => {
        console.error(TOAST_MESSAGES.COPY_FAILED);
      });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading message={LOADING_STRINGS.STAFF_DETAILS} />
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-3 sm:p-6">
      {/* Breadcrumb with animated hover effect and Back button in line */}
      <nav className="flex mb-6 text-sm">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
          <li className="inline-flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <FaArrowLeft className="mr-1 sm:mr-2" />{" "}
              {PAGE_STRINGS.BREADCRUMB_BACK}
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2">|</span>
            </div>
          </li>
          <li className="inline-flex items-center">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <svg
                className="w-3 h-3 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              {PAGE_STRINGS.BREADCRUMB_DASHBOARD}
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <button
                onClick={() => navigate(ROUTES.STAFF_MANAGEMENT)}
                className="text-gray-500 hover:text-blue-600 transition-colors ml-1 md:ml-2"
              >
                {PAGE_STRINGS.BREADCRUMB_STAFF_MANAGEMENT}
              </button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-blue-600 ml-1 md:ml-2 font-medium">
                {PAGE_STRINGS.BREADCRUMB_STAFF_DETAILS}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main content card with subtle animation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
              <FaUser className="mr-2" /> {PAGE_STRINGS.TITLE}
            </h1>

            <div className="flex gap-2 items-center">
              <div
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-full text-sm backdrop-blur-sm flex items-center group cursor-pointer hover:bg-opacity-30 transition-all"
                onClick={handleCopyId}
                title={BUTTON_STRINGS.COPY}
              >
                <span className="mr-2">ID:</span>
                <span className="font-mono mr-2">
                  {truncateId(id, UI_CONSTANTS.ID_SUBSTRING_LENGTH)}...
                </span>
                {isCopied ? (
                  <FaCheck className="text-green-400 group-hover:text-green-300 transition-colors" />
                ) : (
                  <FaCopy className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                )}

                <span className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {isCopied ? BUTTON_STRINGS.COPIED : BUTTON_STRINGS.COPY}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile section with card layout */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Left column - Profile image and basic stats */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <img
                  src={getStaffAvatar(staffDetail.avatar)}
                  alt={staffDetail.user_name || "Staff Profile"}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {staffDetail.user_name || DEFAULT_VALUES.NAME}
              </h2>
              <p className="text-blue-600 font-medium">
                {staffDetail.role_name || DEFAULT_VALUES.ROLE}
              </p>

              {/* Quick stats cards */}
              <div className="mt-6 w-full grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-center mb-1 text-blue-600">
                    <FaBuilding />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {QUICK_STATS_LABELS.DEPARTMENT}
                  </p>
                  <p className="font-medium text-center text-sm truncate">
                    {staffDetail.department || DEFAULT_VALUES.DEPARTMENT}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center justify-center mb-1 text-purple-600">
                    <FaChartLine />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {QUICK_STATS_LABELS.RANK}
                  </p>
                  <p className="font-medium text-center text-sm truncate">
                    {staffDetail.job_rank || DEFAULT_VALUES.JOB_RANK}
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg col-span-2">
                  <div className="flex items-center justify-center mb-1 text-green-600">
                    <FaDollarSign />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {QUICK_STATS_LABELS.SALARY}
                  </p>
                  <p className="font-medium text-center text-sm">
                    {staffDetail.salary?.toLocaleString() ||
                      DEFAULT_VALUES.SALARY}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Detailed information */}
            <div className="md:w-2/3">
              <div className="bg-gray-50 h-full p-4 sm:p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-600" />{" "}
                  {SECTION_HEADERS.DETAILED_INFORMATION}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    {
                      icon: <FaUser className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.FULL_NAME,
                      value: staffDetail.user_name,
                      type: FIELD_TYPES.NORMAL,
                    },
                    {
                      icon: <FaBriefcase className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.ROLE,
                      value: staffDetail.role_name,
                      type: FIELD_TYPES.NORMAL,
                    },
                    {
                      icon: <FaBuilding className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.DEPARTMENT,
                      value: staffDetail.department,
                      type: FIELD_TYPES.NORMAL,
                    },
                    {
                      icon: <FaChartLine className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.JOB_RANK,
                      value: staffDetail.job_rank,
                      type: FIELD_TYPES.NORMAL,
                    },
                    {
                      icon: <FaDollarSign className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.SALARY,
                      value: formatCurrency(staffDetail.salary),
                      type: FIELD_TYPES.NORMAL,
                    },
                    {
                      icon: <FaFileAlt className="text-blue-600 mr-2" />,
                      label: FIELD_LABELS.STATUS,
                      value: formatStatusText(staffDetail.status),
                      type: FIELD_TYPES.BADGE,
                      badgeColor: getStatusBadgeColor(staffDetail.status),
                    },
                  ].map((field, index) => (
                    <div key={index} className="mb-2">
                      <div className="text-sm text-gray-500 flex items-center">
                        {field.icon} {field.label}
                      </div>
                      <div className="font-medium text-gray-900 pl-6">
                        {field.type === FIELD_TYPES.BADGE ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColorClass(
                              field.badgeColor
                            )}`}
                          >
                            {field.value}
                          </span>
                        ) : (
                          field.value || DEFAULT_VALUES.NAME
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons with hover effects */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              onClick={handleUpdateClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center shadow-sm hover:shadow"
            >
              <FaEdit className="mr-2" /> {BUTTON_STRINGS.EDIT_PROFILE}
            </button>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <PopupUpdateStaff staffData={staffDetail} onClose={handlePopupClose} />
      )}
    </div>
  );
};

export default StaffDetail;
