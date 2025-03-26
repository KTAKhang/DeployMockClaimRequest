import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FinanceLayout from '../../src/layout/FinanceLayout';

// Mock the child components
jest.mock('../components/Navbar/Navbar', () => {
    return function MockNavbar({ toggleSidebar, isSidebarOpen, isMobileView }) {
        return (
            <div data-testid="navbar">
                <button data-testid="navbar-toggle" onClick={toggleSidebar}>
                    Toggle
                </button>
                <span data-testid="navbar-sidebar-state">{isSidebarOpen ? 'open' : 'closed'}</span>
                <span data-testid="navbar-mobile-state">{isMobileView ? 'mobile' : 'desktop'}</span>
            </div>
        );
    };
});

jest.mock('../components/Sidebar/Sidebar', () => {
    return function MockSidebar({ isFinance, isOpen, toggleSidebar, isMobileView }) {
        return (
            <div data-testid="sidebar" className={isOpen ? 'sidebar-open' : 'sidebar-closed'}>
                <span data-testid="sidebar-finance-state">{isFinance ? 'finance' : 'not-finance'}</span>
                <span data-testid="sidebar-state">{isOpen ? 'open' : 'closed'}</span>
                <span data-testid="sidebar-mobile-state">{isMobileView ? 'mobile' : 'desktop'}</span>
                <button data-testid="sidebar-toggle" onClick={toggleSidebar}>
                    Toggle
                </button>
            </div>
        );
    };
});

// Mock the Outlet component from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

// Helper to wrap the component with BrowserRouter
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('FinanceLayout Component', () => {
    beforeEach(() => {
        // Clear any window resize mocks between tests
        jest.clearAllMocks();

        // Reset window innerWidth to desktop size
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024 // Default to desktop view
        });
    });

    test('renders correctly with all child components', () => {
        renderWithRouter(<FinanceLayout />);

        // Check if all major components are rendered
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    test('sidebar should be open by default on desktop view', () => {
        renderWithRouter(<FinanceLayout />);

        // Check sidebar state
        expect(screen.getByTestId('sidebar-state').textContent).toBe('open');
        expect(screen.getByTestId('navbar-sidebar-state').textContent).toBe('open');
    });

    test('sidebar should toggle when navbar toggle button is clicked', () => {
        renderWithRouter(<FinanceLayout />);

        // Initial state
        expect(screen.getByTestId('sidebar-state').textContent).toBe('open');

        // Click toggle button
        fireEvent.click(screen.getByTestId('navbar-toggle'));

        // Check if sidebar is closed
        expect(screen.getByTestId('sidebar-state').textContent).toBe('closed');

        // Click toggle button again
        fireEvent.click(screen.getByTestId('navbar-toggle'));

        // Check if sidebar is open again
        expect(screen.getByTestId('sidebar-state').textContent).toBe('open');
    });

    test('sidebar should toggle when sidebar toggle button is clicked', () => {
        renderWithRouter(<FinanceLayout />);

        // Initial state
        expect(screen.getByTestId('sidebar-state').textContent).toBe('open');

        // Click toggle button
        fireEvent.click(screen.getByTestId('sidebar-toggle'));

        // Check if sidebar is closed
        expect(screen.getByTestId('sidebar-state').textContent).toBe('closed');
    });

    test('should start with sidebar closed in mobile view', () => {
        // Set to mobile width before rendering
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500
        });

        renderWithRouter(<FinanceLayout />);

        // Check if sidebar is closed and mobile view is detected
        expect(screen.getByTestId('sidebar-state').textContent).toBe('closed');
        expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('mobile');
    });

    test('should respond to window resize events', () => {
        // Start with desktop size
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });

        // Render once with desktop width
        const { unmount } = renderWithRouter(<FinanceLayout />);

        // Initial desktop state
        expect(screen.getByTestId('sidebar-state').textContent).toBe('open');
        expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('desktop');

        // Unmount and remount with mobile width to simulate a complete resize
        unmount();

        // Change to mobile width
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500
        });

        // Re-render with new window width
        renderWithRouter(<FinanceLayout />);

        // Check mobile state
        expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('mobile');
        expect(screen.getByTestId('sidebar-state').textContent).toBe('closed');
    });

    test('passes isFinance prop as true to Sidebar', () => {
        renderWithRouter(<FinanceLayout />);
        expect(screen.getByTestId('sidebar-finance-state').textContent).toBe('finance');
    });

    test('clean up resize event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const { unmount } = renderWithRouter(<FinanceLayout />);

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});