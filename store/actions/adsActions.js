import * as types from "./actionTypes";
import * as adsApi from "../api/adsApi";
import { beginApiCall, apiCallError } from "./apiStatusActions";

function callADSSalesSuccess() {
  return { type: types.CALL_SALES_SUCCESS};
}

export function adsSales() {
  return function (dispatch) {
    dispatch(beginApiCall());
    return adsApi
      .sales3x()
      .then(() => {
        dispatch(callADSSalesSuccess());
      })
      .catch((error) => {
        dispatch(apiCallError(error));
        throw error;
      });
  };
}

