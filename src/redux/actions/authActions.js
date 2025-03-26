export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT = "LOGOUT";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const RESTORE_USER = "RESTORE_USER";
export const UPDATE_AUTH_USER = "UPDATE_AUTH_USER";

export const loginRequest = (credentials) => ({
    type: LOGIN_REQUEST,
    payload: credentials,
});

export const loginSuccess = (token, user) => ({
    type: LOGIN_SUCCESS,
    payload: { token, user },
});

export const loginFailure = (error) => ({
    type: LOGIN_FAILURE,
    payload: error,
});

export const logout = () => ({
    type: LOGOUT
});

export const logoutSuccess = () => ({
    type: LOGOUT_SUCCESS
});

export const restoreUser = () => ({
    type: RESTORE_USER
});

export const updateAuthUser = (userData) => ({
    type: UPDATE_AUTH_USER,
    payload: userData
});
