import * as types from "./actionTypes";
import * as adsApi from "../api/adsApi";
import { beginApiCall, apiCallError } from "./apiStatusActions";

function callADSSalesSuccess(response) {
  return { type: types.CALL_SALES_SUCCESS,response};
}
function callPaymentRequestSuccess(paymentReq) {
  return { type: types.PAYMENT_REQUEST_SUCCESS, paymentReq};
}
export function adsSales(payload) {
  return function (dispatch) {
    dispatch(beginApiCall());
    return adsApi
      .sales3x(payload)
      .then((response) => {
        dispatch(callADSSalesSuccess(response));
      })
      .catch((error) => {
        dispatch(apiCallError(error));
        throw error;
      });
  };
}

export function fetchPaymentRequest(id) {
  return function (dispatch) {
    dispatch(beginApiCall());
    return adsApi
      .paymentRequest(id)
      .then((paymentReq) => {
        dispatch(callPaymentRequestSuccess(paymentReq));
      })
      .catch((error) => {
        dispatch(apiCallError(error));
        throw error;
      });
  };
}

