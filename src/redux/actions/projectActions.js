// **Action Types**
export const GET_PROJECTS_ALL = "GET_PROJECTS_ALL";
export const GET_PROJECT_BY_ID = "GET_PROJECT_BY_ID";
export const CREATE_PROJECT = "CREATE_PROJECT";
export const UPDATE_PROJECT = "UPDATE_PROJECT";
export const TOGGLE_PROJECT_STATUS = "TOGGLE_PROJECT_STATUS";

// **Success Action Types**
export const GET_PROJECTS_ALL_SUCCESS = "GET_PROJECTS_ALL_SUCCESS";
export const GET_PROJECT_BY_ID_SUCCESS = "GET_PROJECT_BY_ID_SUCCESS";
export const CREATE_PROJECT_SUCCESS = "CREATE_PROJECT_SUCCESS";
export const UPDATE_PROJECT_SUCCESS = "UPDATE_PROJECT_SUCCESS";
export const TOGGLE_PROJECT_STATUS_SUCCESS = "TOGGLE_PROJECT_STATUS_SUCCESS";

// **Failure Action Types**
export const GET_PROJECTS_ALL_FAILURE = "GET_PROJECTS_ALL_FAILURE";
export const GET_PROJECT_BY_ID_FAILURE = "GET_PROJECT_BY_ID_FAILURE";
export const CREATE_PROJECT_FAILURE = "CREATE_PROJECT_FAILURE";
export const UPDATE_PROJECT_FAILURE = "UPDATE_PROJECT_FAILURE";
export const TOGGLE_PROJECT_STATUS_FAILURE = "TOGGLE_PROJECT_STATUS_FAILURE";

// **Action Creators**
export const getProjectsAll = (page = 1, limit = 20) => ({
  type: GET_PROJECTS_ALL,
  payload: { page, limit },
});

export const getProjectById = (id) => ({
  type: GET_PROJECT_BY_ID,
  payload: id,
});

export const createProject = (projectData) => ({
  type: CREATE_PROJECT,
  payload: projectData
});

export const updateProject = (projectData) => ({
  type: UPDATE_PROJECT,
  payload: projectData,
});

export const toggleProjectStatus = (projectId, newStatus) => ({
  type: TOGGLE_PROJECT_STATUS,
  payload: { id: projectId, status: newStatus }
});

// **Success Actions**
export const getProjectsAllSuccess = (data) => ({
  type: GET_PROJECTS_ALL_SUCCESS,
  payload: data,
});

export const getProjectByIdSuccess = (data) => ({
  type: GET_PROJECT_BY_ID_SUCCESS,
  payload: data,
});

export const createProjectSuccess = (data) => ({
  type: CREATE_PROJECT_SUCCESS,
  payload: data
});

export const updateProjectSuccess = (data) => ({
  type: UPDATE_PROJECT_SUCCESS,
  payload: data,
});

export const toggleProjectStatusSuccess = (project) => ({
  type: TOGGLE_PROJECT_STATUS_SUCCESS,
  payload: project,
});

// **Failure Actions**
export const getProjectsAllFailure = (error) => ({
  type: GET_PROJECTS_ALL_FAILURE,
  payload: error,
});

export const getProjectByIdFailure = (error) => ({
  type: GET_PROJECT_BY_ID_FAILURE,
  payload: error,
});

export const createProjectFailure = (error) => ({
  type: CREATE_PROJECT_FAILURE,
  payload: error
});

export const updateProjectFailure = (error) => ({
  type: UPDATE_PROJECT_FAILURE,
  payload: error,
});

export const toggleProjectStatusFailure = (error) => ({
  type: TOGGLE_PROJECT_STATUS_FAILURE,
  payload: error,
});
