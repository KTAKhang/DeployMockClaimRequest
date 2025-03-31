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

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
