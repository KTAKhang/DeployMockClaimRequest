import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PaidClaims from './PaidClaimsPage';
import { fetchClaimsRequestClaimer } from '../../../redux/actions/claimerActions';

// Mock the ClaimsTable component
jest.mock('../../../components/Table/ClaimsTable', () => {
    return function MockClaimsTable({ title, claimsData }) {
        return (
            <div data-testid="claims-table">
                <h2>{title}</h2>
                <div data-testid="claims-count">{claimsData.length}</div>
            </div>
        );
    };
});

// Mock redux actions
jest.mock('../../../redux/actions/claimerActions', () => ({
    fetchClaimsRequestClaimer: jest.fn(() => ({ type: 'FETCH_CLAIMS_REQUEST' }))
}));

// Mock rootSaga
jest.mock('../../../redux/sagas/rootSaga', () => ({
    __esModule: true,
    default: function* mockRootSaga() {
        yield 1;
    }
}));

// Create mockStore without saga middleware
const mockStore = configureStore();

describe('PaidClaims Component', () => {
    let store;
    const mockClaims = [
        { id: 1, status: 'Paid', amount: 1000 },
        { id: 2, status: 'Draft', amount: 2000 },
        { id: 3, status: 'Paid', amount: 3000 },
        { id: 4, status: 'Approved', amount: 4000 },
        { id: 5, status: 'Pending', amount: 5000 },
    ];

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        store = mockStore({
            claimer: {
                claims: mockClaims,
                loading: false,
                error: null
            }
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    // Test 1: Function - Dispatch fetchClaimsRequestClaimer on component mount
    test('Dispatches fetchClaimsRequestClaimer action when component mounts', () => {
        render(
            <Provider store={store}>
                <PaidClaims />
            </Provider>
        );

        expect(fetchClaimsRequestClaimer).toHaveBeenCalledTimes(1);
        expect(fetchClaimsRequestClaimer).toHaveBeenCalledWith({});
    });

    // Test 2: Function - Filter claims with "Paid" status
    test('Filters claims with "Paid" status correctly', () => {
        render(
            <Provider store={store}>
                <PaidClaims />
            </Provider>
        );

        const expectedPaidClaims = mockClaims.filter(claim => claim.status === 'Paid');
        expect(screen.getByTestId('claims-count').textContent).toBe(expectedPaidClaims.length.toString());
    });

    // Test 3: UI - Renders page title correctly
    test('Renders page title correctly', () => {
        render(
            <Provider store={store}>
                <PaidClaims />
            </Provider>
        );

        expect(screen.getByText('Pages > Paid')).toBeInTheDocument();
    });

    // Test 4: UI - Renders ClaimsTable with correct title
    test('Renders ClaimsTable with correct title', () => {
        render(
            <Provider store={store}>
                <PaidClaims />
            </Provider>
        );

        expect(screen.getByText('Summary of Paid Claims')).toBeInTheDocument();
    });

    // Test 5: UI - Displays error message when an error occurs
    test('Displays an error message when an error occurs', () => {
        store = mockStore({
            claimer: {
                claims: [],
                loading: false,
                error: 'Failed to fetch claims'
            }
        });

        render(
            <Provider store={store}>
                <PaidClaims />
            </Provider>
        );

        expect(screen.getByText(/Error: Failed to fetch claims/i)).toBeInTheDocument();
    });
});