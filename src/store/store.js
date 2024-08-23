import { createStore, combineReducers } from "redux";

const initialState = {
  user: null,
  token: null,
  error: null,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        error: action.payload.error,
      };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  auth: authReducer,
});

export const store = createStore(rootReducer);
