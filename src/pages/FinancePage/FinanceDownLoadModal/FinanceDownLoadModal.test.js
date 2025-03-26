import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import FinanceDownLoadModal from './FinanceDownLoadModal';
import { downloadClaimsRequest, resetDownloadStatus } from '../../../redux/actions/financeAction';
import rootSaga from '../../../redux/sagas/rootSaga';
import React from 'react';
import { toast } from 'react-toastify';
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const sagaMiddleware = createSagaMiddleware();
const mockStore = configureStore([sagaMiddleware]);

describe('FinanceDownLoadModal Component', () => {
    let store;
    let setIsOpenDownloadModal;

    beforeEach(() => {
        setIsOpenDownloadModal = jest.fn();
        store = mockStore({
            finance: {
                downloadSusses: false,
                isDownloadLoading: false,
                error: null,
            },
        });
        sagaMiddleware.run(rootSaga);
    });

    test('Displays modal form when isOpenDownloadModal is true', () => {
        render(
            <Provider store={store}>
                <FinanceDownLoadModal isOpenDownloadModal={true} setIsOpenDownloadModal={setIsOpenDownloadModal} />
            </Provider>
        );

        expect(screen.getByText('Download Claims')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter month (1-12)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter year (e.g., 2025)')).toBeInTheDocument();
    });

    test('Dispatches downloadClaimsRequest action when valid data is entered and Download is clicked', () => {
        render(
            <Provider store={store}>
                <FinanceDownLoadModal isOpenDownloadModal={true} setIsOpenDownloadModal={setIsOpenDownloadModal} />
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Enter month (1-12)'), { target: { value: '3' } });
        fireEvent.change(screen.getByPlaceholderText('Enter year (e.g., 2025)'), { target: { value: '2025' } });
        fireEvent.click(screen.getByText('Download'));

        expect(store.getActions()).toContainEqual(downloadClaimsRequest(3, 2025));
    });

    test('Dispatches downloadClaimsRequest action when valid data is entered but no data exists for that time period', () => {
        store = mockStore({
            finance: {
                downloadSusses: false,
                isDownloadLoading: false,
                error: "No Paid Claims data found for the requested month",
            },
        });

        render(
            <Provider store={store}>
                <FinanceDownLoadModal
                    isOpenDownloadModal={true}
                    setIsOpenDownloadModal={setIsOpenDownloadModal}
                />
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Enter month (1-12)'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('Enter year (e.g., 2025)'), { target: { value: '2025' } });
        fireEvent.click(screen.getByText('Download'));

        expect(toast.error).toHaveBeenCalledWith("No Paid Claims data found for the requested month");
    });


    test('Displays error when invalid data is entered', () => {
        render(
            <Provider store={store}>
                <FinanceDownLoadModal isOpenDownloadModal={true} setIsOpenDownloadModal={setIsOpenDownloadModal} />
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Enter month (1-12)'), { target: { value: '13' } });
        fireEvent.change(screen.getByPlaceholderText('Enter year (e.g., 2025)'), { target: { value: '1999' } });
        fireEvent.click(screen.getByText('Download'));

        expect(screen.getByText('Month must be between 1 and 12')).toBeInTheDocument();
        expect(screen.getByText('Year must be between 2000 and 2100')).toBeInTheDocument();
        expect(store.getActions()).toHaveLength(0);
    });

    test('Calls setIsOpenDownloadModal(false) when Cancel button is clicked', () => {
        render(
            <Provider store={store}>
                <FinanceDownLoadModal isOpenDownloadModal={true} setIsOpenDownloadModal={setIsOpenDownloadModal} />
            </Provider>
        );

        fireEvent.click(screen.getByText('Cancel'));

        expect(setIsOpenDownloadModal).toHaveBeenCalledWith(false);
    });

    test('Closes modal and resets state when download is successful', () => {
        store = mockStore({
            finance: {
                downloadSusses: true,
                isDownloadLoading: false,
                error: null,
            },
        });
        sagaMiddleware.run(rootSaga);
        render(
            <Provider store={store}>
                <FinanceDownLoadModal isOpenDownloadModal={true} setIsOpenDownloadModal={setIsOpenDownloadModal} />
            </Provider>
        );

        expect(setIsOpenDownloadModal).toHaveBeenCalledWith(false);
        const actions = store.getActions();
        expect(actions).toContainEqual(resetDownloadStatus());
    });
});