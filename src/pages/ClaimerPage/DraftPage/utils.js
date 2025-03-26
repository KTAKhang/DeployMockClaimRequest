import { DRAFT_STATUS } from "./constants";

export const filterDraftClaims = (claims) => {
    return claims.filter((claim) => claim.status === DRAFT_STATUS);
};
