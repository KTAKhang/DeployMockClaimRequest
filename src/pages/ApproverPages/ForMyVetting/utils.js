// utils.js
export const filterPendingClaims = (claims) => {
  return claims?.filter((claim) => claim.status === "Pending") || [];
};

export const hasClaimsChanged = (previousClaims, currentClaims) => {
  return JSON.stringify(previousClaims) !== JSON.stringify(currentClaims);
};
