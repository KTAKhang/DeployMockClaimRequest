// utils.js
import { DASHBOARD_CONFIG } from "./constants";

export const filterClaimsByStatus = (claims, status) => {
  return claims.filter((claim) => claim.status === status);
};

export const prepareClaimDisplay = (claims) => {
  const firstFiveClaims = claims.slice(
    0,
    DASHBOARD_CONFIG.INITIAL_CLAIMS_DISPLAY
  );
  const extraClaims = claims.slice(
    DASHBOARD_CONFIG.INITIAL_CLAIMS_DISPLAY,
    DASHBOARD_CONFIG.INITIAL_CLAIMS_DISPLAY + DASHBOARD_CONFIG.MAX_EXTRA_CLAIMS
  );

  return {
    firstFiveClaims,
    extraClaims,
    hasExtraClaims: extraClaims.length > 0,
  };
};

export const hasClaimsChanged = (previousClaims, currentClaims) => {
  return JSON.stringify(previousClaims) !== JSON.stringify(currentClaims);
};
