// utils.js
export const processClaimData = (claims) => {
    const approvedClaims = claims.filter((claim) => claim.status === "Approved");
    const paidClaims = claims.filter((claim) => claim.status === "Paid");

    return {
        approvedClaims,
        paidClaims,
        totalClaims: approvedClaims.length + paidClaims.length
    };
};

export const createCardData = (claimData, colors, routes) => {
    return [
        {
            label: "Total Claims",
            value: claimData.totalClaims,
            color: colors.TOTAL_CLAIMS,
            link: routes.TOTAL,
        },
        {
            label: "Approved Claims",
            value: claimData.approvedClaims.length,
            color: colors.APPROVED_CLAIMS,
            link: routes.APPROVED,
        },
        {
            label: "Paid Claims",
            value: claimData.paidClaims.length,
            color: colors.PAID_CLAIMS,
            link: routes.PAID,
        },
    ];
};