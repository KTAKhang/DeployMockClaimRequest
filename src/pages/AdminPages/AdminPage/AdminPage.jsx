import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaProjectDiagram,
} from "react-icons/fa";
import Chart from "react-apexcharts";

import { getStaffAll } from "../../../redux/actions/staffActions";
import { getProjectsAll } from "../../../redux/actions/projectActions";
import Loading from "../../../components/Loading/Loading";

import * as CONSTANTS from "./constants";
import * as STRINGS from "./strings";
import * as UTILS from "./utils";

export default function AdminPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { staffAll, loading: staffLoading } = useSelector(
    (state) => state.staff
  );
  const { projectsAll, loading: projectLoading } = useSelector(
    (state) => state.projects
  );

  const [employeeList, setEmployeeList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [staffPage, setStaffPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [chartWidth, setChartWidth] = useState(300);
  const itemsPerPage = CONSTANTS.PAGINATION.ITEMS_PER_PAGE;

  // Responsive chart size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setChartWidth(width < 640 ? 240 : 300);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(getStaffAll());
    dispatch(getProjectsAll());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(staffAll?.data)) {
      setEmployeeList(staffAll.data);
    }
    if (Array.isArray(projectsAll?.data)) {
      setProjectList(projectsAll.data);
    }
  }, [staffAll, projectsAll]);

  const totalActiveEmployees = employeeList.filter(
    (emp) => emp.status === "Active" || emp.status === true
  ).length;
  const totalProject = projectList.length;

  const { completedProjects, inProgressProjects } =
    UTILS.filterProjectsByStatus(projectList);

  const chartOptions = {
    labels: CONSTANTS.CHART_OPTIONS.LABELS,
    colors: [
      CONSTANTS.COLORS.PROJECT_STATUS.COMPLETED,
      CONSTANTS.COLORS.PROJECT_STATUS.IN_PROGRESS,
    ],
    legend: {
      position: CONSTANTS.CHART_OPTIONS.LEGEND.POSITION,
      horizontalAlign: CONSTANTS.CHART_OPTIONS.LEGEND.HORIZONTAL_ALIGN,
      fontSize: CONSTANTS.CHART_OPTIONS.LEGEND.FONT_SIZE,
      offsetY: CONSTANTS.CHART_OPTIONS.LEGEND.OFFSET_Y,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            fontSize: CONSTANTS.CHART_OPTIONS.LEGEND.MOBILE_FONT_SIZE,
          },
        },
      },
    ],
  };

  const chartSeries = [completedProjects, inProgressProjects];

  // Pagination for projects
  const paginatedProjects = UTILS.paginateItems(
    projectList,
    projectPage,
    itemsPerPage
  );

  // Pagination for staff
  const paginatedEmployees = UTILS.paginateItems(
    employeeList,
    staffPage,
    itemsPerPage
  );

  const totalProjectPages = Math.ceil(totalProject / itemsPerPage) || 1;
  const totalStaffPages = Math.ceil(employeeList.length / itemsPerPage) || 1;

  return (
    <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl border overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center p-4 sm:p-6 border-b">
          {STRINGS.LABELS.ADMIN_WELCOME}
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6">
          <button
            className="bg-gradient-to-r from-blue-50 to-blue-100 text-base sm:text-lg font-bold p-4 sm:p-6 rounded-xl shadow-md w-full hover:shadow-lg transition duration-300 flex items-center"
            onClick={() => navigate(CONSTANTS.ROUTES.ADMIN_PROJECT)}
          >
            <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
              <FaProjectDiagram size={20} />
            </div>
            <div className="text-left">
              <p className="text-gray-600">{STRINGS.LABELS.TOTAL_PROJECTS}</p>
              <p className="text-xl sm:text-2xl text-gray-800">
                {totalProject}
              </p>
            </div>
          </button>
          <button
            className="bg-gradient-to-r from-green-50 to-green-100 text-base sm:text-lg font-bold p-4 sm:p-6 rounded-xl shadow-md w-full hover:shadow-lg transition duration-300 flex items-center"
            onClick={() => navigate(CONSTANTS.ROUTES.ADMIN_STAFF)}
          >
            <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
              <FaUsers size={20} />
            </div>
            <div className="text-left">
              <p className="text-gray-600">{STRINGS.LABELS.ACTIVE_STAFF}</p>
              <p className="text-xl sm:text-2xl text-gray-800">
                {totalActiveEmployees}
              </p>
            </div>
          </button>
        </div>

        {/* Chart & Project Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6">
          {/* Chart */}
          <div className="bg-gray-50 shadow-md p-4 rounded-xl flex flex-col items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4 w-full text-center">
              {STRINGS.LABELS.PROJECT_STATUS_OVERVIEW}
            </h2>
            {projectLoading ? (
              <div className="mt-20">
                <Loading message={STRINGS.LABELS.LOADING.CHART} />
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="pie"
                  width={chartWidth}
                />
              </div>
            )}
          </div>

          {/* Project Table */}
          <div className="bg-gray-50 shadow-md p-4 rounded-xl">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4">
              {STRINGS.LABELS.PROJECT_MANAGEMENT}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-gray-700 text-xs sm:text-sm">
                <thead className="bg-gray-200 text-gray-600">
                  <tr className="border-b">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      {STRINGS.LABELS.PROJECT_TABLE_HEADERS.ID}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      {STRINGS.LABELS.PROJECT_TABLE_HEADERS.PROJECT_NAME}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      {STRINGS.LABELS.PROJECT_TABLE_HEADERS.STATUS}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project, index) => (
                    <tr key={index} className="border-b h-10 sm:h-12">
                      {project ? (
                        <>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            {project._id?.slice(0, 5)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 truncate whitespace-nowrap overflow-hidden max-w-[120px] sm:max-w-[200px]">
                            {project.project_name}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span
                              className={
                                project.status
                                  ? `${CONSTANTS.COLORS.EMPLOYEE_STATUS.ACTIVE.BACKGROUND} ${CONSTANTS.COLORS.EMPLOYEE_STATUS.ACTIVE.TEXT} px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium`
                                  : `bg-yellow-200 text-yellow-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium`
                              }
                            >
                              {project.status
                                ? STRINGS.LABELS.PROJECT_STATUS.COMPLETED
                                : STRINGS.LABELS.PROJECT_STATUS.IN_PROGRESS}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan="3"></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center mt-3 text-sm">
              <button
                onClick={() => setProjectPage(Math.max(1, projectPage - 1))}
                className="p-1 rounded hover:bg-gray-200"
                disabled={projectPage === 1}
              >
                <FaChevronLeft size={14} />
              </button>
              <span className="mx-3">
                {projectPage} / {totalProjectPages}
              </span>
              <button
                onClick={() =>
                  setProjectPage(Math.min(totalProjectPages, projectPage + 1))
                }
                className="p-1 rounded hover:bg-gray-200"
                disabled={projectPage === totalProjectPages}
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-gray-50 shadow-md p-4 m-4 sm:m-6 rounded-xl">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4">
            {STRINGS.LABELS.STAFF_MANAGEMENT}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 sm:p-3 text-left">
                    {STRINGS.LABELS.STAFF_TABLE_HEADERS.ID}
                  </th>
                  <th className="p-2 sm:p-3 text-left">
                    {STRINGS.LABELS.STAFF_TABLE_HEADERS.NAME}
                  </th>
                  <th className="p-2 sm:p-3 text-left">
                    {STRINGS.LABELS.STAFF_TABLE_HEADERS.ROLE}
                  </th>
                  <th className="p-2 sm:p-3 text-left">
                    {STRINGS.LABELS.STAFF_TABLE_HEADERS.STATUS}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee, index) => (
                  <tr key={index} className="border-t h-10 sm:h-12">
                    {employee ? (
                      <>
                        <td className="p-2 sm:p-3">
                          {employee._id?.slice(0, 5)}
                        </td>
                        <td className="p-2 sm:p-3 truncate max-w-[80px] sm:max-w-full">
                          {employee.user_name}
                        </td>
                        <td className="p-2 sm:p-3 truncate max-w-[60px] sm:max-w-full">
                          {employee.role_name}
                        </td>
                        <td className="p-2 sm:p-3">
                          <span
                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium 
                            ${
                              employee.status
                                ? `${CONSTANTS.COLORS.EMPLOYEE_STATUS.ACTIVE.BACKGROUND} ${CONSTANTS.COLORS.EMPLOYEE_STATUS.ACTIVE.TEXT}`
                                : `${CONSTANTS.COLORS.EMPLOYEE_STATUS.INACTIVE.BACKGROUND} ${CONSTANTS.COLORS.EMPLOYEE_STATUS.INACTIVE.TEXT}`
                            }`}
                          >
                            {employee.status
                              ? STRINGS.LABELS.EMPLOYEE_STATUS.ACTIVE
                              : STRINGS.LABELS.EMPLOYEE_STATUS.INACTIVE}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan="4"></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-3 text-sm">
            <button
              onClick={() => setStaffPage(Math.max(1, staffPage - 1))}
              className="p-1 rounded hover:bg-gray-200"
              disabled={staffPage === 1}
            >
              <FaChevronLeft size={14} />
            </button>
            <span className="mx-3">
              {staffPage} / {totalStaffPages}
            </span>
            <button
              onClick={() =>
                setStaffPage(Math.min(totalStaffPages, staffPage + 1))
              }
              className="p-1 rounded hover:bg-gray-200"
              disabled={staffPage === totalStaffPages}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
