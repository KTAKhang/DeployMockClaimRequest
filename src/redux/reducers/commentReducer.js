import {
  CREATE_COMMENT_REQUEST,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  REPLY_COMMENT_REQUEST,
  REPLY_COMMENT_SUCCESS,
  REPLY_COMMENT_FAILURE,
} from "../actions/commentAction";

const initialState = {
  comments: [],
  loadingComment: false,
  errorComment: null,
};

const commentReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_COMMENT_REQUEST:
      return {
        ...state,
        errorComment: null,
        loadingComment: true,
      };
    case GET_COMMENTS_REQUEST:
      return {
        ...state,
        errorComment: null,
        loadingComment: false,
      };
    case REPLY_COMMENT_REQUEST:
      return {
        ...state,
        errorComment: null,
        loadingComment: true,
      };
    case CREATE_COMMENT_SUCCESS:
      return {
        ...state,
        comments: [...state.comments, action.payload],
        errorComment: null,
        loadingComment: false,
      };
    case GET_COMMENTS_SUCCESS:
      return { ...state, comments: action.payload, loadingComment: false };
    case REPLY_COMMENT_SUCCESS:
      return {
        ...state,
        comments: state.comments.map((comment) => {
          if (comment._id === action.payload.comment_id) {
            return {
              ...comment,
              replies: [...comment.replies, action.payload],
            };
          }
          return comment;
        }),
        errorComment: null,
        loadingComment: false,
      };
    case CREATE_COMMENT_FAILURE:
    case GET_COMMENTS_FAILURE:
    case REPLY_COMMENT_FAILURE:
      return {
        ...state,
        errorComment: action.payload,
        loadingComment: false,
      };
    default:
      return state;
  }
};

export default commentReducer;
