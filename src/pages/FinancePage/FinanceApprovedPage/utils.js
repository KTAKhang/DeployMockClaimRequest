// util.js
import { CLAIM_STATUSES } from './constants';

/**
 * Filters claims by approved status
 * @param {Array} claims - List of claims to filter
 * @returns {Array} Filtered approved claims
 */
export const filterApprovedClaims = (claims = []) => {
    return claims.filter((claim) => claim.status === CLAIM_STATUSES.APPROVED);
};