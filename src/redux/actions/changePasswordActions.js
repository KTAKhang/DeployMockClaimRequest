export const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";
export const CHANGE_PASSWORD_SUCCESS = "CHANGE_PASSWORD_SUCCESS";
export const CHANGE_PASSWORD_FAILURE = "CHANGE_PASSWORD_FAILURE";

export const changePasswordRequest = (oldPassword, newPassword) => {
  return {
    type: CHANGE_PASSWORD_REQUEST,
    payload: { oldPassword, newPassword },
  };
};

export const changePasswordSuccess = (message) => {
  return {
    type: CHANGE_PASSWORD_SUCCESS,
    payload: message,
  };
};

export const changePasswordFailure = (error) => {
  return {
    type: CHANGE_PASSWORD_FAILURE,
    payload: error,
  };
};
