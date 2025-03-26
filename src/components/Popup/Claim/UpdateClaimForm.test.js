import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import UpdateClaimForm from './UpdateClaimForm';
import '@testing-library/jest-dom';

// Mock các actions
jest.mock('../../../redux/actions/claimerActions', () => ({
    updateClaimRequest: jest.fn().mockReturnValue({ type: 'UPDATE_CLAIM_REQUEST' }),
    resetUpdateState: jest.fn().mockReturnValue({ type: 'RESET_UPDATE_STATE' })
}));

// Mock ClaimModal component
jest.mock('../../../pages/ClaimerPage/ClaimModal/ClaimModal', () => {
    return jest.fn(({ isOpen, onClose, onConfirm, actionType }) => (
        isOpen ? (
            <div role="dialog" data-testid="claim-modal">
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
        
        // Tìm nút "Save Changes" theo text chính xác
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
        
        // Tìm nút "Cancel" (chính xác như hiển thị trong component)
        expect(screen.getByText('Cancel')).toBeInTheDocument();
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

        // Tìm Save Changes button theo text chính xác
        const saveButton = screen.getByText('Save Changes');
        
        // Click Save button
        fireEvent.click(saveButton);

        // Kiểm tra các phần tử p có class text-red-500
        await waitFor(() => {
            // Sử dụng CSS selector để tìm các phần tử p có class text-red-500
            const errorElements = document.querySelectorAll('p.text-red-500');
            expect(errorElements.length).toBeGreaterThan(0);
            
            // Kiểm tra nội dung text của các phần tử này
            let foundStartDateError = false;
            let foundEndDateError = false;
            let foundTotalHoursError = false;
            let foundReasonError = false;
            
            errorElements.forEach(element => {
                const text = element.textContent;
                if (text.includes('Start date is required')) foundStartDateError = true;
                if (text.includes('End date is required')) foundEndDateError = true;
                if (text.includes('Total working hours is required')) foundTotalHoursError = true;
                if (text.includes('Reason is required')) foundReasonError = true;
            });
            
            expect(foundStartDateError).toBe(true);
            expect(foundEndDateError).toBe(true);
            expect(foundTotalHoursError).toBe(true);
            expect(foundReasonError).toBe(true);
        });
        
        // Kiểm tra modal không được mở
        expect(screen.queryByTestId('claim-modal')).not.toBeInTheDocument();
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

        // Tìm Save Changes button theo text chính xác
        const saveButton = screen.getByText('Save Changes');
        
        // Click Save button để hiển thị lỗi trước
        fireEvent.click(saveButton);
        
        // Đợi error messages hiển thị
        await waitFor(() => {
            const errorElements = document.querySelectorAll('p.text-red-500');
            expect(errorElements.length).toBeGreaterThan(0);
        });
        
        // Tìm các input theo selector chính xác
        const fromDateInputs = document.querySelectorAll('input[type="date"]');
        const fromDateInput = fromDateInputs[1]; // Từ index 1 vì index 0 là readonly date
        const toDateInput = fromDateInputs[2];
        
        const hoursInput = screen.getByRole('spinbutton');
        
        // Tìm textarea cho reason
        const reasonInput = screen.getByPlaceholderText('Enter your reason here...');
        
        // Cập nhật các input
        if (fromDateInput) {
            fireEvent.change(fromDateInput, { target: { value: '2023-10-01' } });
        }
        
        if (toDateInput) {
            fireEvent.change(toDateInput, { target: { value: '2023-10-02' } });
        }
        
        fireEvent.change(hoursInput, { target: { value: '8' } });
        fireEvent.change(reasonInput, { target: { value: 'Working overtime' } });
        
        // Click Save lần nữa để kích hoạt validation
        fireEvent.click(saveButton);
        
        // Đợi modal hiển thị - điều này có nghĩa là validation đã pass
        await waitFor(() => {
            expect(screen.getByTestId('claim-modal')).toBeInTheDocument();
        });
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

        // Tìm Save Changes button theo text chính xác
        const saveButton = screen.getByText('Save Changes');
        
        // Click Save button
        fireEvent.click(saveButton);
        
        // Kiểm tra modal hiển thị bằng data-testid thay vì role
        await waitFor(() => {
            expect(screen.getByTestId('claim-modal')).toBeInTheDocument();
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
        expect(screen.queryByTestId('claim-modal')).not.toBeInTheDocument();
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
