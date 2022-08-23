import { combineReducers } from "redux";
import adsServices from "./adsReducer";
import apiCallsInProgress from "./apiStatusReducer";
const rootReducer = combineReducers({
  adsServices,
  apiCallsInProgress,
});

export default rootReducer;
