export const FETCH_CLAIMS_REQUEST = "FETCH_CLAIMS_REQUEST";
export const FETCH_CLAIMS_SUCCESS = "FETCH_CLAIMS_SUCCESS";
export const FETCH_CLAIMS_FAILURE = "FETCH_CLAIMS_FAILURE";

export const fetchClaimsRequest = (filters) => ({
  type: FETCH_CLAIMS_REQUEST,
  payload: filters,
});

export const fetchClaimsSuccess = (claims) => ({
  type: FETCH_CLAIMS_SUCCESS,
  payload: claims,
});

export const fetchClaimsFailure = (error) => ({
  type: FETCH_CLAIMS_FAILURE,
  payload: error,
});

export const FETCH_CLAIM_DETAIL_REQUEST = "FETCH_CLAIM_DETAIL_REQUEST";
export const FETCH_CLAIM_DETAIL_SUCCESS = "FETCH_CLAIM_DETAIL_SUCCESS";
export const FETCH_CLAIM_DETAIL_FAILURE = "FETCH_CLAIM_DETAIL_FAILURE";

export const fetchClaimDetailRequest = (id, mode) => ({
  type: FETCH_CLAIM_DETAIL_REQUEST,
  payload: { id, mode },
});

export const fetchClaimDetailSuccess = (claim) => ({
  type: FETCH_CLAIM_DETAIL_SUCCESS,
  payload: claim,
});

export const fetchClaimDetailFailure = (error) => ({
  type: FETCH_CLAIM_DETAIL_FAILURE,
  payload: error,
});

// 🆕 Bulk Actions for Approve/Reject Claims
export const UPDATE_CLAIM_STATUS_REQUEST = "UPDATE_CLAIM_STATUS_REQUEST";
export const UPDATE_CLAIM_STATUS_SUCCESS = "UPDATE_CLAIM_STATUS_SUCCESS";
export const UPDATE_CLAIM_STATUS_FAILURE = "UPDATE_CLAIM_STATUS_FAILURE";

/**
 * Dispatch this action to request a claim status update (single or multiple claims).
 * @param {Array|string} ids - A single ID or an array of claim IDs.
 * @param {string} status - "Approved" or "Rejected".
 * @param {string} reason_approver - Optional reason for rejection.
 */
export const updateClaimStatusRequest = (
  ids,
  status,
  reason_approver = ""
) => ({
  type: UPDATE_CLAIM_STATUS_REQUEST,
  payload: { ids: Array.isArray(ids) ? ids : [ids], status, reason_approver }, // ✅ Ensure it's always an array
});

/**
 * Dispatch this action when the claim status update succeeds.
 * @param {Array|string} ids - A single ID or an array of claim IDs.
 * @param {string} status - The updated status.
 * @param {string} reason_approver - Optional reason for rejection.
 */
export const updateClaimStatusSuccess = (
  ids,
  status,
  reason_approver = ""
) => ({
  type: UPDATE_CLAIM_STATUS_SUCCESS,
  payload: { ids: Array.isArray(ids) ? ids : [ids], status, reason_approver }, // ✅ Ensure it's always an array
});

export const updateClaimStatusFailure = (error) => ({
  type: UPDATE_CLAIM_STATUS_FAILURE,
  payload: error,
});

export const removeProcessedClaims = (claimIds) => ({
  type: "REMOVE_PROCESSED_CLAIMS",
  payload: claimIds,
});
