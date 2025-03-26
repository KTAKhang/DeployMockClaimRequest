import {
    CLAIMER_FETCH_CLAIMS_REQUEST,
    CLAIMER_FETCH_CLAIMS_SUCCESS,
    CLAIMER_FETCH_CLAIMS_FAILURE,
    CLAIMER_FETCH_CLAIM_DETAIL_REQUEST,
    CLAIMER_FETCH_CLAIM_DETAIL_SUCCESS,
    CLAIMER_FETCH_CLAIM_DETAIL_FAILURE,
    FETCH_PROJECTS_REQUEST,
    FETCH_PROJECTS_SUCCESS,
    FETCH_PROJECTS_FAILURE,
    CREATE_CLAIM_REQUEST,
    CREATE_CLAIM_SUCCESS,
    CREATE_CLAIM_FAILURE,
    UPDATE_CLAIM_REQUEST,
    UPDATE_CLAIM_SUCCESS,
    UPDATE_CLAIM_FAILURE,
    RESET_UPDATE_STATE,
    CLAIMER_UPDATE_CLAIM_REQUEST,
    CLAIMER_UPDATE_CLAIM_SUCCESS,
    CLAIMER_UPDATE_CLAIM_FAILURE,
    CLAIMER_REMOVE_PROCESSED_CLAIMS,
    BULK_UPDATE_CLAIM_REQUEST,
    BULK_UPDATE_CLAIM_SUCCESS,
    BULK_UPDATE_CLAIM_FAILURE,

} from "../actions/claimerActions";

const initialState = {
    claims: [],
    loading: false,
    error: null,
    claimDetail: null,
    projects: [],
    projectsLoading: false,
    projectsError: null,
    createClaimLoading: false,
    createClaimError: null,
    createClaimSuccess: false,
    updateClaimLoading: false,
    updateClaimError: null,
    updateClaimSuccess: false,
    bulkUpdateLoading: false,
    bulkUpdateError: null,
};

const updateClaimInList = (claims, updatedClaim) => {
    return claims.map(claim =>
        claim.id === updatedClaim.id ? { ...claim, ...updatedClaim } : claim
    );
};

const claimReducer = (state = initialState, action) => {
    switch (action.type) {
        case CLAIMER_FETCH_CLAIMS_REQUEST:
            return { ...state, loading: true, error: null };

        case CLAIMER_FETCH_CLAIMS_SUCCESS:
            return { ...state, loading: false, claims: action.payload };

        case CLAIMER_FETCH_CLAIMS_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case CLAIMER_FETCH_CLAIM_DETAIL_REQUEST:
            return { ...state, loading: true, error: null };

        case CLAIMER_FETCH_CLAIM_DETAIL_SUCCESS:
            return { ...state, loading: false, claimDetail: action.payload };

        case CLAIMER_FETCH_CLAIM_DETAIL_FAILURE:
            console.log(action.payload);
            return { ...state, loading: false, error: action.payload };

        case FETCH_PROJECTS_REQUEST:
            return { ...state, projectsLoading: true, projectsError: null };

        case FETCH_PROJECTS_SUCCESS:
            return { ...state, projectsLoading: false, projects: action.payload };

        case FETCH_PROJECTS_FAILURE:
            return { ...state, projectsLoading: false, projectsError: action.payload };

        case CREATE_CLAIM_REQUEST:
            return {
                ...state,
                createClaimLoading: true,
                createClaimError: null,
                createClaimSuccess: false
            };

        case CREATE_CLAIM_SUCCESS:
            return {
                ...state,
                createClaimLoading: false,
                createClaimSuccess: true,
                createClaimError: null,
                claims: action.payload ? [action.payload, ...state.claims] : state.claims
            };

        case CREATE_CLAIM_FAILURE:
            return {
                ...state,
                createClaimLoading: false,
                createClaimError: action.payload,
                createClaimSuccess: false
            };

        case UPDATE_CLAIM_REQUEST:
            return {
                ...state,
                updateClaimLoading: true,
                updateClaimError: null,
                updateClaimSuccess: false
            };

        case UPDATE_CLAIM_SUCCESS:
            return {
                ...state,
                updateClaimLoading: false,
                updateClaimSuccess: true,
                updateClaimError: null,
                claims: updateClaimInList(state.claims, action.payload),
                claimDetail: state.claimDetail?.id === action.payload.id 
                    ? { ...state.claimDetail, ...action.payload }
                    : state.claimDetail
            };

        case UPDATE_CLAIM_FAILURE:
            return {
                ...state,
                updateClaimLoading: false,
                updateClaimError: action.payload,
                updateClaimSuccess: false
            };

        case RESET_UPDATE_STATE:
            return {
                ...state,
                updateClaimLoading: false,
                updateClaimSuccess: false,
                updateClaimError: null
            };

        case CLAIMER_UPDATE_CLAIM_REQUEST:
            return { ...state, loading: true, error: null };
        case CLAIMER_UPDATE_CLAIM_SUCCESS:
            return {
                ...state,
                loading: false,
                claimDetail: state.claimDetail
                    ? { ...state.claimDetail, status: action.payload.status }
                    : null,
            };
        case CLAIMER_UPDATE_CLAIM_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case CLAIMER_REMOVE_PROCESSED_CLAIMS:
            return {
                ...state,
                claims: state.claims.filter(
                    (claim) => !action.payload.includes(claim.id)
                ), // ✅ Remove processed claims
            };

        case BULK_UPDATE_CLAIM_REQUEST:
            return { ...state, bulkUpdateLoading: true, bulkUpdateError: null };

        case BULK_UPDATE_CLAIM_SUCCESS:
            return {
                ...state,
                bulkUpdateLoading: false,
                claims: state.claims.map((claim) => {
                    const updatedClaim = action.payload.data.find((u) => u._id === claim._id);
                    return updatedClaim ? { ...claim, ...updatedClaim } : claim;
                }),
            };
        case BULK_UPDATE_CLAIM_FAILURE:
            return { ...state, bulkUpdateLoading: false, bulkUpdateError: action.payload };
        default:
            return state;
    }
};

export default claimReducer;


