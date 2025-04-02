export const FORGOT_PASSWORD_REQUEST = "FORGOT_PASSWORD_REQUEST";
export const FORGOT_PASSWORD_SUCCESS = "FORGOT_PASSWORD_SUCCESS";
export const FORGOT_PASSWORD_FAILURE = "FORGOT_PASSWORD_FAILURE";

export const forgotPasswordRequest = (email) => ({
  type: FORGOT_PASSWORD_REQUEST,
  payload: email,
});

export const resetForgotPasswordState = () => ({
  type: "RESET_FORGOT_PASSWORD_STATE",
});

export const forgotPasswordSuccess = () => ({
  type: FORGOT_PASSWORD_SUCCESS,
});

export const forgotPasswordFailure = (message) => ({
  type: FORGOT_PASSWORD_FAILURE,
  payload: message,
});
