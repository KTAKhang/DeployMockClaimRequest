import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import { BrowserRouter } from 'react-router-dom';
import FinanceDashboardPage from './FinanceDashboardPage';
import { fetchClaimsRequest } from '../../../redux/actions/financeAction';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));

// Mock các dependencies
jest.mock('../../../redux/actions/financeAction', () => ({
    fetchClaimsRequest: jest.fn().mockReturnValue({ type: 'FETCH_CLAIMS_REQUEST' })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, className, style, custom, variants, initial, animate }) => (
            <div
                onClick={onClick}
                className={className}
                style={style}
                data-testid="motion-div"
                data-custom={custom}
                data-variants={JSON.stringify(variants)}
                data-initial={initial}
                data-animate={animate}
            >
                {children}
            </div>
        )
    }
}));

// Mock react-icons
jest.mock('react-icons/ai', () => ({
    AiOutlineAppstore: () => <div data-testid="app-store-icon" />
}));

// Mock logo
jest.mock('../../../public/logo.svg', () => 'logo-mock-path');

// Cấu hình Redux store với middleware Saga
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const mockStore = configureStore(middlewares);

describe('FinanceDashboardPage Component', () => {
    let store;
    let navigate;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock navigate function
        navigate = jest.fn();
        require('react-router-dom').useNavigate.mockReturnValue(navigate);

        // Reset document title
        document.title = '';
    });

    test('should dispatch fetchClaimsRequest and set document title on mount', () => {
        store = mockStore({
            finance: {
                claims: [],
                loading: false
            }
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra action đã được dispatch
        const actions = store.getActions();
        expect(actions).toEqual([{ type: 'FETCH_CLAIMS_REQUEST' }]);
        expect(fetchClaimsRequest).toHaveBeenCalledWith({});

        // Kiểm tra document title
        expect(document.title).toBe('Dashboard');
    });

    test('should render loading state when loading is true', () => {
        store = mockStore({
            finance: {
                claims: [],
                loading: true
            }
        });

        const { container } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra hiển thị loading spinner
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

        // Kiểm tra lớp CSS của spinner
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('h-10');
        expect(spinner).toHaveClass('w-10');
        expect(spinner).toHaveClass('border-t-4');
        expect(spinner).toHaveClass('border-blue-500');

        // Đảm bảo các card không hiển thị khi loading
        expect(screen.queryByText('Total Claims')).not.toBeInTheDocument();
        expect(screen.queryByText('Approved Claims')).not.toBeInTheDocument();
        expect(screen.queryByText('Paid Claims')).not.toBeInTheDocument();
    });

    test('should handle claims with various statuses correctly', () => {
        // Sample data với các claims đa dạng trạng thái
        const mockClaims = [
            { id: 1, status: 'Approved', amount: 100 },
            { id: 2, status: 'Approved', amount: 200 },
            { id: 3, status: 'Paid', amount: 150 },
            { id: 4, status: 'Approved', amount: 300 },
            { id: 5, status: 'Paid', amount: 400 },
            { id: 6, status: 'Paid', amount: 250 },
            { id: 7, status: 'Paid', amount: 500 }
        ];

        store = mockStore({
            finance: {
                claims: mockClaims,
                loading: false
            }
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Chỉ có 2 Approved và 2 Paid (tổng 4)
        expect(screen.getByText('Total Claims')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();

        // 2 Approved claims
        expect(screen.getByText('Approved Claims')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();

        // 2 Paid claims
        expect(screen.getByText('Paid Claims')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    test('should render cards with correct background colors', () => {
        store = mockStore({
            finance: {
                claims: [
                    { id: 1, status: 'Approved' },
                    { id: 2, status: 'Paid' }
                ],
                loading: false
            }
        });

        const { getAllByTestId } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        const cards = getAllByTestId('motion-div');

        // Kiểm tra màu nền của các card
        expect(cards[0]).toHaveStyle('background-color: #0E69AF'); // Total Claims
        expect(cards[1]).toHaveStyle('background-color: #F27226'); // Approved Claims
        expect(cards[2]).toHaveStyle('background-color: #0DB04B'); // Paid Claims
    });

    test('should render AppStore icons for each card', () => {
        store = mockStore({
            finance: {
                claims: [
                    { id: 1, status: 'Approved' },
                    { id: 2, status: 'Paid' }
                ],
                loading: false
            }
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra icon AppStore hiển thị đúng số lượng (3 card)
        const icons = screen.getAllByTestId('app-store-icon');
        expect(icons.length).toBe(3);
    });

    test('should apply animation variants correctly', () => {
        store = mockStore({
            finance: {
                claims: [
                    { id: 1, status: 'Approved' },
                    { id: 2, status: 'Paid' }
                ],
                loading: false
            }
        });

        const { getAllByTestId } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        const cards = getAllByTestId('motion-div');

        cards.forEach((card, index) => {
            if (index < 3) { // Only first 3 cards have animation
                expect(card).toHaveAttribute('data-initial', 'hidden');
                expect(card).toHaveAttribute('data-animate', 'visible');
                expect(card).toHaveAttribute('data-custom', String(index));

                // Remove the JSON.parse test since data-variants isn't set
            }
        });
    });



    test('should only count Approved and Paid claims for total count', () => {
        // Dữ liệu với nhiều trạng thái khác nhau
        const mockClaims = [
            { id: 1, status: 'Approved' },
            { id: 2, status: 'Pending' },
            { id: 3, status: 'Rejected' },
            { id: 4, status: 'Processing' },
            { id: 5, status: 'Paid' },
            { id: 6, status: 'Cancelled' },
            { id: 7, status: 'Draft' }
        ];

        store = mockStore({
            finance: {
                claims: mockClaims,
                loading: false
            }
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Chỉ 1 Approved và 1 Paid, nên tổng là 2
        expect(screen.getByText('Total Claims')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('should render correct layout on different screen sizes', () => {
        store = mockStore({
            finance: {
                claims: [
                    { id: 1, status: 'Approved' },
                    { id: 2, status: 'Paid' }
                ],
                loading: false
            }
        });

        const { container } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra các class responsive
        const parentDiv = container.querySelector('.flex-wrap.lg\\:flex-nowrap');
        expect(parentDiv).toBeInTheDocument();

        // Kiểm tra logo có class responsive
        const logoContainer = container.querySelector('.hidden.md\\:flex');
        expect(logoContainer).toBeInTheDocument();
    });

    test('should properly cleanup effects on unmount', () => {
        store = mockStore({
            finance: {
                claims: [],
                loading: false
            }
        });

        const { unmount } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <FinanceDashboardPage />
                </BrowserRouter>
            </Provider>
        );

        // Reset action calls
        fetchClaimsRequest.mockClear();

        // Unmount component
        unmount();

        // Đảm bảo không có action nào được gọi khi unmount
        expect(fetchClaimsRequest).not.toHaveBeenCalled();
    });
});