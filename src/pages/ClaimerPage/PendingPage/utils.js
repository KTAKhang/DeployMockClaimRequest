import { PENDING_STATUS } from "./constants";

export const filterPendingClaims = (claims) => {
    return claims.filter((claim) => claim.status === PENDING_STATUS);
};
