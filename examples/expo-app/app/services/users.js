import api from './api';

/**
 * Users API Service
 *
 * JSONPlaceholder endpoints:
 * - GET /users - Get all users
 * - GET /users/:id - Get single user
 */

export const usersApi = {
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of users
   */
  getAll: async () => {
    return api.get('/users');
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User object
   */
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },
};
