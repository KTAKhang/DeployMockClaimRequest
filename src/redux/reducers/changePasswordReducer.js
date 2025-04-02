import {
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
} from "../actions/changePasswordActions";

const initialState = {
  isLoading: false,
  successMessage: "",
  errorMessage: "",
};

const changePasswordReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        isLoading: true,
        successMessage: "",
        errorMessage: "",
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        successMessage: action.payload,
        errorMessage: "",
      };
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        isLoading: false,
        successMessage: "",
        errorMessage: action.payload,
      };
    default:
      return state;
  }
};

export default changePasswordReducer;
