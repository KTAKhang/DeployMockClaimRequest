import { Navigate } from "react-router-dom";
import AuthenticatedRoute from "../components/AuthenticatedRoute/index";
import PrivateRoute from "../components/PrivateRouter/index";

import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/ProfilePages/ProfilePage";
import DefaultLayout from "../layout/DefaultLayout";
import PendingPage from "../pages/ClaimerPage/PendingPage/PendingPage";
import DraftPage from "../pages/ClaimerPage/DraftPage/DraftPage";
import CreateClaim from "../pages/ClaimerPage/CreateClaimsPage/CreateClaim";
import ClaimsLayout from "../layout/ClaimsLayout";
import AdminLayout from "../layout/AdminLayout";

// Admin Routes
import StaffManagement from "../pages/AdminPages/StaffManagerment/StaffManagerment";
import ProjectManagement from "../pages/AdminPages/ProjectManagerment/ProjectManagerment";
import AdminPage from "../pages/AdminPages/AdminPage/AdminPage";
import StaffDetail from "../pages/AdminPages/StaffDetail/StaffDetail";
import ProjectDetail from "../pages/AdminPages/ProjectDetail/ProjectDetail";
import ClaimDetail from "../pages/ClaimerPage/ClaimDetail/ClaimDetail"; // Ensure this stays

// Approver Routes
import Dashboard from "../pages/ApproverPages/Dashboard/Dashboard";
import ClaimsHistory from "../pages/ApproverPages/ClaimsHistory/ClaimsHistory";
import ForMyVetting from "../pages/ApproverPages/ForMyVetting/ForMyVetting";
import Detail from "../pages/ApproverPages/Detail/Detail";
import ApproverLayout from "../layout/ApproverLayout";
import FinanceLayout from "../layout/FinanceLayout";

// import UpdatePasswordPage from "../pages/UpdatePasswordPage";
import FinanceDashboardPage from "../pages/FinancePage/FinanceDashboardPage/FinanceDashboardPage";
import FinanceApprovedPage from "../pages/FinancePage/FinanceApprovedPage/FinanceApprovedPage";
import FinancePaidPage from "../pages/FinancePage/FinancePaidPage/FinancePaidPage";
import FinanceDetailPage from "../pages/FinancePage/FinanceDetailPage/FinanceDetailPage";
import RejectedClaims from "../pages/ClaimerPage/RejectedClaimsPage/RejectedClaimsPage";
import ApprovedClaims from "../pages/ClaimerPage/ApprovedClaimsPage/ApprovedClaimsPage";
import PaidClaims from "../pages/ClaimerPage/PaidClaimsPage/PaidClaimsPage";
import CancelPage from "../pages/ClaimerPage/CancelPage/CancelPage";

import ClaimManagerment from "../pages/AdminPages/ClaimManagerment/ClaimPages/ClaimManagerment";
import AdminClaimDetail from "../pages/AdminPages/ClaimManagerment/ClaimDetailPages/AdminClaimDetail";
import HomePage from "../pages/AuthPage/HomePage/HomePage";
import LoginPage from "../pages/AuthPage/LoginPage/LoginPage";
import ForgotPasswordPage from "../pages/AuthPage/ForgotPasswordPage/ForgotPasswordPage";
import VerifyCodePage from "../pages/AuthPage/VerifyCodePage/VerifyCodePage";
import ChangePasswordPage from "../pages/AuthPage/ChangePasswordPage/ChangePasswordPage";
import ClaimerDashboard from "../pages/ClaimerPage/Dashboard/ClaimerDashboard";

export const routes = [
  {
    path: "",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: (
          <AuthenticatedRoute>
            {({ isAuthenticated }) =>
              isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />
            }
          </AuthenticatedRoute>
        ),
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/verify-code", element: <VerifyCodePage /> },
      // { path: "/update-password", element: <UpdatePasswordPage /> },
    ],
  },
  {
    path: "/claimer",
    element: (
      <PrivateRoute requiredRole="Claimer">
        <ClaimsLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "", element: <ClaimerDashboard /> },
      { path: "dashboard", element: <ClaimerDashboard /> }, 
      { path: "create-claim", element: <CreateClaim /> },
      { path: "pending", element: <PendingPage /> },
      { path: "pending/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
      { path: "draft", element: <DraftPage /> },
      { path: "draft/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
      { path: "rejected", element: <RejectedClaims /> },
      { path: "rejected/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
      { path: "approved", element: <ApprovedClaims /> },
      { path: "approved/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
      { path: "paid", element: <PaidClaims /> },
      { path: "paid/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
      { path: "profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePasswordPage /> },
      { path: "cancelled", element: <CancelPage /> },
      { path: "cancelled/:id", element: <ClaimDetail /> }, // Using common ClaimDetail
    ],
  },
  {
    path: "/admin",
    element: (
      <PrivateRoute requiredRole="Administrator">
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "", element: <AdminPage /> },
      { path: "staff", element: <StaffManagement /> },
      { path: "staff/:id", element: <StaffDetail /> },
      { path: "project", element: <ProjectManagement /> },
      { path: "project/:id", element: <ProjectDetail /> },
      { path: "profile", element: <ProfilePage /> },
      {
        path: "change-password",
        element: <ChangePasswordPage />,
      },
      { path: "claim-management", element: <ClaimManagerment /> },
      { path: "claim-management/:id", element: <AdminClaimDetail /> },
    ],
  },
  {
    path: "/approver",
    element: (
      <PrivateRoute requiredRole="Approver">
        <ApproverLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "", element: <Dashboard /> },
      { path: "vetting", element: <ForMyVetting /> },
      { path: "vetting/:id", element: <Detail /> },
      { path: "history", element: <ClaimsHistory /> },
      { path: "history/:id", element: <Detail /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePasswordPage /> },
    ],
  },
  {
    path: "/finance",
    element: (
      <PrivateRoute requiredRole="Finance">
        <FinanceLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "", element: <FinanceDashboardPage /> },
      { path: "approved", element: <FinanceApprovedPage /> },
      { path: "paid", element: <FinancePaidPage /> },
      { path: "approved/:id", element: <FinanceDetailPage /> },
      { path: "paid/:id", element: <FinanceDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePasswordPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];
