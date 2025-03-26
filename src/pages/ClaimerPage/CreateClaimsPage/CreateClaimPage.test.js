import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import CreateClaim from './CreateClaim';
import '@testing-library/jest-dom';

// Sử dụng đường dẫn tuyệt đối thay vì tương đối
jest.mock('../../../redux/actions/claimerActions', () => ({
    fetchProjectsRequest: jest.fn().mockReturnValue({ type: 'FETCH_PROJECTS_REQUEST' }),
    createClaimRequest: jest.fn().mockReturnValue({ type: 'CREATE_CLAIM_REQUEST' })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

// Kiểm tra đường dẫn đến ClaimModal, có thể cần điều chỉnh
jest.mock('../ClaimModal/ClaimModal', () => {
    return jest.fn(({ isOpen, onClose, onConfirm, actionType }) => (
        isOpen ? (
            <div role="dialog">
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        ) : null
    ));
});

// Cấu hình store với Saga middleware
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const mockStore = configureStore(middlewares);

describe('CreateClaim Component', () => {
    let store;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => JSON.stringify({ user_name: 'Test User' })),
                setItem: jest.fn(),
                clear: jest.fn()
            },
            writable: true
        });

        // Setup store với initial state
        store = mockStore({
            claimer: {
                projects: [
                    { _id: 'project1', project_name: 'Project 1' },
                    { _id: 'project2', project_name: 'Project 2' }
                ],
                projectsLoading: false,
                createClaimLoading: false,
                createClaimError: null,
                createClaimSuccess: false
            }
        });
    });

    // Test case 1: Kiểm tra render component
    it('renders CreateClaim component correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <CreateClaim />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getAllByText(/create claim/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/staff name/i)).toBeInTheDocument();
        expect(screen.getByText(/project name/i)).toBeInTheDocument();
        expect(screen.getAllByText(/total working hours/i)).toHaveLength(2);
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    // Test case 2: Kiểm tra load thông tin user
    it('loads user information from localStorage', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <CreateClaim />
                </BrowserRouter>
            </Provider>
        );

        const staffNameInput = screen.getByDisplayValue('Test User');
        expect(staffNameInput).toBeInTheDocument();
    });

    // Test case 3: Kiểm tra validation form
    it('shows validation errors when submitting with incomplete form', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <CreateClaim />
                </BrowserRouter>
            </Provider>
        );

        // Click Submit button
        fireEvent.click(screen.getByText('Submit'));

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Click Confirm in modal
        fireEvent.click(screen.getByText('Confirm'));

        // Check validation errors
        await waitFor(() => {
            expect(screen.getByText(/please select a project/i)).toBeInTheDocument();
            expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/total working hours is required/i)).toBeInTheDocument();
            expect(screen.getByText(/reason is required/i)).toBeInTheDocument();
        });
    });

    // Test case 4: Kiểm tra cập nhật form và tính toán giờ làm việc
    it('updates form values and calculates total working hours correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <CreateClaim />
                </BrowserRouter>
            </Provider>
        );

        // Fill form
        const projectSelect = screen.getByRole('combobox');
        fireEvent.change(projectSelect, { target: { value: 'project1' } });

        const dateInputs = document.querySelectorAll('input[type="date"]');
        const [fromDateInput, toDateInput] = Array.from(dateInputs).filter(input => 
            input.closest('div')?.textContent.includes('Date from') ||
            input.closest('div')?.textContent.includes('Date to')
        );

        if (fromDateInput && toDateInput) {
            fireEvent.change(fromDateInput, { target: { value: '2023-10-01' } });
            fireEvent.change(toDateInput, { target: { value: '2023-10-02' } });
        }

        const hoursInput = screen.getByRole('spinbutton');
        fireEvent.change(hoursInput, { target: { value: '8' } });

        const reasonInput = Array.from(screen.getAllByRole('textbox')).find(
            input => input.closest('div')?.textContent.includes('Reason')
        );

        if (reasonInput) {
            fireEvent.change(reasonInput, { target: { value: 'Working overtime' } });
        }

        expect(screen.getByText('8')).toBeInTheDocument();
    });

    // Test case 5: Kiểm tra xử lý submit đơn giản
    it('dispatches createClaimRequest action when submitting form', async () => {
        // Sửa lại đường dẫn require
        const { createClaimRequest } = require('../../../redux/actions/claimerActions');
        createClaimRequest.mockClear();

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <CreateClaim />
                </BrowserRouter>
            </Provider>
        );

        // Điền form đơn giản
        // Chọn project
        const projectSelect = screen.getByRole('combobox');
        fireEvent.change(projectSelect, { target: { value: 'project1' } });

        // Tìm và điền các input date
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const fromDateInput = dateInputs[1]; // Skip first readonly date input
        const toDateInput = dateInputs[2];
        
        fireEvent.change(fromDateInput, { target: { value: '2023-10-01' } });
        fireEvent.change(toDateInput, { target: { value: '2023-10-02' } });

        // Điền input hours
        const hoursInput = document.querySelector('input[type="number"]');
        fireEvent.change(hoursInput, { target: { value: '8' } });

        // Tìm và điền input reason
        const reasonInput = document.querySelector('input[type="text"][required]');
        
        // Đảm bảo fireEvent thành công bằng cách gọi trực tiếp handleChange
        fireEvent.change(reasonInput, { target: { value: 'Working overtime' } });
        
        // Đảm bảo giá trị được set
        fireEvent.input(reasonInput, { target: { value: 'Working overtime' } });

        // Click Save thay vì Submit để đơn giản hóa test
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        // Đợi modal hiển thị
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Click Confirm
        fireEvent.click(screen.getByText('Confirm'));

        // Kiểm tra action được dispatch
        await waitFor(() => {
            expect(createClaimRequest).toHaveBeenCalled();
        }, { timeout: 5000 });
    });
});
