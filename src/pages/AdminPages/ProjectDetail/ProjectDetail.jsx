import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectById,
  updateProject,
  toggleProjectStatus,
} from "../../../redux/actions/projectActions";
import PopupProjectInfo from "../../../components/Popup/PopupProjectInfor";
import StatusChart from "../../../components/Charts/StatusChart";
import Modal from "../../../components/Modal/Modal";
import { toast } from "react-toastify";
import Loading from "../../../components/Loading/Loading";
import {
  FaArrowLeft,
  FaEdit,
  FaCalendarAlt,
  FaUsers,
  FaClipboard,
  FaProjectDiagram,
  FaCheckCircle,
  FaTimesCircle,
  FaBriefcase,
  FaUserTie,
  FaCode,
  FaUserCheck,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

// Import từ các file đã tách
import { 
  ACTION_TYPES, 
  TEAM_MEMBER_TYPES,
  UI_CONSTANTS,
  ROUTES 
} from "./constants";
import { 
  PAGE_STRINGS, 
  SECTION_HEADERS, 
  PROJECT_INFO_LABELS,
  TEAM_MEMBER_LABELS,
  STATUS_STRINGS,
  BUTTON_STRINGS,
  MESSAGE_STRINGS
} from "./strings";
import {
  getStatusButtonClass,
  getStatusBadgeClass,
  getStatusButtonText,
  formatDate,
  isNonEmptyArray,
  formatStatusText,
  sanitizeProjectData,
  truncateId
} from "./utils";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { projectById, projectsAll, loading, statusChangeSuccess } =
    useSelector((state) => state.projects);

  const projectFromRedux =
    Array.isArray(projectsAll?.data) &&
    projectsAll.data.find((p) => p._id === id);
  const projectFromState = location.state?.project;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch project if not available in Redux
  useEffect(() => {
    if (!id) {
      console.error(MESSAGE_STRINGS.NO_PROJECT_ID);
      return;
    }
    console.log("Fetching project with ID:", id);
    dispatch(getProjectById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (statusChangeSuccess) {
      navigate(ROUTES.PROJECT_MANAGEMENT);
    }
  }, [statusChangeSuccess, navigate]);

  const projectDetail =
    projectFromRedux || projectFromState || projectById || {};

  const handleUpdateProject = (updatedData) => {
    const projectData = sanitizeProjectData(updatedData, projectDetail._id);

    console.log("Project ID for update:", projectData._id);
    console.log("Full update data:", projectData);

    if (!projectData._id) {
      toast.error(MESSAGE_STRINGS.CANNOT_UPDATE);
      return;
    }

    dispatch(updateProject(projectData));
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleToggleStatus = () => {
    const projectIdToUpdate = id || projectDetail?._id;

    if (!projectIdToUpdate) {
      toast.error(MESSAGE_STRINGS.CANNOT_UPDATE_STATUS);
      return;
    }

    const targetStatus = !projectDetail.status;
    setNewStatus(targetStatus);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    const projectIdToUpdate = id || projectDetail?._id;

    if (!projectIdToUpdate) {
      toast.error(MESSAGE_STRINGS.CANNOT_UPDATE_STATUS);
      return;
    }

    console.log(
      `🔄 Changing project status to ${newStatus ? "active" : "inactive"}, ID:`,
      projectIdToUpdate
    );
    dispatch(toggleProjectStatus(projectIdToUpdate, newStatus));
    setIsStatusModalOpen(false);
  };

  const handleCopyId = () => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setIsCopied(true);
        toast.success(MESSAGE_STRINGS.COPY_SUCCESS);
        setTimeout(() => {
          setIsCopied(false);
        }, UI_CONSTANTS.COPY_TIMEOUT);
      })
      .catch(() => {
        console.error(MESSAGE_STRINGS.COPY_FAIL);
        toast.error(MESSAGE_STRINGS.COPY_FAIL);
      });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading message={MESSAGE_STRINGS.LOADING_PROJECT} />
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-3 sm:p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-6 text-sm">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
          <li className="inline-flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <FaArrowLeft className="mr-1 sm:mr-2" /> {PAGE_STRINGS.BREADCRUMB_BACK}
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
              {PAGE_STRINGS.BREADCRUMB_DASHBOARD}
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2">&gt;</span>
              <button
                onClick={() => navigate(ROUTES.PROJECT_MANAGEMENT)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {PAGE_STRINGS.BREADCRUMB_PROJECT_MANAGEMENT}
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2">&gt;</span>
              <span className="text-blue-600 font-semibold">
                {PAGE_STRINGS.BREADCRUMB_PROJECT_DETAILS}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main content card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
              <FaProjectDiagram className="mr-2" /> {PAGE_STRINGS.TITLE}
            </h1>

            <div
              className="px-3 py-1.5 bg-white bg-opacity-20 rounded-full text-sm backdrop-blur-sm flex items-center group cursor-pointer hover:bg-opacity-30 transition-all relative"
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

        <div className="p-4 sm:p-6">
          {/* Project Information & Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Project Basic Info */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-blue-600" /> {SECTION_HEADERS.PROJECT_INFORMATION}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">{PROJECT_INFO_LABELS.PROJECT_NAME}</div>
                  <div className="font-medium text-gray-900 text-lg">
                    {projectDetail.project_name || "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FaCalendarAlt className="text-blue-600 mr-2" /> {PROJECT_INFO_LABELS.START_DATE}
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(projectDetail.duration?.from)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FaCalendarAlt className="text-blue-600 mr-2" /> {PROJECT_INFO_LABELS.END_DATE}
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(projectDetail.duration?.to)}
                  </div>
                </div>
              </div>

              {/* Technical Lead Section */}
              <div className="mt-6">
                <div className="text-sm text-gray-500 flex items-center mb-2">
                  <FaUserTie className="text-blue-600 mr-2" /> {PROJECT_INFO_LABELS.TECHNICAL_LEAD}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(projectDetail.technical_lead) ? (
                    projectDetail.technical_lead.map((lead, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700"
                      >
                        {lead.user_name}
                      </div>
                    ))
                  ) : projectDetail.technical_lead?.user_name ? (
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
                      {projectDetail.technical_lead.user_name}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      {MESSAGE_STRINGS.NO_TECH_LEAD}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaClipboard className="mr-2 text-blue-600" /> {SECTION_HEADERS.STATUS_INFORMATION}
              </h3>

              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="w-36 h-36 md:w-48 md:h-48 my-4">
                  <StatusChart status={projectDetail.status} />
                </div>

                <p className="text-center text-gray-600 mt-6 max-w-md">
                  {STATUS_STRINGS.CURRENT_STATUS_TEXT.replace('{status}', formatStatusText(projectDetail.status))}
                </p>
              </div>
            </div>
          </div>

          {/* Team Members & Description Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Team Members */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-2 text-blue-600" /> {SECTION_HEADERS.TEAM_MEMBERS}
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: <FaUserTie className="text-purple-600" />,
                    title: TEAM_MEMBER_LABELS.TECHNICAL_CONSULTANCY,
                    value: projectDetail.technical_consultancy,
                  },
                  {
                    icon: <FaUserCheck className="text-blue-600" />,
                    title: TEAM_MEMBER_LABELS.BA,
                    value: projectDetail.ba,
                  },
                  {
                    icon: <FaUserCheck className="text-green-600" />,
                    title: TEAM_MEMBER_LABELS.QA,
                    value: projectDetail.qa,
                  },
                  {
                    icon: <FaUserTie className="text-yellow-600" />,
                    title: TEAM_MEMBER_LABELS.PM,
                    value: projectDetail.pm,
                  },
                  {
                    icon: <FaCode className="text-indigo-600" />,
                    title: TEAM_MEMBER_LABELS.DEVELOPERS,
                    value: projectDetail.developers,
                  },
                  {
                    icon: <FaUserCheck className="text-teal-600" />,
                    title: TEAM_MEMBER_LABELS.TESTERS,
                    value: projectDetail.testers,
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-2">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 font-medium">
                        {item.title}
                      </div>
                      <div className="text-gray-900 mt-1">
                        {Array.isArray(item.value) ? (
                          item.value.map((person, i) => (
                            <span
                              key={i}
                              className="inline-block bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 mr-2 mb-2"
                            >
                              {person.user_name}
                            </span>
                          ))
                        ) : item.value?.user_name ? (
                          <span className="inline-block bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1.5 text-sm font-medium text-gray-700">
                            {item.value.user_name}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic text-sm">
                            {MESSAGE_STRINGS.NOT_ASSIGNED}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaClipboard className="mr-2 text-blue-600" /> {SECTION_HEADERS.PROJECT_DESCRIPTION}
              </h3>

              <div className="flex-1 overflow-auto p-2 min-h-[200px]">
                {projectDetail.description ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {projectDetail.description}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 italic">
                    <p className="text-center">
                      {MESSAGE_STRINGS.NO_DESCRIPTION}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" /> {BUTTON_STRINGS.BACK}
            </button>
            <button
              onClick={handleToggleStatus}
              className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${getStatusButtonClass(projectDetail.status)}`}
            >
              {projectDetail.status ? (
                <FaTimesCircle className="mr-2" />
              ) : (
                <FaCheckCircle className="mr-2" />
              )}
              {getStatusButtonText(projectDetail.status)}
            </button>

            <button
              onClick={() => setIsPopupOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <FaEdit className="mr-2" /> {BUTTON_STRINGS.UPDATE_PROJECT}
            </button>
          </div>
        </div>
      </div>

      {/* Popup for Updating Project */}
      {isPopupOpen && (
        <PopupProjectInfo
          initialData={projectDetail}
          onClose={handlePopupClose}
          onUpdate={handleUpdateProject}
          readOnlyFields={["_id"]}
        />
      )}

      {/* Modal for status change confirmation */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        actionType={newStatus ? ACTION_TYPES.ACTIVATE : ACTION_TYPES.DEACTIVATE}
        source="ProjectDetail"
      />
    </div>
  );
};

export default ProjectDetail;
