import * as types from "../actions/actionTypes";
import initialState from "./initialState";
export default function courseReducer(state = initialState.sales, action) {
  switch (action.type) {
    case types.CALL_SALES_SUCCESS:
      return { ...state,makeSalesResponse: action.response};
    case types.PAYMENT_REQUEST_SUCCESS:
      return { paymentReq: action.paymentReq};
    default:
      return state;
  }
}
