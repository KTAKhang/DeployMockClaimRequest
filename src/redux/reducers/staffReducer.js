import {
  GET_STAFF_ALL,
  GET_STAFF_BY_ID,
  ADD_STAFF,
  UPDATE_STAFF,
  GET_STAFF_ALL_SUCCESS,
  GET_STAFF_BY_ID_SUCCESS,
  ADD_STAFF_SUCCESS,
  UPDATE_STAFF_SUCCESS,
  GET_STAFF_ALL_FAILURE,
  GET_STAFF_BY_ID_FAILURE,
  ADD_STAFF_FAILURE,
  UPDATE_STAFF_FAILURE,
} from "../actions/staffActions";

const initialState = {
  staffAll: { data: [], total: 0 }, // Lưu danh sách staff có phân trang
  staffById: null, // Lưu thông tin staff theo ID
  loading: false,
  error: null,
};

export default function staffReducer(state = initialState, action) {
  switch (action.type) {
    case GET_STAFF_ALL:
    case GET_STAFF_BY_ID:
    case ADD_STAFF:
    case UPDATE_STAFF:
      return { ...state, loading: true, error: null };

    case GET_STAFF_ALL_SUCCESS:
      return {
        ...state,
        loading: false,
        staffAll: {
          data: Array.isArray(action.payload.data?.user)
            ? action.payload.data.user
            : action.payload.data || [], // ✅ Handle possible response formats
          total:
            action.payload.data?.total?.totalUser || action.payload.total || 0,
        },
      };

    case GET_STAFF_BY_ID_SUCCESS:
      return { ...state, loading: false, staffById: action.payload };

    case ADD_STAFF_SUCCESS:
      return {
        ...state,
        loading: false,
        staffAll: {
          ...state.staffAll,
          data: Array.isArray(state.staffAll.data)
            ? [action.payload, ...state.staffAll.data] // ✅ Add new staff to list
            : [action.payload], // ✅ Ensure it's always an array
          total: state.staffAll.total + 1,
        },
      };

    case UPDATE_STAFF_SUCCESS:
      // Đảm bảo payload có cả role và role_name để tương thích
      const updatedPayload = { ...action.payload };

      // Đồng bộ hóa các trường
      if (updatedPayload.role && !updatedPayload.role_name) {
        updatedPayload.role_name = updatedPayload.role;
      }

      if (updatedPayload.role_name && !updatedPayload.role) {
        updatedPayload.role = updatedPayload.role_name;
      }

      return {
        ...state,
        loading: false,
        staffAll: {
          ...state.staffAll,
          data: state.staffAll.data.map((staff) =>
            staff._id === updatedPayload._id ? updatedPayload : staff
          ),
        },
        staffById:
          state.staffById?._id === updatedPayload._id
            ? updatedPayload
            : state.staffById,
      };

    case GET_STAFF_ALL_FAILURE:
    case GET_STAFF_BY_ID_FAILURE:
    case ADD_STAFF_FAILURE:
    case UPDATE_STAFF_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
