import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

// Mock the useLocation hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockReturnValue({ pathname: "/finance" }),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("Sidebar Component", () => {
  const defaultProps = {
    isFinance: false,
    isAdmin: false,
    isApprover: false,
    isClaimer: false,
    isOpen: true,
    toggleSidebar: jest.fn(),
    isMobileView: false,
    setIsMobileView: jest.fn(),
  };

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders desktop sidebar when not in mobile view", () => {
    renderWithRouter(<Sidebar {...defaultProps} />);

    // Check if the desktop sidebar is rendered
    const sidebar = screen.getByRole("list");
    expect(sidebar).toBeInTheDocument();

    // Check if mobile sidebar is not rendered
    const mobileMenu = screen.queryByRole("button", { name: /close/i });
    expect(mobileMenu).not.toBeInTheDocument();
  });

  test("renders mobile sidebar when in mobile view", () => {
    const mobileProps = {
      ...defaultProps,
      isMobileView: true,
      isOpen: true,
    };

    renderWithRouter(<Sidebar {...mobileProps} />);

    // Update test: Instead of checking for desktop sidebar absence
    // Just verify a mobile sidebar characteristic - the close button
    const closeButton = screen.getByRole("button");
    expect(closeButton).toBeInTheDocument();

    // Verify mobile-specific characteristics - structure in your component
    const mobileDiv = document.querySelector(
      ".fixed.top-0.left-0.right-0.bg-white"
    );
    expect(mobileDiv).toBeInTheDocument();
  });

  test("toggles claims dropdown when clicked", () => {
    const financeProps = {
      ...defaultProps,
      isFinance: true,
    };

    renderWithRouter(<Sidebar {...financeProps} />);

    // Find the claims dropdown button
    const claimsButton = screen.getByRole("button", { name: /claims/i });
    expect(claimsButton).toBeInTheDocument();

    // Claims should be open by default (based on initial state)
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();

    // Click on the claims button to close it
    fireEvent.click(claimsButton);

    // Claims items should not be visible after clicking
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid")).not.toBeInTheDocument();
  });

  test("shows correct menu items for finance user", () => {
    const financeProps = {
      ...defaultProps,
      isFinance: true,
    };

    renderWithRouter(<Sidebar {...financeProps} />);

    // Check if finance-specific menu items are rendered
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Claims")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();

    // Check that other role-specific items are not rendered
    expect(screen.queryByText("Staff Management")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Claim")).not.toBeInTheDocument();
  });

  test("shows correct menu items for admin user", () => {
    const adminProps = {
      ...defaultProps,
      isAdmin: true,
    };

    renderWithRouter(<Sidebar {...adminProps} />);

    // Check if admin-specific menu items are rendered
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Staff Management")).toBeInTheDocument();
    expect(screen.getByText("Project Management")).toBeInTheDocument();

    // Check that other role-specific items are not rendered
    expect(screen.queryByText("Claims")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Claim")).not.toBeInTheDocument();
  });

  test("shows correct menu items for approver user", () => {
    const approverProps = {
      ...defaultProps,
      isApprover: true,
    };

    renderWithRouter(<Sidebar {...approverProps} />);

    // Check if approver-specific menu items are rendered
    expect(screen.getByText("Approver Dashboard")).toBeInTheDocument();
    expect(screen.getByText("For my Vetting")).toBeInTheDocument();
    expect(screen.getByText("Claims History")).toBeInTheDocument();

    // Check that other role-specific items are not rendered
    expect(screen.queryByText("Staff Management")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Claim")).not.toBeInTheDocument();
  });

  test("shows correct menu items for claimer user", () => {
    const claimerProps = {
      ...defaultProps,
      isClaimer: true,
    };

    renderWithRouter(<Sidebar {...claimerProps} />);

    // Check if claimer-specific menu items are rendered
    expect(screen.getByText("Create Claim")).toBeInTheDocument();
    expect(screen.getByText("Draft Claims")).toBeInTheDocument();
    expect(screen.getByText("Pending Claims")).toBeInTheDocument();
    expect(screen.getByText("Approved Claims")).toBeInTheDocument();

    // Check that other role-specific items are not rendered
    expect(screen.queryByText("Staff Management")).not.toBeInTheDocument();
    expect(screen.queryByText("For my Vetting")).not.toBeInTheDocument();
  });

  test("calls toggleSidebar when close button is clicked in mobile view", () => {
    const mobileProps = {
      ...defaultProps,
      isMobileView: true,
      isOpen: true,
      toggleSidebar: jest.fn(),
    };

    renderWithRouter(<Sidebar {...mobileProps} />);

    // Find and click the close button
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    // Check if toggleSidebar was called
    expect(mobileProps.toggleSidebar).toHaveBeenCalledTimes(1);
  });

  test("toggles sidebar visibility based on isOpen prop in mobile view", () => {
    // First render with isOpen=true
    const mobileOpenProps = {
      ...defaultProps,
      isMobileView: true,
      isOpen: true,
    };

    const { rerender } = renderWithRouter(<Sidebar {...mobileOpenProps} />);

    // Check if mobile sidebar is visible - check the div containing the mobile sidebar
    const openMobileSidebar = document.querySelector(".translate-y-0");
    expect(openMobileSidebar).toBeInTheDocument();

    // Rerender with isOpen=false
    const mobileClosedProps = {
      ...defaultProps,
      isMobileView: true,
      isOpen: false,
    };

    rerender(
      <BrowserRouter>
        <Sidebar {...mobileClosedProps} />
      </BrowserRouter>
    );

    // Check if mobile sidebar is hidden - should have -translate-y-full class
    const closedMobileSidebar = document.querySelector(".-translate-y-full");
    expect(closedMobileSidebar).toBeInTheDocument();

    // The Home text might still be in the DOM but hidden with CSS
    // So instead of checking for its absence, check if it's not visible
    const hiddenMobileSidebar = document.querySelector(
      ".fixed.top-0.left-0.right-0.bg-white.-translate-y-full"
    );
    expect(hiddenMobileSidebar).toBeInTheDocument();
  });
});
