import { GET_USER_PROFILE, GET_USER_PROFILE_SUCCESS, GET_USER_PROFILE_FAILURE, UPDATE_USER_PROFILE, UPDATE_USER_PROFILE_SUCCESS, UPDATE_USER_PROFILE_FAILURE } from '../actions/userActions';

const initialState = {
    profile: {
        _id: null,
        user_name: '',
        department: '',
        job_rank: '',
        salary: 0,
        role_name: '',
        avatar: '',
        status: false,
        createdAt: null,
        updatedAt: null,
    },
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    updateSuccess: false
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_USER_PROFILE:
            return {
                ...state, 
                loading: true,
                error: null
            };
        case GET_USER_PROFILE_SUCCESS:
            return {
                ...state,
                loading: false,
                profile: action.payload,
                error: null
            };
        case GET_USER_PROFILE_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }; 
        case UPDATE_USER_PROFILE:
            return {
                ...state,
                updateLoading: true,
                updateError: null,
                updateSuccess: false
            };
        case UPDATE_USER_PROFILE_SUCCESS:
            return {
                ...state,
                profile: action.payload,
                updateLoading: false,
                updateError: null,
                updateSuccess: true
            };
        case UPDATE_USER_PROFILE_FAILURE:
            return {
                ...state,
                updateLoading: false,
                updateError: action.payload,
                updateSuccess: false
            };
        default:
            return state;
    }
};

export default userReducer;

