import {
  VERIFY_CODE_REQUEST,
  VERIFY_CODE_SUCCESS,
  VERIFY_CODE_FAILURE,
  RESET_VERIFICATION_CODE_STATE,
  REDIRECT_TO_LOGIN,
} from "../actions/verifyCodeActions";

const initialState = {
  isLoading: false,
  isCodeVerified: false,
  error: null,
  redirectToLoginFlag: false,
};

export const verifyCodeReducer = (state = initialState, action) => {
  switch (action.type) {
    case VERIFY_CODE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case VERIFY_CODE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCodeVerified: true,
      };
    case VERIFY_CODE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case REDIRECT_TO_LOGIN:
      return {
        ...state,
        redirectToLoginFlag: true,
      };
    case RESET_VERIFICATION_CODE_STATE:
      return initialState;
    default:
      return state;
  }
};
