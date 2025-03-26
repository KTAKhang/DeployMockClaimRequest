import apiClient from "./apiClient";

/**
 * API service with method-specific function objects
 */
const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Object>} - API response data
   */
  get: async (endpoint, params = {}) => {
    return apiCall("get", endpoint, null, params);
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Object>} - API response data
   */
  post: async (endpoint, data, params = {}) => {
    return apiCall("post", endpoint, data, params);
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Object>} - API response data
   */
  put: async (endpoint, data, params = {}) => {
    return apiCall("put", endpoint, data, params);
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} [data=null] - Request body data (if needed)
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Object>} - API response data
   */
  delete: async (endpoint, data = null, params = {}) => {
    return apiCall("delete", endpoint, data, params);
  },

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Object>} - API response data
   */
  patch: async (endpoint, data, params = {}) => {
    return apiCall("patch", endpoint, data, params);
  },
};

/**
 * Generic API call function using a custom Axios instance.
 *
 * @param {string} method - HTTP method ('get', 'post', 'put', 'delete', 'patch')
 * @param {string} endpoint - API endpoint (e.g., 'claim', 'claim/{id}')
 * @param {Object} [data=null] - Request body data (for POST, PUT, PATCH)
 * @param {Object} [params={}] - Query parameters (for GET)
 * @returns {Promise<Object>} - API response data
 */
const apiCall = async (method, endpoint, data = null, params = {}) => {
  try {
    const response = await apiClient({ method, url: endpoint, data, params });
    
    console.log(`API ${method.toUpperCase()} ${endpoint} response:`, response);

    if (response.status === 200) {
      // Kiểm tra endpoint để xử lý response format tương ứng
      if (endpoint.includes('project')) {
        // Với API project
        return response.data.data;
      } else if (endpoint.includes('user/get-all')) {
        // Với API user/staff
        return response.data;
      }  else {
        // Với các API khác, kiểm tra cấu trúc response
        return response.data.data || response.data;
      } 
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || handleHTTPError(status);
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    } else {
      throw new Error("Unexpected error occurred. Please try again.");
    }
  }
};

/**
 * Maps HTTP status codes to user-friendly error messages.
 * @param {number} status - HTTP status code
 * @returns {string} - Error message
 */
const handleHTTPError = (status) => {
  switch (status) {
    case 400:
      return "Bad request. Please check your input.";
    case 401:
      return "Unauthorized. Please log in again.";
    case 403:
      return "Forbidden. You don't have permission to perform this action.";
    case 404:
      return "Resource not found. Please check the endpoint.";
    case 500:
      return "Internal server error. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};

export default api;
