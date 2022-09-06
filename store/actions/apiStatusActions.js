import * as types from "./actionTypes";

export function beginApiCall() {
  return { type: types.BEGIN_API_CALL };
}
export function apiCallError() {
  return { type: types.API_CALL_ERROR };
}

export function addRcNumber(payload){
  return {type : types.REWARD_CARD_ADD_SUCCESS, payload : payload}
}

export function removeRcNumber(payload){
  return {type: types.REWARD_CARD_REMOVE_SUCCESS, payload : payload}
}