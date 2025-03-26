import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaProjectDiagram,
} from "react-icons/fa";
import { getStaffAll } from "../../../redux/actions/staffActions";
import { getProjectsAll } from "../../../redux/actions/projectActions";
import Chart from "react-apexcharts";
import Loading from "../../../components/Loading/Loading";

export default function AdminHome() {
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
  const itemsPerPage = 4;

  // Responsive chart size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChartWidth(240);
      } else {
        setChartWidth(300);
      }
    };

    handleResize(); // Set initial size
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

  const completedProjects = projectList.filter((p) => p.status === true).length;
  const inProgressProjects = projectList.filter(
    (p) => p.status === false
  ).length;

  const chartOptions = {
    labels: ["Completed", "In Progress"],
    colors: ["#22c55e", "#facc15"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      offsetY: 5,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            fontSize: "12px",
          },
        },
      },
    ],
  };

  const chartSeries = [completedProjects, inProgressProjects];

  // Pagination for projects
  const totalProjectPages = Math.ceil(totalProject / itemsPerPage) || 1;
  let paginatedProjects = projectList.slice(
    (projectPage - 1) * itemsPerPage,
    projectPage * itemsPerPage
  );
  while (paginatedProjects.length < itemsPerPage) paginatedProjects.push(null);

  // Pagination for staff
  const totalStaffPages = Math.ceil(employeeList.length / itemsPerPage) || 1;
  let paginatedEmployees = employeeList.slice(
    (staffPage - 1) * itemsPerPage,
    staffPage * itemsPerPage
  );
  while (paginatedEmployees.length < itemsPerPage)
    paginatedEmployees.push(null);

  return (
    <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl border overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center p-4 sm:p-6 border-b">
          Welcome Admin
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6">
          <button
            className="bg-gradient-to-r from-blue-50 to-blue-100 text-base sm:text-lg font-bold p-4 sm:p-6 rounded-xl shadow-md w-full hover:shadow-lg transition duration-300 flex items-center"
            onClick={() => navigate("/admin/project")}
          >
            <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
              <FaProjectDiagram size={20} />
            </div>
            <div className="text-left">
              <p className="text-gray-600">Total Projects</p>
              <p className="text-xl sm:text-2xl text-gray-800">
                {totalProject}
              </p>
            </div>
          </button>
          <button
            className="bg-gradient-to-r from-green-50 to-green-100 text-base sm:text-lg font-bold p-4 sm:p-6 rounded-xl shadow-md w-full hover:shadow-lg transition duration-300 flex items-center"
            onClick={() => navigate("/admin/staff")}
          >
            <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
              <FaUsers size={20} />
            </div>
            <div className="text-left">
              <p className="text-gray-600">Active Staff</p>
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
              Project Status Overview
            </h2>
            {projectLoading ? (
              <div className="mt-20">
              <Loading message="Loading chart..." />
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
              Project Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-gray-700 text-xs sm:text-sm">
                <thead className="bg-gray-200 text-gray-600">
                  <tr className="border-b">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Project Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Status
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
                                  ? "bg-green-200 text-green-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium"
                                  : "bg-yellow-200 text-yellow-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium"
                              }
                            >
                              {project.status ? "Completed" : "In Progress"}
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
            Staff Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 sm:p-3 text-left">ID</th>
                  <th className="p-2 sm:p-3 text-left">Name</th>
                  <th className="p-2 sm:p-3 text-left">Role</th>
                  <th className="p-2 sm:p-3 text-left">Status</th>
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
                                ? "bg-green-200 text-green-700"
                                : "bg-red-200 text-red-700"
                            }`}
                          >
                            {employee.status ? "Active" : "Inactive"}
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
