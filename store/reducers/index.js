import { combineReducers } from "redux";
import adsServices from "./adsReducer";
import apiCallsInProgress from "./apiStatusReducer";
import rewardReducer from "./rewardCardReducer";
const rootReducer = combineReducers({
  adsServices,
  apiCallsInProgress,
  rewardReducer
});

export default rootReducer;
