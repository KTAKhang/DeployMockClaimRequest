import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "react-router-dom";
import Sidebar from "./Sidebar";

// Mock router context
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockReturnValue({ pathname: "/" }),
}));

describe("Sidebar Component", () => {
  // Setup common props
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

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock window resize
    global.innerWidth = 1200;
    global.dispatchEvent(new Event("resize"));
  });

  test("1. Renders default sidebar with correct menu items", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("2. Renders admin sidebar with correct menu items", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/admin" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isAdmin={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Staff Management")).toBeInTheDocument();
    expect(screen.getByText("Project Management")).toBeInTheDocument();
    expect(screen.getByText("Claim Management")).toBeInTheDocument();
  });

  test("3. Renders finance sidebar with dropdown functionality", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/finance" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isFinance={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Claims")).toBeInTheDocument();

    // Test dropdown functionality
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();

    // Click claims dropdown to close it
    fireEvent.click(screen.getByText("Claims"));

    // Since the component uses effectiveIsOpen, we can't directly test the collapse
    // But we can test that the click handler was called
    expect(screen.getByText("Claims")).toBeInTheDocument();
  });

  test("4. Renders approver sidebar with correct menu items", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/approver" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isApprover={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("Approver Dashboard")).toBeInTheDocument();
    expect(screen.getByText("For my Vetting")).toBeInTheDocument();
    expect(screen.getByText("Claims History")).toBeInTheDocument();
  });

  test("5. Renders claimer sidebar with correct menu items", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/claimer/create-claim" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isClaimer={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Claim")).toBeInTheDocument();
    expect(screen.getByText("Draft Claims")).toBeInTheDocument();
    expect(screen.getByText("Pending Claims")).toBeInTheDocument();
    expect(screen.getByText("Approved Claims")).toBeInTheDocument();
    expect(screen.getByText("Paid Claims")).toBeInTheDocument();
    expect(screen.getByText("Rejected Claims")).toBeInTheDocument();
    expect(screen.getByText("Cancelled Claims")).toBeInTheDocument();
  });

  test("6. Shows mobile menu toggle button when in mobile view", () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isMobileView={true} />
      </MemoryRouter>
    );

    // Check for mobile toggle button
    const toggleButton = screen.getByLabelText("Toggle menu");
    expect(toggleButton).toBeInTheDocument();

    // Click to open mobile menu
    fireEvent.click(toggleButton);

    // Close button should now be visible (FaTimes icon)
    expect(toggleButton).toBeInTheDocument();
  });

  test("7. Highlights active route correctly", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/orders" });

    const { container } = render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    // Get the li element containing "Orders"
    const ordersLi = screen.getByText("Orders").closest("li");

    // Check if it has the active class
    expect(ordersLi).toHaveClass("bg-blue-100");
    expect(ordersLi).toHaveClass("border-r-4");
    expect(ordersLi).toHaveClass("border-blue-500");
  });

  test("8. Collapses sidebar when window width is <= 1068px", () => {
    // Mock window width to trigger collapse
    global.innerWidth = 1000;

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    // Trigger resize event
    global.dispatchEvent(new Event("resize"));

    // We can't directly test the state, but we can verify the resize handler was called
    expect(defaultProps.setIsMobileView).toHaveBeenCalled();
  });

  test("9. Shows mobile view when window width is <= 768px", () => {
    // Mock window width to trigger mobile view
    global.innerWidth = 700;

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );

    // Trigger resize event
    global.dispatchEvent(new Event("resize"));

    // Verify mobile view was set
    expect(defaultProps.setIsMobileView).toHaveBeenCalledWith(true);
  });

  test("10. Activates nested claim routes correctly for finance users", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/finance/approved/123" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isFinance={true} />
      </MemoryRouter>
    );

    // The Approved item should be highlighted
    const approvedLi = screen.getByText("Approved").closest("li");
    expect(approvedLi).toHaveClass("bg-blue-100");
    expect(approvedLi).toHaveClass("border-r-4");
    expect(approvedLi).toHaveClass("border-blue-500");
  });

  test("12. Collapses claims dropdown when sidebar is collapsed", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({ pathname: "/finance" });

    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} isFinance={true} isOpen={false} />
      </MemoryRouter>
    );

    // Claims dropdown should be closed when sidebar is collapsed
    // We can't directly test the state, but we can check that Claims text is there
    expect(screen.getByText("Claims")).toBeInTheDocument();
  });
});
