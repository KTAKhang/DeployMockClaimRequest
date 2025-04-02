// store.js
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/rootSaga";
import authReducer from "./reducers/authReducer";
import projectReducer from "./reducers/projectReducer";
import staffReducer from "./reducers/staffReducer";
import claimReducer from "./reducers/approverClaimReducer";
import financeReducer from "./reducers/financeReducer";
import userReducer from "./reducers/userReducer";
import claimerReducer from "./reducers/claimerReducer";
import commentReducer from "./reducers/commentReducer";
import notificationReducer from "./reducers/notificationReducer";
import chatReducer from "./reducers/chatReducer";
import changePasswordReducer from "./reducers/changePasswordReducer";
import forgotPasswordReducer from "./reducers/forgotPasswordReducer";
import { verifyCodeReducer } from "./reducers/verifyCodeReducer";

// Define navigation action types
export const NAVIGATE_TO_CLAIM = "NAVIGATE_TO_CLAIM";
export const SET_NAVIGATOR = "SET_NAVIGATOR";

// Create a navigator function that will be set from the component
let navigate = null;

// Action creator to set the navigator function
export const setNavigator = (navigatorFn) => ({
  type: SET_NAVIGATOR,
  payload: navigatorFn,
});

const rootReducer = combineReducers({
  auth: authReducer,
  claims: claimReducer,
  user: userReducer,
  finance: financeReducer,
  claimer: claimerReducer,
  projects: projectReducer,
  staff: staffReducer,
  comment: commentReducer,
  notifications: notificationReducer,
  chat: chatReducer,
  changePassword: changePasswordReducer,
  forgotPassword: forgotPasswordReducer,
  verifyCode: verifyCodeReducer,
});

// Updated navigation middleware
const navigateMiddleware = () => (next) => (action) => {
  if (action.type === NAVIGATE_TO_CLAIM) {
    if (navigate) {
      // Use the navigate function from React Router
      navigate(action.payload);
    } else {
      console.warn(
        "Navigation function not set. Make sure to dispatch setNavigator action."
      );
    }
  } else if (action.type === SET_NAVIGATOR) {
    navigate = action.payload;
  }
  return next(action);
};

const sagaMiddleware = createSagaMiddleware();

// Apply both middlewares
const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware, navigateMiddleware)
);

sagaMiddleware.run(rootSaga);

export default store;
