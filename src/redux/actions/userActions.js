export const GET_USER_PROFILE = 'GET_USER_PROFILE';
export const GET_USER_PROFILE_SUCCESS = 'GET_USER_PROFILE_SUCCESS';
export const GET_USER_PROFILE_FAILURE = 'GET_USER_PROFILE_FAILURE';
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';
export const UPDATE_USER_PROFILE_SUCCESS = 'UPDATE_USER_PROFILE_SUCCESS';
export const UPDATE_USER_PROFILE_FAILURE = 'UPDATE_USER_PROFILE_FAILURE';
export const LOGOUT = 'LOGOUT';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// Action creators

export const getUserProfile = () => ({
    type: GET_USER_PROFILE
});

export const getUserProfileSuccess = (data) => ({
    type: GET_USER_PROFILE_SUCCESS,
    payload: data
});

export const getUserProfileFailure = (error) => ({
    type : GET_USER_PROFILE_FAILURE,
    payload : error
});

export const updateUserProfile = (userData) => ({
    type : UPDATE_USER_PROFILE,
    payload : userData
});

export const updateUserProfileSuccess = (data) => ({
    type: UPDATE_USER_PROFILE_SUCCESS,
    payload : data
});

export const updateUserProfileFailure = (error) => ({
    type : UPDATE_USER_PROFILE_FAILURE,
    payload : error
});

export const logout = () => ({
    type: LOGOUT
});

export const logoutSuccess = () => ({
    type: LOGOUT_SUCCESS
});
 
