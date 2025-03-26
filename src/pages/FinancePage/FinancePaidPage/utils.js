import { FINANCE_CONSTANTS } from './constants';

export const filterPaidClaims = (claims) => {
    return claims.filter((claim) => claim.status === FINANCE_CONSTANTS.PAID_STATUS);
};