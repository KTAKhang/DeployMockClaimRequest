import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import FinanceApprovedPage from './FinanceApprovedPage';
import { fetchClaimsRequest, resetIsPaidStatus } from '../../../redux/actions/financeAction';

// Mock cho các dependencies
jest.mock('../../../redux/actions/financeAction', () => ({
    fetchClaimsRequest: jest.fn().mockReturnValue({ type: 'FETCH_CLAIMS_REQUEST' }),
    resetIsPaidStatus: jest.fn().mockReturnValue({ type: 'RESET_IS_PAID_STATUS' })
}));

// Mock cho component ClaimsTable
jest.mock('../../../components/Table/ClaimsTable', () => {
    return jest.fn(({ title, claimsData, filterCondition }) => (
        <div data-testid="claims-table">
            <h2>{title}</h2>
            <div data-testid="claims-count">{claimsData.length}</div>
            <div data-testid="filter-condition">{filterCondition}</div>
        </div>
    ));
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn()
    }
}));

// Cấu hình store với Saga middleware
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const mockStore = configureStore(middlewares);

describe('FinanceApprovedPage Component', () => {
    let store;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    it('should dispatch fetchClaimsRequest action on mount', () => {
        // Setup store với dữ liệu mẫu
        store = mockStore({
            finance: {
                claims: [],
                loading: false,
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Kiểm tra action đã được dispatch
        const actions = store.getActions();
        expect(actions).toEqual([{ type: 'FETCH_CLAIMS_REQUEST' }]);
        expect(fetchClaimsRequest).toHaveBeenCalledWith({});
    });

    it('should render ClaimsTable with correct props and filtered data', () => {
        // Dữ liệu mẫu với nhiều loại status
        const mockClaims = [
            { id: 1, status: 'Approved', amount: 100 },
            { id: 2, status: 'Pending', amount: 200 },
            { id: 3, status: 'Approved', amount: 300 },
            { id: 4, status: 'Paid', amount: 400 }
        ];

        // Setup store với dữ liệu mẫu
        store = mockStore({
            finance: {
                claims: mockClaims,
                loading: false,
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Kiểm tra title đúng
        expect(screen.getByText('Approved Claims')).toBeInTheDocument();

        // Kiểm tra số lượng claims đã lọc
        // Vì chỉ có 2 claims có status 'Approved'
        expect(screen.getByTestId('claims-count').textContent).toBe('2');

        // Kiểm tra filterCondition được truyền đúng
        expect(screen.getByTestId('filter-condition').textContent).toBe('FinanceApproved');
    });

    it('should display error message when there is an error', () => {
        // Setup store với error
        store = mockStore({
            finance: {
                claims: [],
                loading: false,
                error: 'Failed to fetch claims'
            }
        });

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Kiểm tra hiển thị thông báo lỗi
        expect(screen.getByText(/Error: Failed to fetch claims/i)).toBeInTheDocument();
    });

    it('should handle empty claims array', () => {
        // Setup store với mảng claims rỗng
        store = mockStore({
            finance: {
                claims: [],
                loading: false,
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Kiểm tra ClaimsTable vẫn hiển thị nhưng không có dữ liệu
        expect(screen.getByTestId('claims-count').textContent).toBe('0');
    });

    it('should handle loading state', () => {
        // Setup store với loading=true
        store = mockStore({
            finance: {
                claims: [],
                loading: true,
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Component vẫn nên render mặc dù đang loading
        expect(screen.getByTestId('claims-table')).toBeInTheDocument();
    });

    it('should handle undefined state.finance', () => {
        // Setup store với state.finance là undefined
        store = mockStore({});

        render(
            <Provider store={store}>
                <FinanceApprovedPage />
            </Provider>
        );

        // Component vẫn nên render mà không bị lỗi
        expect(screen.getByTestId('claims-count').textContent).toBe('0');
    });
});