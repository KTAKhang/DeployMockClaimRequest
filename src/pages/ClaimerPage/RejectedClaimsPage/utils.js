import { REJECTED_STATUS } from "./constants";

export const filterRejectedClaims = (claims) => {
    return claims.filter((claim) => claim.status === REJECTED_STATUS);
};
