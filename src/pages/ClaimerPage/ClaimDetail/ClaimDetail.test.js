import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ClaimDetail from './ClaimDetail';
import { fetchClaimDetailRequest, updateClaimRequest } from '../../../redux/actions/claimerActions';
import { getCommentsRequest } from '../../../redux/actions/commentAction';

// Mock redux actions
jest.mock('../../../redux/actions/claimerActions', () => ({
    fetchClaimDetailRequest: jest.fn(() => ({ type: 'FETCH_CLAIM_DETAIL_REQUEST' })),
    updateClaimRequest: jest.fn(() => ({ type: 'UPDATE_CLAIM_REQUEST' })),
    resetUpdateState: jest.fn(() => ({ type: 'RESET_UPDATE_STATE' })),
    claimerRemoveProcessedClaims: jest.fn(),
    bulkUpdateClaimRequest: jest.fn(),
}));

jest.mock('../../../redux/actions/commentAction', () => ({
    getCommentsRequest: jest.fn(() => ({ type: 'GET_COMMENTS_REQUEST' })),
    createCommentRequest: jest.fn(),
    replyCommentRequest: jest.fn(),
}));

// Mock components
jest.mock('../../../components/Popup/UpdateClaimForm', () => {
    return function MockUpdateClaimForm({ onClose, onSubmit }) {
        return (
            <div data-testid="update-claim-form">
                <button onClick={() => onSubmit({ from: '2023-01-01', to: '2023-01-02', total_no_of_hours: 8, reason_claimer: 'Test reason' })}>
                    Submit Form
                </button>
                <button onClick={onClose}>Close</button>
            </div>
        );
    };
});

jest.mock('../ClaimModal/ClaimModal', () => {
    return function MockClaimModal({ onClose, onConfirm }) {
        return (
            <div data-testid="claim-modal">
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        );
    };
});

// Mock the router
const renderWithRouter = (ui, { route = '/claim/123' } = {}) => {
    window.history.pushState({}, 'Test page', route);

    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/claim/:id" element={ui} />
            </Routes>
        </MemoryRouter>
    );
};

// Create mockStore
const mockStore = configureStore();

// Mock localStorage
beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn(key => {
                if (key === 'user') return JSON.stringify({ _id: 'user123' });
                if (key === 'role') return 'Approver';
                return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        },
        writable: true
    });
});

describe('ClaimDetail Component', () => {
    let store;
    const mockClaim = {
        _id: '123',
        status: 'Pending',
        staff: 'John Doe',
        project: 'Project X',
        hours: 8,
        duration: '2 days',
        from: '2023-01-01',
        to: '2023-01-02',
        reason_claimer: 'Work on feature X'
    };

    const mockComments = [
        {
            _id: 'comment1',
            content: 'This is a comment',
            user_id: {
                _id: 'user456',
                user_name: 'Jane Smith',
                avatar: null,
                role_id: { name: 'Admin' }
            },
            createdAt: '2023-01-02T10:00:00.000Z',
            replies: []
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        store = mockStore({
            claimer: {
                claimDetail: mockClaim,
                loading: false,
                error: null,
                updateClaimSuccess: false,
                updateClaimLoading: false
            },
            comment: {
                comments: mockComments,
                loadingComment: false,
                errorComment: null
            }
        });
    });

    // FUNCTIONAL TESTS

    // Test 1: Function - Dispatches fetchClaimDetailRequest on component mount
    test('Dispatches fetchClaimDetailRequest action when component mounts', () => {
        renderWithRouter(
            <Provider store={store}>
                <ClaimDetail />
            </Provider>
        );

        expect(fetchClaimDetailRequest).toHaveBeenCalledTimes(1);
        expect(fetchClaimDetailRequest).toHaveBeenCalledWith('123');
    });

    // Test 2: Function - Handles update claim functionality
    test('Handles update claim functionality when update button is clicked', async () => {
        // Mock draft status
        const draftStore = mockStore({
            claimer: {
                claimDetail: { ...mockClaim, status: 'Draft' },
                loading: false,
                error: null,
                updateClaimSuccess: false,
                updateClaimLoading: false
            },
            comment: {
                comments: [],
                loadingComment: false,
                errorComment: null
            }
        });

        renderWithRouter(
            <Provider store={draftStore}>
                <ClaimDetail />
            </Provider>
        );

        // Click the update button
        fireEvent.click(screen.getByText('Update'));

        // Check if update form is displayed
        expect(screen.getByTestId('update-claim-form')).toBeInTheDocument();

        // Submit the form
        fireEvent.click(screen.getByText('Submit Form'));

        // Verify updateClaimRequest was called with correct params
        expect(updateClaimRequest).toHaveBeenCalledWith('123', {
            from: '2023-01-01',
            to: '2023-01-02',
            total_no_of_hours: 8,
            reason_claimer: 'Test reason'
        });
    });

    // UI TESTS

    // Test 3: UI - Renders claim details correctly
    test('Renders claim details correctly', () => {
        renderWithRouter(
            <Provider store={store}>
                <ClaimDetail />
            </Provider>
        );

        // Check if key information is displayed
        expect(screen.getByText('Claim Detailed Information')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Project X')).toBeInTheDocument();
        expect(screen.getByText('8 hrs')).toBeInTheDocument();
        expect(screen.getByText('2 days')).toBeInTheDocument();

        // Fix: Use getByRole to target the status element with specific role or testid
        // Alternatively, use a more specific query
        expect(screen.getByText('Pending', { selector: 'p.font-semibold.text-yellow-500' })).toBeInTheDocument();
    });

    // Test 4: UI - Displays claim status correctly
    test('Displays claim status correctly', () => {
        renderWithRouter(
            <Provider store={store}>
                <ClaimDetail />
            </Provider>
        );

        // Wait for the component to load (avoid loading state)
        waitFor(() => {
            // Check if status label is displayed
            expect(screen.getByText('Status')).toBeInTheDocument();

            // Check if one of the possible status values is in the document
            const statusElement = screen.getByText(
                (content, element) => {
                    return ['Draft', 'Pending', 'Approved', 'Rejected', 'Paid', 'Cancelled'].includes(content);
                }
            );
            expect(statusElement).toBeInTheDocument();

            // Verify status has the correct styling class
            const statusContainer = statusElement.closest('p');
            expect(statusContainer).toHaveClass(/text-(yellow|green|red|blue|pink|gray)-500/);
        });
    });

    // Test 5: UI - Renders different actions based on claim status
    test('Renders different actions based on claim status', () => {
        // First render with Draft status
        const draftStore = mockStore({
            claimer: {
                claimDetail: { ...mockClaim, status: 'Draft' },
                loading: false,
                error: null,
                updateClaimSuccess: false,
                updateClaimLoading: false
            },
            comment: {
                comments: [],
                loadingComment: false,
                errorComment: null
            }
        });

        const { unmount } = renderWithRouter(
            <Provider store={draftStore}>
                <ClaimDetail />
            </Provider>
        );

        // Draft status should show these buttons
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Update')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();

        unmount();

        // Then render with Pending status
        renderWithRouter(
            <Provider store={store}>
                <ClaimDetail />
            </Provider>
        );

        // Fix: Use a more specific selector for the Back button
        // Option 1: Use an exact selector if we know the button's role
        expect(screen.getByText('Back', { selector: 'button.w-full.sm\\:w-auto' })).toBeInTheDocument();

        // Option 2: Use getAllByText and check the first or last instance
        // const backButtons = screen.getAllByText('Back');
        // expect(backButtons[backButtons.length - 1]).toBeInTheDocument(); // Get the last "Back" button

        expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
});