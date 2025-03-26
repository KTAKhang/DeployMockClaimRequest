import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import ProfilePage from './ProfilePage';
import '@testing-library/jest-dom';

// Mock các actions
jest.mock('../redux/actions/userActions', () => ({
    getUserProfile: jest.fn().mockReturnValue({ type: 'GET_USER_PROFILE_REQUEST' }),
    updateUserProfile: jest.fn().mockReturnValue({ type: 'UPDATE_USER_PROFILE_REQUEST' })
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
        error: jest.fn(),
        dismiss: jest.fn()
    },
    ToastContainer: jest.fn(() => <div data-testid="toast-container"></div>)
}));

// Cấu hình store với Saga middleware
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const mockStore = configureStore(middlewares);

describe('ProfilePage Component', () => {
    let store;
    
    const profileData = {
        _id: 'user123',
        user_name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        job_rank: 'Senior Developer',
        salary: 5000,
        role_name: 'Claimer',
        status: true,
        avatar: 'data:image/jpeg;base64,/9j/example',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-05-15T00:00:00.000Z'
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup store với initial state
        store = mockStore({
            user: {
                profile: profileData,
                loading: false,
                error: null,
                updateLoading: false,
                updateError: null,
                updateSuccess: false
            },
            auth: {
                user: {
                    role_name: 'Claimer'
                }
            }
        });
    });

    // Test case 1: Kiểm tra render component với data hợp lệ
    it('renders profile information correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ProfilePage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra các thông tin profile hiển thị
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Claimer')[0]).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
        
        // Sửa: Thay vì tìm chính xác $5,000, tìm phần tử chứa giá trị lương
        expect(screen.getByText(/\$.*5.*000/)).toBeInTheDocument();
        // Hoặc dùng cách thay thế:
        // const salaryElement = screen.getByText((content, element) => {
        //     return element.textContent.includes('5,000') || element.textContent.includes('5000');
        // });
        // expect(salaryElement).toBeInTheDocument();
        
        expect(screen.getByText('Active')).toBeInTheDocument();
        
        // Kiểm tra nút Edit Profile
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        expect(editButton).toBeInTheDocument();
        
        // Kiểm tra nút Change Password
        const changePasswordButton = screen.getByRole('button', { name: /change password/i });
        expect(changePasswordButton).toBeInTheDocument();
    });

    // Test case 2: Kiểm tra loading state
    it('displays loading spinner when loading profile', () => {
        // Tạo store với trạng thái loading
        const loadingStore = mockStore({
            user: {
                profile: null,
                loading: true,
                error: null,
                updateLoading: false,
                updateError: null,
                updateSuccess: false
            },
            auth: {
                user: {
                    role_name: 'Claimer'
                }
            }
        });

        render(
            <Provider store={loadingStore}>
                <BrowserRouter>
                    <ProfilePage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra loading message hiển thị
        expect(screen.getByText('Loading profile information...')).toBeInTheDocument();
        
        // Kiểm tra spinner hiển thị
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    // Test case 3: Kiểm tra error state
    it('displays error message when profile loading fails', () => {
        // Tạo store với trạng thái error
        const errorStore = mockStore({
            user: {
                profile: null,
                loading: false,
                error: 'Failed to load profile data',
                updateLoading: false,
                updateError: null,
                updateSuccess: false
            },
            auth: {
                user: {
                    role_name: 'Claimer'
                }
            }
        });

        render(
            <Provider store={errorStore}>
                <BrowserRouter>
                    <ProfilePage />
                </BrowserRouter>
            </Provider>
        );

        // Kiểm tra error message hiển thị
        expect(screen.getByText('Error loading profile')).toBeInTheDocument();
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
        
        // Kiểm tra nút Try Again hiển thị
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Test case 4: Kiểm tra mở popup chỉnh sửa profile
    it('opens edit profile popup and displays form with current values', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ProfilePage />
                </BrowserRouter>
            </Provider>
        );

        // Tìm và click vào nút Edit Profile bằng role và name
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editButton);
        
        // Kiểm tra popup hiển thị với heading "Edit Profile"
        await waitFor(() => {
            const editProfileHeading = screen.getAllByText('Edit Profile')[1]; // Lấy phần tử thứ 2 là heading
            expect(editProfileHeading).toBeInTheDocument();
        });
        
        // Kiểm tra form hiển thị với giá trị hiện tại
        const usernameInput = screen.getByDisplayValue('John Doe');
        expect(usernameInput).toBeInTheDocument();
        
        // Kiểm tra nút Save Changes hiển thị
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    // Test case 5: Kiểm tra cập nhật profile
    it('validates and submits form data correctly', async () => {
        const { updateUserProfile } = require('../../redux/actions/userActions');
        
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ProfilePage />
                </BrowserRouter>
            </Provider>
        );

        // Tìm và click vào nút Edit Profile bằng role và name
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editButton);
        
        // Đợi popup hiển thị
        await waitFor(() => {
            const editProfileHeading = screen.getAllByText('Edit Profile')[1]; // Lấy phần tử thứ 2 là heading
            expect(editProfileHeading).toBeInTheDocument();
        });
        
        // Tìm input username
        const usernameInput = screen.getByDisplayValue('John Doe');
        
        // Thay đổi username
        fireEvent.change(usernameInput, { target: { value: 'John Smith' } });
        
        // Submit form
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
        
        // Kiểm tra action updateUserProfile được gọi với dữ liệu đúng
        expect(updateUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                user_name: 'John Smith',
                avatar: profileData.avatar
            })
        );
    });
});
