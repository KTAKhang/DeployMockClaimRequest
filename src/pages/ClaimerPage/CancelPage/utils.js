import { CANCELLED_STATUS } from "./constants";

export const filterCancelledClaims = (claims) => {
    return claims.filter((claim) => claim.status === CANCELLED_STATUS);
};
