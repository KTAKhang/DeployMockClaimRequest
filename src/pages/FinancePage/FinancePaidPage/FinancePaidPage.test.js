import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';
import { runSaga } from 'redux-saga';
import FinancePaidPage from './FinancePaidPage';
import { fetchClaimsRequest } from '../../../redux/actions/financeAction';

jest.mock('../../../redux/actions/financeAction', () => ({
    fetchClaimsRequest: jest.fn().mockReturnValue({ type: 'FETCH_CLAIMS_REQUEST' })
}));

jest.mock('../../../components/Table/ClaimsTable', () => {
    return jest.fn(({ title, claimsData, filterCondition }) => (
        <div data-testid="claims-table">
            <h2>{title}</h2>
            <div data-testid="claims-count">{claimsData.length}</div>
            <div data-testid="filter-condition">{filterCondition}</div>
        </div>
    ));
});

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const mockStore = configureStore(middlewares);

describe('FinancePaidPage Component', () => {
    let store;

    beforeEach(() => {

        jest.clearAllMocks();
    });

    it('should dispatch fetchClaimsRequest action on mount', () => {

        store = mockStore({
            finance: {
                claims: [],
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinancePaidPage />
            </Provider>
        );


        const actions = store.getActions();
        expect(actions).toEqual([{ type: 'FETCH_CLAIMS_REQUEST' }]);
        expect(fetchClaimsRequest).toHaveBeenCalledWith({});
    });

    it('should render ClaimsTable with correct props and filtered data', () => {

        const mockClaims = [
            { id: 1, status: 'Paid', amount: 100 },
            { id: 2, status: 'Unpaid', amount: 200 },
            { id: 3, status: 'Paid', amount: 300 },
            { id: 4, status: 'Processing', amount: 400 }
        ];

        store = mockStore({
            finance: {
                claims: mockClaims,
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinancePaidPage />
            </Provider>
        );


        expect(screen.getByText('Paid Claims')).toBeInTheDocument();


        expect(screen.getByTestId('claims-count').textContent).toBe('2');


        expect(screen.getByTestId('filter-condition').textContent).toBe('FinancePaid');
    });



    it('should handle empty claims array', () => {

        store = mockStore({
            finance: {
                claims: [],
                error: null
            }
        });

        render(
            <Provider store={store}>
                <FinancePaidPage />
            </Provider>
        );


        expect(screen.getByTestId('claims-count').textContent).toBe('0');
    });

    it('should handle undefined state.finance', () => {

        store = mockStore({});

        render(
            <Provider store={store}>
                <FinancePaidPage />
            </Provider>
        );

        expect(screen.getByTestId('claims-count').textContent).toBe('0');
    });
});