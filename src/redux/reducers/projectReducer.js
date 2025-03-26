import {
  GET_PROJECTS_ALL,
  GET_PROJECT_BY_ID,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  TOGGLE_PROJECT_STATUS,
  GET_PROJECTS_ALL_SUCCESS,
  GET_PROJECT_BY_ID_SUCCESS,
  CREATE_PROJECT_SUCCESS,
  UPDATE_PROJECT_SUCCESS,
  TOGGLE_PROJECT_STATUS_SUCCESS,
  GET_PROJECTS_ALL_FAILURE,
  GET_PROJECT_BY_ID_FAILURE,
  CREATE_PROJECT_FAILURE,
  UPDATE_PROJECT_FAILURE,
  TOGGLE_PROJECT_STATUS_FAILURE,
} from "../actions/projectActions";

const initialState = {
  projectsAll: {
    data: [],
    totalProject: 0
  },
  projectById: null,
  loading: false,
  error: null,
  statusChangeSuccess: false
};

const updateProjectInList = (projects, updatedProject) => {
  return projects.map(project => 
    project._id === updatedProject._id ? updatedProject : project
  );
};

export default function projectReducer(state = initialState, action) {
  switch (action.type) {
    // Loading states
    case GET_PROJECTS_ALL:
    case GET_PROJECT_BY_ID:
    case CREATE_PROJECT:
    case UPDATE_PROJECT:
    case TOGGLE_PROJECT_STATUS:
      return {
        ...state,
        loading: true,
        error: null,
        statusChangeSuccess: false
      };

    // Success states
    case GET_PROJECTS_ALL_SUCCESS:
      return {
        ...state,
        loading: false,
        projectsAll: {
          data: action.payload.projects || [],
          totalProject: action.payload.totalProject || 0
        }
      };

    case GET_PROJECT_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        projectById: action.payload
      };

    case CREATE_PROJECT_SUCCESS:
      return {
        ...state,
        loading: false,
        projectsAll: {
          data: [action.payload, ...state.projectsAll.data],
          totalProject: state.projectsAll.totalProject + 1
        }
      };

    case UPDATE_PROJECT_SUCCESS:
      return {
        ...state,
        loading: false,
        projectById: action.payload,
        projectsAll: {
          ...state.projectsAll,
          data: updateProjectInList(state.projectsAll.data, action.payload)
        }
      };

    case TOGGLE_PROJECT_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        statusChangeSuccess: true,
        projectById: action.payload,
        projectsAll: {
          ...state.projectsAll,
          data: updateProjectInList(state.projectsAll.data, action.payload)
        }
      };

    // Failure states
    case GET_PROJECTS_ALL_FAILURE:
    case GET_PROJECT_BY_ID_FAILURE:
    case CREATE_PROJECT_FAILURE:
    case UPDATE_PROJECT_FAILURE:
    case TOGGLE_PROJECT_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        statusChangeSuccess: false
      };

    default:
      return state;
  }
}
