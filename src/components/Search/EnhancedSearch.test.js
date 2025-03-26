import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnhancedSearch from "./EnhancedSearch";
import { MemoryRouter } from "react-router-dom";

// Mock the useLocation hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "/claims",
  }),
}));

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock console methods to reduce test noise
console.log = jest.fn();
console.error = jest.fn();

describe("EnhancedSearch Component", () => {
  // Helper function to render the component with necessary providers
  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <EnhancedSearch
          onSearch={jest.fn()}
          activeFilters={[]}
          onRemoveFilter={jest.fn()}
          {...props}
        />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  // Test 1: Basic rendering
  test("renders the search component correctly", () => {
    renderComponent();

    // Check if the search input is rendered (using input role)
    const searchInputs = screen.getAllByRole("textbox");
    expect(searchInputs.length).toBeGreaterThan(0);

    // Check if the field selector is rendered
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    // Check for advanced search icon
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  // Test 2: Testing search functionality
  test("performs search when the form is submitted", async () => {
    const mockOnSearch = jest.fn();
    renderComponent({ onSearch: mockOnSearch });

    // Type in the search input (find it by its role)
    const searchInput = screen.getAllByRole("textbox")[0]; // Get first textbox
    await userEvent.type(searchInput, "test query");

    // Select a search field
    const fieldSelector = screen.getByRole("combobox");
    await userEvent.selectOptions(fieldSelector, "staff");

    // Submit the form
    const form = screen.getByRole("form", { hidden: true });
    fireEvent.submit(form);

    // Verify that onSearch was called with the correct parameters
    expect(mockOnSearch).toHaveBeenCalledWith({
      term: "test query",
      field: "staff",
      dateFrom: "",
      dateTo: "",
    });
  });

  // Test 3: Testing toggling the advanced search panel
  test("toggles advanced search panel when advanced search button is clicked", async () => {
    renderComponent();

    // Find the advanced search button by its aria-label
    const advancedSearchButton = screen.getByLabelText("Advanced search");

    // Click the button to open the panel
    await userEvent.click(advancedSearchButton);

    // Check if the advanced search panel is displayed
    expect(screen.getByText("Date Range")).toBeInTheDocument();

    // Click again to close
    await userEvent.click(advancedSearchButton);

    // Check if the panel is no longer visible
    await waitFor(() => {
      expect(screen.queryByText("Date Range")).not.toBeInTheDocument();
    });
  });

  // Test 4: Testing advanced search functionality
  test("toggles and uses advanced search filters", async () => {
    const mockOnSearch = jest.fn();
    renderComponent({ onSearch: mockOnSearch });

    // Find the advanced search button by its aria-label
    const advancedSearchButton = screen.getByLabelText("Advanced search");
    await userEvent.click(advancedSearchButton);

    // Check if the advanced search panel is displayed
    expect(screen.getByText("Date Range")).toBeInTheDocument();

    // Find date inputs by their labels
    const dateFromInput = screen.getByLabelText("From date");
    const dateToInput = screen.getByLabelText("To date");

    // Input dates
    await userEvent.type(dateFromInput, "2023-01-01");
    await userEvent.type(dateToInput, "2023-12-31");

    // Click the apply filters button
    await userEvent.click(screen.getByText("Apply Filters"));

    // Verify onSearch was called with correct parameters
    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: "2023-01-01",
        dateTo: "2023-12-31",
      })
    );
  });

  // Test 5: Testing date validation functionality (function test)
  test("validates and swaps dates when from date is after to date", async () => {
    const mockOnSearch = jest.fn();
    renderComponent({ onSearch: mockOnSearch });

    // Find the advanced search button by its aria-label
    const advancedSearchButton = screen.getByLabelText("Advanced search");
    await userEvent.click(advancedSearchButton);

    // Find date inputs by their labels
    const dateFromInput = screen.getByLabelText("From date");
    const dateToInput = screen.getByLabelText("To date");

    // Set inverted date range (from date after to date)
    await userEvent.type(dateFromInput, "2023-12-31");
    await userEvent.type(dateToInput, "2023-01-01");

    // Check if the warning message appears
    expect(
      screen.getByText("Dates will be automatically reordered when applied.")
    ).toBeInTheDocument();

    // Click the apply filters button
    await userEvent.click(screen.getByText("Apply Filters"));

    // Verify onSearch was called with swapped parameters
    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: "2023-01-01",
        dateTo: "2023-12-31",
      })
    );
  });

  // Test 6: Testing reset functionality in advanced search (function test)
  test("resets advanced search filters when reset button is clicked", async () => {
    renderComponent();

    // Find the advanced search button by its aria-label
    const advancedSearchButton = screen.getByLabelText("Advanced search");
    await userEvent.click(advancedSearchButton);

    // Find date inputs by their labels
    const dateFromInput = screen.getByLabelText("From date");
    const dateToInput = screen.getByLabelText("To date");

    // Set some date values
    await userEvent.type(dateFromInput, "2023-01-01");
    await userEvent.type(dateToInput, "2023-12-31");

    // Check that the values were entered
    expect(dateFromInput).toHaveValue("2023-01-01");
    expect(dateToInput).toHaveValue("2023-12-31");

    // Click the reset button
    await userEvent.click(screen.getByText("Reset"));

    // Verify date inputs are cleared
    expect(dateFromInput).toHaveValue("");
    expect(dateToInput).toHaveValue("");
  });
});
