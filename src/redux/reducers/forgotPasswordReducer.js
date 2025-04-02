import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
} from "../actions/forgotPasswordActions";

const initialState = {
  isVerificationSent: false,
  errorMessage: "",
  isLoading: false,
};

const RESET_FORGOT_PASSWORD_STATE = "RESET_FORGOT_PASSWORD_STATE";

const forgotPasswordReducer = (state = initialState, action) => {
  switch (action.type) {
    case FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        isLoading: true,
        errorMessage: "",
      };
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        isVerificationSent: true,
        isLoading: false,
      };
    case FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        errorMessage: action.payload,
        isLoading: false,
      };
    case RESET_FORGOT_PASSWORD_STATE:
      return initialState;
    default:
      return state;
  }
};

export default forgotPasswordReducer;
