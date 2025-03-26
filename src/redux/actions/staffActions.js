// Action Types
export const GET_STAFF_ALL = "GET_STAFF_ALL";
export const GET_STAFF_BY_ID = "GET_STAFF_BY_ID";
export const ADD_STAFF = "ADD_STAFF";
export const UPDATE_STAFF = "UPDATE_STAFF";

// Success Action Types
export const GET_STAFF_ALL_SUCCESS = "GET_STAFF_ALL_SUCCESS";
export const GET_STAFF_BY_ID_SUCCESS = "GET_STAFF_BY_ID_SUCCESS";
export const ADD_STAFF_SUCCESS = "ADD_STAFF_SUCCESS";
export const UPDATE_STAFF_SUCCESS = "UPDATE_STAFF_SUCCESS";

// Failure Action Types
export const GET_STAFF_ALL_FAILURE = "GET_STAFF_ALL_FAILURE";
export const GET_STAFF_BY_ID_FAILURE = "GET_STAFF_BY_ID_FAILURE";
export const ADD_STAFF_FAILURE = "ADD_STAFF_FAILURE";
export const UPDATE_STAFF_FAILURE = "UPDATE_STAFF_FAILURE";

// Action Creators
export const getStaffAll = (page = 1, limit = 10) => ({
  type: GET_STAFF_ALL,
  payload: { page, limit },
});

export const getStaffById = (id) => ({
  type: GET_STAFF_BY_ID,
  payload: id,
});

export const addStaff = (newStaff) => ({
  type: ADD_STAFF,
  payload: newStaff,
});

export const updateStaff = (staffData) => ({
  type: UPDATE_STAFF,
  payload: staffData,
});

// Success Actions
export const getStaffAllSuccess = (data) => ({
  type: GET_STAFF_ALL_SUCCESS,
  payload: data,
});

export const getStaffByIdSuccess = (data) => ({
  type: GET_STAFF_BY_ID_SUCCESS,
  payload: data,
});

export const addStaffSuccess = (data) => ({
  type: ADD_STAFF_SUCCESS,
  payload: data,
});

export const updateStaffSuccess = (data) => ({
  type: UPDATE_STAFF_SUCCESS,
  payload: data,
});

// Failure Actions
export const getStaffAllFailure = (error) => ({
  type: GET_STAFF_ALL_FAILURE,
  payload: error,
});

export const getStaffByIdFailure = (error) => ({
  type: GET_STAFF_BY_ID_FAILURE,
  payload: error,
});

export const addStaffFailure = (error) => ({
  type: ADD_STAFF_FAILURE,
  payload: error,
});

export const updateStaffFailure = (error) => ({
  type: UPDATE_STAFF_FAILURE,
  payload: error,
});
