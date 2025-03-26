import {
    FINANCE_FETCH_APPROVED_CLAIM_REQUEST,
    FINANCE_FETCH_APPROVED_CLAIM_SUCCESS,
    FINANCE_FETCH_APPROVED_CLAIM_FAILURE,
    FINANCE_FETCH_PAID_CLAIM_REQUEST,
    FINANCE_FETCH_PAID_CLAIM_SUCCESS,
    FINANCE_FETCH_PAID_CLAIM_FAILURE,
    FINANCE_FETCH_CLAIM_DETAIL_REQUEST,
    FINANCE_FETCH_CLAIM_DETAIL_SUCCESS,
    FINANCE_FETCH_CLAIM_DETAIL_FAILURE,
    FINANCE_FETCH_CLAIMS_REQUEST,
    FINANCE_FETCH_CLAIMS_SUCCESS,
    FINANCE_FETCH_CLAIMS_FAILURE,
    FINANCE_DOWNLOAD_CLAIMS_REQUEST,
    FINANCE_DOWNLOAD_CLAIMS_SUCCESS,
    FINANCE_DOWNLOAD_CLAIMS_FAILURE,
    RESET_DOWNLOAD_STATUS,
    FINANCE_PAID_CLAIMS_REQUEST,
    FINANCE_PAID_CLAIMS_SUCCESS,
    FINANCE_PAID_CLAIMS_FAILURE,
    RESET_PAID_STATUS,
    FINANCE_UPDATE_CLAIM_STATUS_REQUEST,
    FINANCE_UPDATE_CLAIM_STATUS_SUCCESS,
    FINANCE_UPDATE_CLAIM_STATUS_FAILURE,
} from "../actions/financeAction";

const initialState = {
    claims: [],
    claimDetail: null,
    isPaidLoading: false,
    isPaidSuccess: false,
    isDownloadLoading: false,
    downloadSusses: false,
    loading: false,
    error: null,
    totalPages: 1,
    totalClaim: 0,
};

const financeReducer = (state = initialState, action) => {
    switch (action.type) {
        case FINANCE_PAID_CLAIMS_REQUEST:
            return { ...state, isPaidLoading: true, error: null };
        case FINANCE_FETCH_CLAIMS_REQUEST:
        case FINANCE_FETCH_APPROVED_CLAIM_REQUEST:
        case FINANCE_FETCH_PAID_CLAIM_REQUEST:
        case FINANCE_FETCH_CLAIM_DETAIL_REQUEST:
        case FINANCE_UPDATE_CLAIM_STATUS_REQUEST:
            return { ...state, loading: true, error: null };
        case FINANCE_DOWNLOAD_CLAIMS_REQUEST:
            return { ...state, isDownloadLoading: true, error: null };

        case FINANCE_FETCH_CLAIMS_SUCCESS:
            return { ...state, loading: false, claims: action.payload };

        case FINANCE_FETCH_APPROVED_CLAIM_SUCCESS:
        case FINANCE_FETCH_PAID_CLAIM_SUCCESS:
            return {
                ...state,
                loading: false,
                claims: Array.isArray(action.payload.claims) ? action.payload.claims : [],
                totalPages: action.payload.totalPages || 1,
                totalClaim: action.payload.totalItems || 0,
            };

        case FINANCE_FETCH_CLAIM_DETAIL_SUCCESS:

            return { ...state, loading: false, claimDetail: action.payload };

        case FINANCE_DOWNLOAD_CLAIMS_SUCCESS:
            return { ...state, loading: false, downloadSusses: true, isDownloadLoading: false };
        case RESET_DOWNLOAD_STATUS:
            return { ...state, downloadSusses: false };

        case FINANCE_PAID_CLAIMS_SUCCESS:
            return { ...state, isPaidLoading: false, isPaidSuccess: true };
        case RESET_PAID_STATUS:
            return { ...state, isPaidSuccess: false };
        case FINANCE_UPDATE_CLAIM_STATUS_SUCCESS:

            return {
                ...state,
                loading: false,
                isPaidSuccess: true,
                claims: Array.isArray(state.claims)
                    ? state.claims
                        .filter((claim) => claim !== undefined && claim !== null)
                        .map((claim) =>
                            claim.id && action.payload.ids.includes(claim.id)
                                ? { ...claim, status: { ...claim.status, name: action.payload.status } }
                                : claim
                        )
                    : [],
                claimDetail: state.claimDetail && action.payload.ids.includes(state.claimDetail._id)
                    ? { ...state.claimDetail, status: { ...state.claimDetail.status, name: action.payload.status } }
                    : state.claimDetail,
            };

        case FINANCE_DOWNLOAD_CLAIMS_FAILURE:
            return { ...state, loading: false, error: action.payload, isDownloadLoading: false };
        case FINANCE_FETCH_CLAIMS_FAILURE:
        case FINANCE_FETCH_APPROVED_CLAIM_FAILURE:
        case FINANCE_FETCH_PAID_CLAIM_FAILURE:
        case FINANCE_FETCH_CLAIM_DETAIL_FAILURE:
        case FINANCE_PAID_CLAIMS_FAILURE:
        case FINANCE_UPDATE_CLAIM_STATUS_FAILURE:
            return { ...state, loading: false, error: action.payload, isPaidSuccess: false };
        default:
            return state;
    }
};

export default financeReducer;
