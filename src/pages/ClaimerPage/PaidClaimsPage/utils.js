import { PAID_STATUS } from "./constants";

export const filterPaidClaims = (claims) => {
    return claims.filter((claim) => claim.status === PAID_STATUS);
};
