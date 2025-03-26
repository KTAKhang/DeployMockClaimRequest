import {
    LOGIN_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGOUT,
    LOGOUT_SUCCESS,
    RESTORE_USER,
    UPDATE_AUTH_USER
} from "../actions/authActions";

const initialState = {
    token: null,
    user: null,
    role: null,
    error: null,
    loading: false,
    avatar: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
                role: action.payload.user.role_name,
                error: null,
                loading: false,
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case LOGOUT:
            return {
                ...state,
                loading: true
            };
        case LOGOUT_SUCCESS:
            return {
                ...initialState
            };
        case RESTORE_USER: {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const storedToken = localStorage.getItem("token");
            return {
                ...state,
                token: storedToken,
                user: storedUser,
                role: storedUser?.role_name
            };
        }
        case UPDATE_AUTH_USER:
            localStorage.setItem("user", JSON.stringify(action.payload));
            return {
                ...state,
                user: action.payload,
                role: action.payload.role_name,
                avatar: action.payload.avatar
            };
        default:
            return state;   
    }
};

export default authReducer;
