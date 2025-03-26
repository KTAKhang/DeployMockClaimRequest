const initialState = {
  claims: [],
  claimDetail: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const claimReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_CLAIMS_REQUEST":
    case "FETCH_CLAIM_DETAIL_REQUEST":
    case "UPDATE_CLAIM_STATUS_REQUEST":
      return { ...state, loading: true, error: null };

    case "FETCH_CLAIMS_SUCCESS": {
      // ✅ Check if claims data has actually changed
      const claimsChanged =
        JSON.stringify(state.claims) !== JSON.stringify(action.payload);
      return {
        ...state,
        loading: false,
        claims: action.payload,
        lastUpdated: claimsChanged ? Date.now() : state.lastUpdated,
      };
    }

    case "FETCH_CLAIM_DETAIL_SUCCESS":
      return { ...state, loading: false, claimDetail: action.payload };

    case "UPDATE_CLAIM_STATUS_SUCCESS":
      return {
        ...state,
        loading: false,
        claims: state.claims
          .map((claim) =>
            action.payload.ids.includes(claim.id)
              ? {
                  ...claim,
                  status: action.payload.status,
                  reason_approver: action.payload.reason_approver,
                }
              : claim
          )
          .filter((claim) => !action.payload.ids.includes(claim.id)),

        claimDetail:
          state.claimDetail &&
          action.payload.ids.includes(state.claimDetail._id)
            ? {
                ...state.claimDetail,
                status: action.payload.status,
                reason_approver: action.payload.reason_approver,
              }
            : state.claimDetail,

        lastUpdated: Date.now(),
      };

    case "FETCH_CLAIMS_FAILURE":
    case "FETCH_CLAIM_DETAIL_FAILURE":
    case "UPDATE_CLAIM_STATUS_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "REMOVE_PROCESSED_CLAIMS":
      return {
        ...state,
        claims: state.claims.filter(
          (claim) => !action.payload.includes(claim.id)
        ),
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
};

export default claimReducer;
