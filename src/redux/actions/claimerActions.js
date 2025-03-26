export const CLAIMER_FETCH_CLAIMS_REQUEST = "CLAIMER_FETCH_CLAIMS_REQUEST";
export const CLAIMER_FETCH_CLAIMS_SUCCESS = "CLAIMER_FETCH_CLAIMS_SUCCESS";
export const CLAIMER_FETCH_CLAIMS_FAILURE = "CLAIMER_FETCH_CLAIMS_FAILURE";

export const CLAIMER_FETCH_CLAIM_DETAIL_REQUEST = "CLAIMER_FETCH_CLAIM_DETAIL_REQUEST";
export const CLAIMER_FETCH_CLAIM_DETAIL_SUCCESS = "CLAIMER_FETCH_CLAIM_DETAIL_SUCCESS";
export const CLAIMER_FETCH_CLAIM_DETAIL_FAILURE = "CLAIMER_FETCH_CLAIM_DETAIL_FAILURE";

export const FETCH_PROJECTS_REQUEST = "FETCH_PROJECTS_REQUEST";
export const FETCH_PROJECTS_SUCCESS = "FETCH_PROJECTS_SUCCESS";
export const FETCH_PROJECTS_FAILURE = "FETCH_PROJECTS_FAILURE";

export const CREATE_CLAIM_REQUEST = "CREATE_CLAIM_REQUEST";
export const CREATE_CLAIM_SUCCESS = "CREATE_CLAIM_SUCCESS";
export const CREATE_CLAIM_FAILURE = "CREATE_CLAIM_FAILURE";

export const UPDATE_CLAIM_REQUEST = "UPDATE_CLAIM_REQUEST";
export const UPDATE_CLAIM_SUCCESS = "UPDATE_CLAIM_SUCCESS";
export const UPDATE_CLAIM_FAILURE = "UPDATE_CLAIM_FAILURE";

export const CLAIMER_UPDATE_CLAIM_REQUEST = "CLAIMER_UPDATE_CLAIM_REQUEST";
export const CLAIMER_UPDATE_CLAIM_SUCCESS = "CLAIMER_UPDATE_CLAIM_SUCCESS";
export const CLAIMER_UPDATE_CLAIM_FAILURE = "CLAIMER_UPDATE_CLAIM_FAILURE";

export const RESET_UPDATE_STATE = 'RESET_UPDATE_STATE';

export const CLAIMER_REMOVE_PROCESSED_CLAIMS = "CLAIMER_REMOVE_PROCESSED_CLAIMS";

export const ADD_NEW_CLAIM_TO_LIST = 'ADD_NEW_CLAIM_TO_LIST';

export const BULK_UPDATE_CLAIM_REQUEST = "BULK_UPDATE_CLAIM_REQUEST";
export const BULK_UPDATE_CLAIM_SUCCESS = "BULK_UPDATE_CLAIM_SUCCESS";
export const BULK_UPDATE_CLAIM_FAILURE = "BULK_UPDATE_CLAIM_FAILURE";

export const fetchClaimsRequestClaimer = (filters) => ({
    type: CLAIMER_FETCH_CLAIMS_REQUEST,
    payload: filters,
});

export const fetchClaimsSuccess = (claims) => ({
    type: CLAIMER_FETCH_CLAIMS_SUCCESS,
    payload: claims,
});

export const fetchClaimsFailure = (error) => ({
    type: CLAIMER_FETCH_CLAIMS_FAILURE,
    payload: error,
});


export const fetchClaimDetailRequest = (id) => ({
    type: CLAIMER_FETCH_CLAIM_DETAIL_REQUEST,
    payload: id,
});

export const fetchClaimDetailSuccess = (claim) => ({
    type: CLAIMER_FETCH_CLAIM_DETAIL_SUCCESS,
    payload: claim,
});

export const fetchClaimDetailFailure = (error) => ({
    type: CLAIMER_FETCH_CLAIM_DETAIL_FAILURE,
    payload: error,
});

export const fetchProjectsRequest = () => ({
    type: FETCH_PROJECTS_REQUEST
});

export const fetchProjectsSuccess = (projects) => ({
    type: FETCH_PROJECTS_SUCCESS,
    payload: projects
});

export const fetchProjectsFailure = (error) => ({
    type: FETCH_PROJECTS_FAILURE,
    payload: error
});

export const createClaimRequest = (claimData) => ({
    type: CREATE_CLAIM_REQUEST,
    payload: claimData
});

export const createClaimSuccess = (response) => ({
    type: CREATE_CLAIM_SUCCESS,
    payload: response
});

export const createClaimFailure = (error) => ({
    type: CREATE_CLAIM_FAILURE,
    payload: error
});

export const updateClaimRequest = (id, claimData) => ({
    type: UPDATE_CLAIM_REQUEST,
    payload: { id, claimData }
});

export const updateClaimSuccess = (response) => ({
    type: UPDATE_CLAIM_SUCCESS,
    payload: response
});

export const updateClaimFailure = (error) => ({
    type: UPDATE_CLAIM_FAILURE,
    payload: error
});

export const resetUpdateState = () => ({
    type: RESET_UPDATE_STATE
});

export const updateClaimRequestDraft = (id, status) => ({
    type: CLAIMER_UPDATE_CLAIM_REQUEST,
    payload: { id, status },
});

export const updateClaimSuccessDraft = (claim) => ({
    type: CLAIMER_UPDATE_CLAIM_SUCCESS,
    payload: claim,
});

export const updateClaimFailureDraft = (error) => ({
    type: CLAIMER_UPDATE_CLAIM_FAILURE,
    payload: error,
});

export const claimerRemoveProcessedClaims = (claimIds) => ({
    type: CLAIMER_REMOVE_PROCESSED_CLAIMS,
    payload: claimIds,
});


export const bulkUpdateClaimRequest = (claimsData) => ({
    type: BULK_UPDATE_CLAIM_REQUEST,
    payload: claimsData,
});

export const bulkUpdateClaimSuccess = (response) => ({
    type: BULK_UPDATE_CLAIM_SUCCESS,
    payload: response,
});

export const bulkUpdateClaimFailure = (error) => ({
    type: BULK_UPDATE_CLAIM_FAILURE,
    payload: error,
});