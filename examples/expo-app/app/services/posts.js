import api from './api';

/**
 * Posts API Service
 *
 * JSONPlaceholder endpoints:
 * - GET /posts - Get all posts
 * - GET /posts/:id - Get single post
 * - GET /posts?userId=:id - Get posts by user
 */

export const postsApi = {
  /**
   * Get all posts
   * @returns {Promise<Array>} - Array of posts
   */
  getAll: async () => {
    return api.get('/posts');
  },

  /**
   * Get post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Object>} - Post object
   */
  getById: async (id) => {
    return api.get(`/posts/${id}`);
  },

  /**
   * Get posts by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of posts
   */
  getByUserId: async (userId) => {
    return api.get(`/posts?userId=${userId}`);
  },
};
