export const CREATE_COMMENT_REQUEST = "CREATE_COMMENT_REQUEST";
export const CREATE_COMMENT_SUCCESS = "CREATE_COMMENT_SUCCESS";
export const CREATE_COMMENT_FAILURE = "CREATE_COMMENT_FAILURE";

export const GET_COMMENTS_REQUEST = "GET_COMMENTS_REQUEST";
export const GET_COMMENTS_SUCCESS = "GET_COMMENTS_SUCCESS";
export const GET_COMMENTS_FAILURE = "GET_COMMENTS_FAILURE";

export const REPLY_COMMENT_REQUEST = "REPLY_COMMENT_REQUEST";
export const REPLY_COMMENT_SUCCESS = "REPLY_COMMENT_SUCCESS";
export const REPLY_COMMENT_FAILURE = "REPLY_COMMENT_FAILURE";

export const createCommentRequest = (commentData) => ({
  type: CREATE_COMMENT_REQUEST,
  payload: commentData,
});

export const createCommentSuccess = (comment) => ({
  type: CREATE_COMMENT_SUCCESS,
  payload: comment,
});

export const createCommentFailure = (error) => ({
  type: CREATE_COMMENT_FAILURE,
  payload: error,
});

export const getCommentsRequest = (id) => {
  return {
    type: GET_COMMENTS_REQUEST,
    payload: id,
  };
};

export const getCommentsSuccess = (comments) => ({
  type: GET_COMMENTS_SUCCESS,
  payload: comments,
});

export const getCommentsFailure = (error) => ({
  type: GET_COMMENTS_FAILURE,
  payload: error,
});

export const replyCommentRequest = (commentData) => ({
  type: REPLY_COMMENT_REQUEST,
  payload: commentData,
});

export const replyCommentSuccess = (comment) => ({
  type: REPLY_COMMENT_SUCCESS,
  payload: comment,
});

export const replyCommentFailure = (error) => ({
  type: REPLY_COMMENT_FAILURE,
  payload: error,
});
