import { APPROVED_STATUS } from "./constants";

export const filterApprovedClaims = (claims) => {
    return claims.filter((claim) => claim.status === APPROVED_STATUS);
};
