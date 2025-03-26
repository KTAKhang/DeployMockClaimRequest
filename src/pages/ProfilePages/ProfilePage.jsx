import { useState, useEffect } from "react";
import {
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaDollarSign,
  FaUserTie,
  FaTimes,
  FaArrowLeft,
  FaClock,
  FaHistory,
  FaEdit,
  FaKey,
  FaSpinner,
} from "react-icons/fa";
import { BsDot } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfile,
} from "../../redux/actions/userActions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ChangePasswordPage from "../AuthPage/ChangePasswordPage/ChangePasswordPage";
import Loading from "../../components/Loading/Loading";

// Import từ các file đã tách
import {
  STATUS,
  TOAST_CONFIG,
  FIELD_NAMES,
  ROLE_TYPES,
  DEFAULT_VALUES,
  CSS_CLASSES
} from "./constants";

import {
  PAGE_STRINGS,
  BUTTON_STRINGS,
  FIELD_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STRINGS,
  FORM_STRINGS
} from "./strings";

import {
  validateUserName,
  formatDate,
  formatCurrency,
  createUpdateData,
  readFileAsDataURL,
  handleImageError
} from "./utils";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, loading, error, updateLoading, updateError, updateSuccess } =
    useSelector((state) => ({
      profile: state.user.profile,
      loading: state.user.loading,
      error: state.user.error,
      updateLoading: state.user.updateLoading,
      updateError: state.user.updateError,
      updateSuccess: state.user.updateSuccess,
      userRole: state.auth.user?.role_name,
    }));
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editForm, setEditForm] = useState({ ...profile });
  const { user } = useSelector((state) => state.auth);

  const [errors, setErrors] = useState("");
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = () => {
    setShowChangePasswordPopup(true);
  };

  const handleClosePopup = () => {
    setShowChangePasswordPopup(false);
  };

  useEffect(() => {
    toast.dismiss();
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile && profile._id) {
      setEditForm({ ...profile });
    }
  }, [profile]);

  useEffect(() => {
    if (updateSuccess) {
      setShowEditPopup(false);
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED, TOAST_CONFIG);
    }
  }, [updateSuccess]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
    setErrors("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameError = validateUserName(editForm[FIELD_NAMES.USER_NAME]);
    if (nameError) {
      setErrors(nameError);
      return;
    }

    const currentRole = profile?.role_name;
    const updateData = createUpdateData(editForm, currentRole);

    dispatch(updateUserProfile(updateData));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setEditForm({ ...editForm, [FIELD_NAMES.AVATAR]: dataUrl });
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <ToastContainer />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span>{PAGE_STRINGS.BACK}</span>
        </button>

        {loading ? (
          // Loading State
          <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Loading message={LOADING_STRINGS.PROFILE} />
          </div>
        ) : error ? (
          // Error State
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-8 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[500px]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-red-100 text-red-500 rounded-full mb-4">
              <FaTimes className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-red-500 font-medium mb-2 text-sm sm:text-base">
              {ERROR_MESSAGES.LOADING_PROFILE}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => dispatch(getUserProfile())}
              className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
            >
              {PAGE_STRINGS.TRY_AGAIN}
            </button>
          </div>
        ) : (
          // Main Card - Only show when data is loaded
          <div className="bg-white rounded-xl sm:rounded-2xl  overflow-hidden border">
            {/* Header */}
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-3 sm:pb-6">
                <div className="flex items-end space-x-3 sm:space-x-6">
                  {/* Avatar */}
                  <div className="relative translate-y-1/2">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden ring-2 sm:ring-4 ring-white">
                      <img
                        src={profile?.avatar || DEFAULT_VALUES.AVATAR}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, DEFAULT_VALUES.AVATAR)}
                      />
                    </div>
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-2 sm:w-4 h-2 sm:h-4 bg-green-500 rounded-full ring-1 sm:ring-2 ring-white"></div>
                  </div>
                  {/* User Info */}
                  <div className="mb-2 sm:mb-4">
                    <h1 className="text-lg sm:text-2xl font-bold text-white">
                      {profile?.user_name}
                    </h1>
                    <p className="text-blue-100 mt-0.5 sm:mt-1 text-xs sm:text-base">
                      {profile?.role_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-8 py-6 sm:py-12 mt-10 sm:mt-16">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {PAGE_STRINGS.PROFILE_INFORMATION}
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowEditPopup(true)}
                    className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                  >
                    <FaEdit className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {BUTTON_STRINGS.EDIT_PROFILE}
                  </button>

                  <button
                    onClick={handleChangePassword}
                    className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
                  >
                    <FaKey className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {BUTTON_STRINGS.CHANGE_PASSWORD}
                  </button>
                </div>

                {/* Popup Change Password */}
                {showChangePasswordPopup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-[500px]">
                      <ChangePasswordPage onClose={handleClosePopup} />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-8">
                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {FIELD_LABELS.USERNAME}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {profile?.user_name || DEFAULT_VALUES.NA}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {FIELD_LABELS.DEPARTMENT}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {profile?.department || DEFAULT_VALUES.NA}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <FaBriefcase className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {FIELD_LABELS.JOB_RANK}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {profile?.job_rank || DEFAULT_VALUES.NA}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <FaDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {FIELD_LABELS.SALARY}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {formatCurrency(profile?.salary)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <FaUserTie className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">{FIELD_LABELS.ROLE}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {profile?.role_name || DEFAULT_VALUES.NA}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <BsDot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {FIELD_LABELS.STATUS}
                        </p>
                        <div className="flex items-center">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              profile?.status ? CSS_CLASSES.STATUS_INDICATOR.ACTIVE : CSS_CLASSES.STATUS_INDICATOR.INACTIVE
                            } mr-2`}
                          ></div>
                          <p className="text-sm sm:text-base font-medium text-gray-900">
                            {profile?.status ? STATUS.ACTIVE : STATUS.INACTIVE}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
                  <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {FIELD_LABELS.CREATED_AT}
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {formatDate(profile?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <FaHistory className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {FIELD_LABELS.UPDATED_AT}
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {formatDate(profile?.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Popup */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">{PAGE_STRINGS.EDIT_PROFILE}</h2>
              <button
                onClick={() => setShowEditPopup(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={updateLoading}
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {updateError && (
              <div className="mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
                {updateError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Fields - All users can edit */}
              <div className="space-y-2">
                {/* Avatar Preview */}
                <div className="relative w-full flex items-center justify-center mb-4">
                  <div className="flex items-center justify-center">
                    {editForm[FIELD_NAMES.AVATAR] ? (
                      <img
                        src={editForm[FIELD_NAMES.AVATAR]}
                        alt="Avatar Preview"
                        className="w-24 h-24 sm:w-40 sm:h-40 object-cover rounded-full border-2 sm:border-4 border-gray-300"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 text-sm sm:text-base">
                        {FORM_STRINGS.NO_IMAGE}
                      </div>
                    )}
                  </div>

                  {/* Button to Change Image */}
                  <label className="absolute bottom-0 ml-2 transform translate-y-1/4 bg-gray-600 text-white text-xs py-1 sm:py-2 px-2 sm:px-3 rounded-full cursor-pointer">
                    ✏️
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="block font-medium text-gray-700 text-sm sm:text-base">
                  {FIELD_LABELS.USERNAME}
                </label>
                <input
                  type="text"
                  name={FIELD_NAMES.USER_NAME}
                  value={editForm[FIELD_NAMES.USER_NAME] || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors && (
                  <span className="text-red-500 text-xs sm:text-sm">
                    {errors}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 sm:space-x-4 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base"
                  disabled={updateLoading}
                >
                  {BUTTON_STRINGS.CANCEL}
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm sm:text-base"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      {BUTTON_STRINGS.UPDATING}
                    </>
                  ) : (
                    BUTTON_STRINGS.SAVE_CHANGES
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
