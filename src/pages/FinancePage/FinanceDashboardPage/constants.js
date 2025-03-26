// constants.js
export const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 30 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.2, duration: 0.5 },
    }),
};

export const CARD_COLORS = {
    TOTAL_CLAIMS: "#0E69AF",
    APPROVED_CLAIMS: "#F27226",
    PAID_CLAIMS: "#0DB04B"
};