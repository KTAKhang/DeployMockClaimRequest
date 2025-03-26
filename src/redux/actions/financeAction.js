export const FINANCE_FETCH_APPROVED_CLAIM_REQUEST = "FINANCE_FETCH_APPROVED_CLAIM_REQUEST";
export const FINANCE_FETCH_APPROVED_CLAIM_SUCCESS = "FINANCE_FETCH_APPROVED_CLAIM_SUCCESS";
export const FINANCE_FETCH_APPROVED_CLAIM_FAILURE = "FINANCE_FETCH_APPROVED_CLAIM_FAILURE";
export const FINANCE_FETCH_PAID_CLAIM_REQUEST = "FINANCE_FETCH_PAID_CLAIM_REQUEST";
export const FINANCE_FETCH_PAID_CLAIM_SUCCESS = "FINANCE_FETCH_PAID_CLAIM_SUCCESS";
export const FINANCE_FETCH_PAID_CLAIM_FAILURE = "FINANCE_FETCH_PAID_CLAIM_FAILURE";
export const FINANCE_FETCH_CLAIM_DETAIL_REQUEST = "FINANCE_FETCH_CLAIM_DETAIL_REQUEST";
export const FINANCE_FETCH_CLAIM_DETAIL_SUCCESS = "FINANCE_FETCH_CLAIM_DETAIL_SUCCESS";
export const FINANCE_FETCH_CLAIM_DETAIL_FAILURE = "FINANCE_FETCH_CLAIM_DETAIL_FAILURE";

export const financeFetchApprovedRequest = (token, currentPage, PAGE_SIZE) => ({
    type: FINANCE_FETCH_APPROVED_CLAIM_REQUEST,
    payload: { token, currentPage, PAGE_SIZE },
});

export const financeFetchApprovedSuccess = ({ claims, totalPages, currentPage, totalItems }) => ({
    type: FINANCE_FETCH_APPROVED_CLAIM_SUCCESS,
    payload: { claims, totalPages, currentPage, totalItems },
});

export const financeFetchApprovedFailure = (error) => ({
    type: FINANCE_FETCH_APPROVED_CLAIM_FAILURE,
    payload: error,
});

export const financeFetchPaidRequest = (token, currentPage, PAGE_SIZE) => ({
    type: FINANCE_FETCH_PAID_CLAIM_REQUEST,
    payload: { token, currentPage, PAGE_SIZE },
});

export const financeFetchPaidSuccess = ({ claims, totalPages, currentPage, totalItems }) => ({
    type: FINANCE_FETCH_PAID_CLAIM_SUCCESS,
    payload: { claims, totalPages, currentPage, totalItems },
});

export const financeFetchPaidFailure = (error) => ({
    type: FINANCE_FETCH_PAID_CLAIM_FAILURE,
    payload: error,
});

export const financeFetchDetailRequest = (id) => ({
    type: FINANCE_FETCH_CLAIM_DETAIL_REQUEST,
    payload: { id },
});

export const financeFetchDetailSuccess = (claimDetail) => ({
    type: FINANCE_FETCH_CLAIM_DETAIL_SUCCESS,
    payload: claimDetail,
});

export const financeFetchDetailFailure = (error) => ({
    type: FINANCE_FETCH_CLAIM_DETAIL_FAILURE,
    payload: error,
});

export const FINANCE_FETCH_CLAIMS_REQUEST = "FINANCE_FETCH_CLAIMS_REQUEST"
export const FINANCE_FETCH_CLAIMS_SUCCESS = "FINANCE_FETCH_CLAIMS_SUCCESS"
export const FINANCE_FETCH_CLAIMS_FAILURE = "FINANCE_FETCH_CLAIMS_FAILURE"

export const fetchClaimsRequest = (filters) => ({
    type: FINANCE_FETCH_CLAIMS_REQUEST,
    payload: filters,
});

export const fetchClaimsSuccess = (claims) => ({
    type: FINANCE_FETCH_CLAIMS_SUCCESS,
    payload: claims,
});

export const fetchClaimsFailure = (error) => ({
    type: FINANCE_FETCH_CLAIMS_FAILURE,
    payload: error,
});

export const FINANCE_DOWNLOAD_CLAIMS_REQUEST = "FINANCE_DOWNLOAD_CLAIMS_REQUEST"
export const FINANCE_DOWNLOAD_CLAIMS_SUCCESS = "FINANCE_DOWNLOAD_CLAIMS_SUCCESS"
export const FINANCE_DOWNLOAD_CLAIMS_FAILURE = "FINANCE_DOWNLOAD_CLAIMS_FAILURE"
export const RESET_DOWNLOAD_STATUS = "RESET_DOWNLOAD_STATUS";

export const downloadClaimsRequest = (month, year) => ({
    type: FINANCE_DOWNLOAD_CLAIMS_REQUEST,
    payload: { month, year },
});

export const downloadClaimsSuccess = (downloadSusses) => ({
    type: FINANCE_DOWNLOAD_CLAIMS_SUCCESS,
    payload: downloadSusses,
});

export const downloadClaimsFailure = (error) => ({
    type: FINANCE_DOWNLOAD_CLAIMS_FAILURE,
    payload: error,
});


export const resetDownloadStatus = () => ({
    type: RESET_DOWNLOAD_STATUS,
});

export const FINANCE_PAID_CLAIMS_REQUEST = "FINANCE_PAID_CLAIMS_REQUEST"
export const FINANCE_PAID_CLAIMS_SUCCESS = "FINANCE_PAID_CLAIMS_SUCCESS"
export const FINANCE_PAID_CLAIMS_FAILURE = "FINANCE_PAID_CLAIMS_FAILURE"
export const RESET_PAID_STATUS = "RESET_PAID_STATUS"
export const financePaidClaimsRequest = (claimId) => ({
    type: FINANCE_PAID_CLAIMS_REQUEST,
    payload: claimId,
});

export const financePaidClaimsSuccess = ({ id, status }) => ({
    type: FINANCE_PAID_CLAIMS_SUCCESS,
    payload: { id, status },
});

export const financePaidClaimsFailure = (error) => ({
    type: FINANCE_PAID_CLAIMS_FAILURE,
    payload: error,
});

export const resetIsPaidStatus = () => ({
    type: RESET_PAID_STATUS,
});

// 🆕 Bulk Actions for Approve/Reject Claims
export const FINANCE_UPDATE_CLAIM_STATUS_REQUEST = "FINANCE_UPDATE_CLAIM_STATUS_REQUEST";
export const FINANCE_UPDATE_CLAIM_STATUS_SUCCESS = "FINANCE_UPDATE_CLAIM_STATUS_SUCCESS";
export const FINANCE_UPDATE_CLAIM_STATUS_FAILURE = "FINANCE_UPDATE_CLAIM_STATUS_FAILURE";

export const financeUpdateClaimStatusRequest = (ids,
    status) => ({
        type: FINANCE_UPDATE_CLAIM_STATUS_REQUEST,
        payload: { ids: Array.isArray(ids) ? ids : [ids], status },
    });

export const financeUpdateClaimStatusSuccess = ({ ids, status }) => ({
    type: FINANCE_UPDATE_CLAIM_STATUS_SUCCESS,
    payload: { ids: Array.isArray(ids) ? ids : [ids], status },
});

export const financeUpdateClaimStatusFailure = (error) => ({
    type: FINANCE_UPDATE_CLAIM_STATUS_FAILURE,
    payload: error,
});

export const removeProcessedClaims = (claimIds) => ({
    type: "REMOVE_PROCESSED_CLAIMS",
    payload: claimIds,
});