import * as types from "../actions/actionTypes";
import initialState from "./initialState";
export default function rewardReducer(state = initialState, action) {
  switch (action.type) {
    case types.REWARD_CARD_ADD_SUCCESS:
      return { ...state, rcNumber : [...state.rcNumber, action.payload]}
    case types.REWARD_CARD_REMOVE_SUCCESS :
        return { ...state, rcNumber : state.rcNumber.filter(rcNumber => rcNumber !== action.payload)}
    default:
      return state;
  }
}