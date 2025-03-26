import { all, call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  CREATE_COMMENT_REQUEST,
  GET_COMMENTS_REQUEST,
  REPLY_COMMENT_REQUEST,
  createCommentSuccess,
  createCommentFailure,
  replyCommentSuccess,
  replyCommentFailure,
  getCommentsSuccess,
  getCommentsFailure,
} from "../actions/commentAction";

import api from "../api/apiUtils";

const apiGetComment = async (id) => {
  return await api.get(`comment/${id}`);
};

const apiCreateComment = async (commentData) => {
  return await api.post("comment/create", commentData);
};

const apiReplyComment = async (commentData) => {
  return await api.post("comment/reply", commentData);
};

function* handleGetComments(action) {
  try {
    const id = action.payload;
    const data = yield call(apiGetComment, id);
    yield put(getCommentsSuccess(data));
  } catch (error) {
    yield put(getCommentsFailure(error.message));
  }
}

function* handleCreateComment(action) {
  try {
    const data = yield call(apiCreateComment, action.payload);

    toast.success("Comment created successfully!");
    console.log("Comment created successfully!", data);
    yield put(
      createCommentSuccess({
        claim_id: data.claim_id,
        content: data.content,
        user_id: {
          avatar: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).avatar
            : null,
          user_name: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).user_name
            : null,
          role_id: {
            name: localStorage.getItem("user")
              ? JSON.parse(localStorage.getItem("user")).role_name
              : null,
          },
        },
        replies: [],
      })
    );
  } catch (error) {
    yield put(createCommentFailure(error.message));
  }
}

function* handleReplyComment(action) {
  try {
    const data = yield call(apiReplyComment, action.payload);

    yield put(
      replyCommentSuccess({
        comment_id: data.comment_id,
        content: action.payload.content,
        user: {
          avatar: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).avatar
            : null,
          user_name: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).user_name
            : null,
          role: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).role_name
            : null,
        },
      })
    );
    toast.success("Reply created successfully!");
  } catch (error) {
    yield put(replyCommentFailure(error.message));
    toast.error(error.message);
  }
}

export function* commentSaga() {
  yield takeLatest(GET_COMMENTS_REQUEST, handleGetComments);
  yield takeLatest(CREATE_COMMENT_REQUEST, handleCreateComment);
  yield takeLatest(REPLY_COMMENT_REQUEST, handleReplyComment);
}
