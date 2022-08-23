import * as types from "../actions/actionTypes";
import initialState from "./initialState";
export default function courseReducer(state = initialState.sales, action) {
  switch (action.type) {
    case types.CALL_SALES_SUCCESS:
      return action.sales;
    default:
      return state;
  }
}
