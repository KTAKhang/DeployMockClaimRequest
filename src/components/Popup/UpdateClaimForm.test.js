import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import UpdateClaimForm from './UpdateClaimForm';
import '@testing-library/jest-dom';

// Mock các actions
jest.mock('../../redux/actions/claimerActions', () => ({
    updateClaimRequest: jest.fn().mockReturnValue({ type: 'UPDATE_CLAIM_REQUEST' }),
    resetUpdateState: jest.fn().mockReturnValue({ type: 'RESET_UPDATE_STATE' })
}));

// Mock ClaimModal component
jest.mock('../../pages/ClaimerPage/ClaimModal', () => {
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

describe('UpdateClaimForm Component', () => {
    let store;
    const initialData = {
        staffName: 'Test User',
        projectName: 'Test Project',
        projectId: 'project1',
        from_date: '2023-10-01',
        to_date: '2023-10-02',
        totalHours: '8',
        reason: 'Working overtime'
    };
    const claimId = 'claim123';
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup store với initial state
        store = mockStore({
            claimer: {
                updateClaimLoading: false,
                updateClaimError: null,
                updateClaimSuccess: false
            }
        });
    });

    // Test case 1: Kiểm tra render component
    it('renders UpdateClaimForm component correctly', () => {
        render(
            <Provider store={store}>
                <UpdateClaimForm 
                    initialData={initialData}
                    claimId={claimId}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </Provider>
        );

        // Kiểm tra các text và fields chính
        expect(screen.getByText('Update Claim')).toBeInTheDocument();
        expect(screen.getByText('Staff name')).toBeInTheDocument();
        expect(screen.getByText('Project name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023-10-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023-10-02')).toBeInTheDocument();
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Working overtime')).toBeInTheDocument();
        
        // Kiểm tra các button
        expect(screen.getByText('SAVE')).toBeInTheDocument();
        expect(screen.getByText('CANCEL')).toBeInTheDocument();
    });

    // Test case 2: Kiểm tra validation form
    it('shows validation errors when attempting to save with empty fields', async () => {
        render(
            <Provider store={store}>
                <UpdateClaimForm 
                    initialData={{
                        staffName: 'Test User',
                        projectName: 'Test Project',
                        projectId: 'project1',
                        from_date: '',
                        to_date: '',
                        totalHours: '',
                        reason: ''
                    }}
                    claimId={claimId}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </Provider>
        );

        // Click SAVE button
        fireEvent.click(screen.getByText('SAVE'));

        // Kiểm tra các thông báo lỗi hiển thị
        expect(screen.getByText('Start date is required')).toBeInTheDocument();
        expect(screen.getByText('End date is required')).toBeInTheDocument();
        expect(screen.getByText('Total working hours is required')).toBeInTheDocument();
        expect(screen.getByText('Reason is required')).toBeInTheDocument();
        
        // Kiểm tra modal không được mở
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Test case 3: Kiểm tra cập nhật form và xóa lỗi
    it('updates form values correctly and clears validation errors', async () => {
        render(
            <Provider store={store}>
                <UpdateClaimForm 
                    initialData={{
                        staffName: 'Test User',
                        projectName: 'Test Project',
                        projectId: 'project1',
                        from_date: '',
                        to_date: '',
                        totalHours: '',
                        reason: ''
                    }}
                    claimId={claimId}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </Provider>
        );

        // Click SAVE button để hiển thị lỗi trước
        fireEvent.click(screen.getByText('SAVE'));
        
        // Kiểm tra lỗi hiển thị
        expect(screen.getByText('Start date is required')).toBeInTheDocument();
        
        // Tìm các input theo selector chính xác
        const fromDateInputs = document.querySelectorAll('input[type="date"]');
        const fromDateInput = fromDateInputs[1]; // Từ index 1 vì index 0 là readonly date
        const toDateInput = fromDateInputs[2];
        
        const hoursInput = screen.getByRole('spinbutton');
        const reasonInput = document.querySelector('input[type="text"][required]');
        
        // Cập nhật các input
        if (fromDateInput) {
            fireEvent.change(fromDateInput, { target: { value: '2023-10-01' } });
        }
        
        if (toDateInput) {
            fireEvent.change(toDateInput, { target: { value: '2023-10-02' } });
        }
        
        fireEvent.change(hoursInput, { target: { value: '8' } });
        fireEvent.change(reasonInput, { target: { value: 'Working overtime' } });
        
        // Click SAVE lần nữa để kích hoạt validation
        fireEvent.click(screen.getByText('SAVE'));
        
        // Đợi modal hiển thị - điều này có nghĩa là validation đã pass
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        
        // Kiểm tra modal hiển thị thay vì tìm kiếm lỗi đã biến mất
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Test case 4: Kiểm tra xác nhận save và gọi onSubmit
    it('opens confirmation modal and calls onSubmit when confirmed', async () => {
        render(
            <Provider store={store}>
                <UpdateClaimForm 
                    initialData={initialData}
                    claimId={claimId}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </Provider>
        );

        // Click SAVE button
        fireEvent.click(screen.getByText('SAVE'));
        
        // Kiểm tra modal hiển thị
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        
        // Click Confirm button trong modal
        fireEvent.click(screen.getByText('Confirm'));
        
        // Kiểm tra onSubmit được gọi với dữ liệu đúng
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            date: expect.any(String),
            from: '2023-10-01',
            to: '2023-10-02',
            total_no_of_hours: 8,
            project_id: 'project1',
            reason_claimer: 'Working overtime'
        }));
        
        // Kiểm tra modal đã đóng
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Test case 5: Kiểm tra hiện thị thông báo thành công khi cập nhật
    it('displays success notification when update is successful', async () => {
        // Tạo store với trạng thái thành công
        const successStore = mockStore({
            claimer: {
                updateClaimLoading: false,
                updateClaimError: null,
                updateClaimSuccess: true
            }
        });

        render(
            <Provider store={successStore}>
                <UpdateClaimForm 
                    initialData={initialData}
                    claimId={claimId}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </Provider>
        );

        // Kiểm tra thông báo thành công hiển thị
        await waitFor(() => {
            expect(screen.getByText('Claim updated successfully!')).toBeInTheDocument();
        });
        
        // Kiểm tra thông báo có class đúng, sử dụng closest() để tìm div cha
        const notification = screen.getByText('Claim updated successfully!');
        expect(notification.closest('div.bg-green-500')).not.toBeNull();
    });
});
