import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "../api/apiUtils"; // ✅ Updated import to use the new API object
import {
  GET_PROJECTS_ALL,
  GET_PROJECT_BY_ID,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  TOGGLE_PROJECT_STATUS,
  getProjectsAllSuccess,
  getProjectsAllFailure,
  getProjectByIdSuccess,
  getProjectByIdFailure,
  createProjectSuccess,
  createProjectFailure,
  updateProjectSuccess,
  updateProjectFailure,
  toggleProjectStatusSuccess,
  toggleProjectStatusFailure,
  getProjectsAll,
} from "../actions/projectActions";

// API Functions - Updated to use the api object
const fetchProjectsAPI = async () => {
  return await api.get("project/get-all");
};

const fetchProjectByIdAPI = async (id) => {
  if (!id) throw new Error("Project ID is required");
  console.log("API call - Fetching project:", id); // Debug log
  return await api.get(`project/${id}`);
};

const createProjectAPI = async (projectData) => {
  const data = { ...projectData };
  delete data._id;
  return await api.post("project", data);
};

const updateProjectAPI = async (id, projectData) => {
  return await api.put(`project/${id}`, projectData);
};

const toggleProjectStatusAPI = async (id, status) => {
  return await api.put(`project/${id}`, { status });
};

// Saga Functions
function* fetchProjectsAllSaga() {
  try {
    const response = yield call(fetchProjectsAPI);
    yield put(getProjectsAllSuccess(response));
  } catch (error) {
    yield put(getProjectsAllFailure(error.message));
    toast.error(error.message);
  }
}

function* fetchProjectByIdSaga(action) {
  try {
    const id = action.payload;
    if (!id) {
      throw new Error("Project ID is required");
    }

    console.log("Saga - Fetching project:", id); // Debug log
    const response = yield call(fetchProjectByIdAPI, id);

    if (!response) {
      throw new Error("No project data received");
    }

    yield put(getProjectByIdSuccess(response));
  } catch (error) {
    console.error("Error fetching project:", error); // Debug log
    yield put(getProjectByIdFailure(error.message));
    toast.error(error.message);
  }
}

function* createProjectSaga(action) {
  try {
    const response = yield call(createProjectAPI, action.payload);
    yield put(createProjectSuccess(response));

    toast.success("Project created successfully!", {
      toastId: "createProjectSuccess",
    });

    yield put(getProjectsAll());
  } catch (error) {
    yield put(createProjectFailure(error.message));
    toast.error(error.message, {
      toastId: "createProjectError",
    });
  }
}

function* updateProjectSaga(action) {
  try {
    const { _id, ...projectData } = action.payload;
    const response = yield call(updateProjectAPI, _id, projectData);
    yield put(updateProjectSuccess(response));

    toast.success("Project updated successfully!", {
      toastId: "updateProjectSuccess",
    });

    yield put(getProjectsAll());
  } catch (error) {
    yield put(updateProjectFailure(error.message));
    toast.error(error.message, {
      toastId: "updateProjectError",
    });
  }
}

function* toggleProjectStatusSaga(action) {
  try {
    const { id, status } = action.payload;

    // Validate input
    if (!id) throw new Error("Project ID is required");
    if (typeof status !== "boolean")
      throw new Error("Status must be a boolean");

    const response = yield call(toggleProjectStatusAPI, id, status);
    yield put(toggleProjectStatusSuccess(response));

    toast.success(
      `Project status changed to ${status ? "active" : "inactive"}`,
      {
        toastId: "toggleStatusSuccess",
      }
    );

    yield put(getProjectsAll());
  } catch (error) {
    yield put(toggleProjectStatusFailure(error.message));
    toast.error(error.message, {
      toastId: "toggleStatusError",
    });
  }
}

export default function* projectSaga() {
  yield takeLatest(GET_PROJECTS_ALL, fetchProjectsAllSaga);
  yield takeLatest(GET_PROJECT_BY_ID, fetchProjectByIdSaga);
  yield takeLatest(CREATE_PROJECT, createProjectSaga);
  yield takeLatest(UPDATE_PROJECT, updateProjectSaga);
  yield takeLatest(TOGGLE_PROJECT_STATUS, toggleProjectStatusSaga);
}
