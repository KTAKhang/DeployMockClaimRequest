export const VERIFY_CODE_REQUEST = "VERIFY_CODE_REQUEST";
export const VERIFY_CODE_SUCCESS = "VERIFY_CODE_SUCCESS";
export const VERIFY_CODE_FAILURE = "VERIFY_CODE_FAILURE";
export const RESET_VERIFICATION_CODE_STATE = "RESET_VERIFICATION_CODE_STATE";

export const REDIRECT_TO_LOGIN = "REDIRECT_TO_LOGIN";
export const redirectToLogin = () => ({
  type: REDIRECT_TO_LOGIN,
});

export const verifyCodeRequest = (payload) => ({
  type: VERIFY_CODE_REQUEST,
  payload,
});

export const resetVerificationCodeState = () => ({
  type: RESET_VERIFICATION_CODE_STATE,
});

export const verifyCodeSuccess = () => ({
  type: VERIFY_CODE_SUCCESS,
});

export const verifyCodeFailure = (error) => ({
  type: VERIFY_CODE_FAILURE,
  payload: error,
});
