import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import { act } from 'react-dom/test-utils';
import * as redux from 'react-redux';
import { toast } from 'react-toastify';


import FinanceDetailPage from './FinanceDetailPage';
import {
  financeFetchDetailRequest,
  financeUpdateClaimStatusRequest,
  resetIsPaidStatus,
  fetchClaimsRequest
} from '../../../redux/actions/financeAction';
import {
  getCommentsRequest,
  createCommentRequest,
  replyCommentRequest
} from '../../../redux/actions/commentAction';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock the redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock the react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the actions
jest.mock('../../../redux/actions/financeAction', () => ({
  financeFetchDetailRequest: jest.fn(),
  financeUpdateClaimStatusRequest: jest.fn(),
  resetIsPaidStatus: jest.fn(),
  fetchClaimsRequest: jest.fn(),
}));

jest.mock('../../../redux/actions/commentAction', () => ({
  getCommentsRequest: jest.fn(),
  createCommentRequest: jest.fn(),
  replyCommentRequest: jest.fn(),
}));

// Mock the Loading component
jest.mock('../../../components/Loading/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-component">Loading...</div>,
}));

// Mock the Modal component
jest.mock('../../../components/Modal/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm }) =>
    isOpen ? (
      <div data-testid="modal-component">
        <button data-testid="modal-close" onClick={onClose}>Close</button>
        <button data-testid="modal-confirm" onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Sample data for testing
const mockUser = { _id: 'user123', user_name: 'John Doe' };
const mockClaim = {
  _id: 'claim123',
  status: { name: 'Approved' },
  user: {
    _id: 'user123',
    user_name: 'John Doe',
    avatar: 'path/to/avatar.jpg'
  },
  project: {
    project_name: 'Test Project',
    duration: {
      from: '2023-01-01T00:00:00.000Z',
      to: '2023-12-31T00:00:00.000Z'
    }
  },
  total_no_of_hours: 40,
  reason_claimer: 'This is a test claim'
};

const mockComments = [
  {
    _id: 'comment1',
    user_id: {
      _id: 'user456',
      user_name: 'Jane Smith',
      avatar: 'path/to/avatar.jpg',
      role_id: { name: 'Finance' }
    },
    content: 'Test comment',
    createdAt: new Date().toISOString(),
    replies: [
      {
        _id: 'reply1',
        user: {
          _id: 'user123',
          user_name: 'John Doe',
          avatar: 'path/to/avatar.jpg'
        },
        content: 'Test reply',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// Setup mock store
const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

describe('FinanceDetailPage Component', () => {
  let store;
  let useDispatchMock;
  let useSelectorMock;
  let navigateMock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup localStorage with user data
    window.localStorage.setItem('user', JSON.stringify(mockUser));
    window.localStorage.setItem('token', 'mock-token');

    // Setup mocks
    useDispatchMock = jest.fn();
    redux.useDispatch.mockReturnValue(useDispatchMock);

    navigateMock = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(navigateMock);
    require('react-router-dom').useParams.mockReturnValue({ id: 'claim123' });

    // Initialize store with initial state
    store = mockStore({
      finance: {
        claimDetail: null,
        loading: false,
        error: null,
        updateClaimSuccess: false,
        updateClaimLoading: false,
      },
      comment: {
        comments: [],
        loadingComment: false,
        errorComment: null,
      },
    });
  });

  test('should render loading state', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: null,
          loading: true,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
    expect(useDispatchMock).toHaveBeenCalledWith(financeFetchDetailRequest('claim123'));
  });

  test('should render error state', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: null,
          loading: false,
          error: 'Failed to load claim details',
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Failed to load claim details')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  test('should render claim details when data is loaded', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Claim Detailed Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('40 hours')).toBeInTheDocument();
  });

  test('should handle "Mark as Paid" button click and open modal', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Click the "Mark as Paid" button
    fireEvent.click(screen.getByText('Mark as Paid'));

    // Check if modal is opened
    expect(screen.getByTestId('modal-component')).toBeInTheDocument();
  });

  test('should handle confirm in modal and dispatch actions', async () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Open modal
    fireEvent.click(screen.getByText('Mark as Paid'));

    // Confirm in modal
    fireEvent.click(screen.getByTestId('modal-confirm'));

    // Check if actions were dispatched
    expect(useDispatchMock).toHaveBeenCalledWith(
      financeUpdateClaimStatusRequest(['claim123'], 'Paid')
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Payment Successful!',
      expect.any(Object)
    );
    expect(navigateMock).toHaveBeenCalledWith('/finance/approved');

    // Fast-forward timers to trigger the setTimeout callbacks
    jest.advanceTimersByTime(1500);
    expect(useDispatchMock).toHaveBeenCalledWith(fetchClaimsRequest({}));
  });

  test('should handle adding a new comment', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Type in comment input
    const commentInput = screen.getByPlaceholderText('Type your comment...');
    fireEvent.change(commentInput, { target: { value: 'New test comment' } });

    // Click send button
    fireEvent.click(screen.getByText('Send'));

    // Check if action was dispatched
    expect(useDispatchMock).toHaveBeenCalledWith(
      createCommentRequest({ content: 'New test comment', claim_id: 'claim123' })
    );
  });

  test('should handle keyboard shortcut (Enter) to send comment', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Type in comment input
    const commentInput = screen.getByPlaceholderText('Type your comment...');
    fireEvent.change(commentInput, { target: { value: 'Test comment with Enter key' } });

    // Press Enter key
    fireEvent.keyDown(commentInput, { key: 'Enter', code: 'Enter' });

    // Check if action was dispatched
    expect(useDispatchMock).toHaveBeenCalledWith(
      createCommentRequest({ content: 'Test comment with Enter key', claim_id: 'claim123' })
    );
  });

  test('should not dispatch action when comment is empty', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Type empty space in comment input
    const commentInput = screen.getByPlaceholderText('Type your comment...');
    fireEvent.change(commentInput, { target: { value: '   ' } });

    // Try to send
    fireEvent.click(screen.getByText('Send'));

    // Check that createCommentRequest was not called
    expect(createCommentRequest).not.toHaveBeenCalled();
  });

  test('should navigate back when back button is clicked', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Click back button
    const backButton = screen.getAllByText('Back')[1]; // Get the second "Back" button (in action buttons)
    fireEvent.click(backButton);

    // Check if navigate was called
    expect(navigateMock).toHaveBeenCalledWith('/finance/approved');
  });

  test('should handle the effects of claim status on UI elements', () => {
    // Test with a different status
    const paidClaimData = {
      ...mockClaim,
      status: { name: 'Paid' }
    };

    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: paidClaimData,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );


    // Check that "Mark as Paid" button is not shown for Paid status
    expect(screen.queryByText('Mark as Paid')).not.toBeInTheDocument();

    // Check that comments are locked for Paid status
    expect(screen.getByText('Comments are locked for this status.')).toBeInTheDocument();
  });

  test('should clean up on unmount', () => {
    useSelectorMock = jest.fn().mockImplementation(selector =>
      selector({
        finance: {
          claimDetail: mockClaim,
          loading: false,
          error: null,
        },
        comment: {
          comments: [],
          loadingComment: false,
          errorComment: null,
        },
      })
    );
    redux.useSelector.mockImplementation(useSelectorMock);

    const { unmount } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/finance/claim123']}>
          <FinanceDetailPage />
        </MemoryRouter>
      </Provider>
    );

    // Unmount component
    unmount();

    // Check if resetIsPaidStatus was called
    expect(useDispatchMock).toHaveBeenCalledWith(resetIsPaidStatus());
  });
});
