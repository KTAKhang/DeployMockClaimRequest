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

// Define the navigation action type
export const NAVIGATE_TO_CLAIM = "NAVIGATE_TO_CLAIM";

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
});

// Navigation middleware
const navigateMiddleware = (store) => (next) => (action) => {
  if (action.type === NAVIGATE_TO_CLAIM) {
    // Use your router's navigate function
    // For React Router v6, you might use a custom hook approach instead
    window.location.href = action.payload; // Simple but causes full page refresh
    // Or better: history.push(action.payload); if you're using history
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
