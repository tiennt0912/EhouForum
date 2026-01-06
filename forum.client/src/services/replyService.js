import api from './api';

export const replyService = {
  async getByTopic(topicId, page = 1, pageSize = 20) {
    const response = await api.get(`/replies/topic/${topicId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getPending(page = 1, pageSize = 20) {
    const response = await api.get(`/replies/pending?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/replies/${id}`);
    return response.data;
  },

  async create(replyData) {
    const response = await api.post('/replies', replyData);
    return response.data;
  },

  async update(id, replyData) {
    const response = await api.put(`/replies/${id}`, replyData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/replies/${id}`);
  }
};
