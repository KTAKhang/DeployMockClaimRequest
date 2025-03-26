// utils.js
import { CLAIM_STATUSES } from "./constants";

export const filterApprovedAndPaidClaims = (claims) => {
  return (
    claims?.filter(
      (claim) =>
        claim.status === CLAIM_STATUSES.APPROVED ||
        claim.status === CLAIM_STATUSES.PAID
    ) || []
  );
};

export const hasClaimsChanged = (previousClaims, currentClaims) => {
  return JSON.stringify(previousClaims) !== JSON.stringify(currentClaims);
};
