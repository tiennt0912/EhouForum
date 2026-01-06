import api from './api';

export const topicService = {
  async getAll(page = 1, pageSize = 20) {
    const response = await api.get(`/topics?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getByCategory(categoryId, page = 1, pageSize = 20) {
    const response = await api.get(`/topics?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getPending(page = 1, pageSize = 20) {
    const response = await api.get(`/topics/pending?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  async create(topicData) {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  async update(id, topicData) {
    const response = await api.put(`/topics/${id}`, topicData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/topics/${id}`);
  },

  async lock(id) {
    await api.post(`/topics/${id}/lock`);
  },

  async unlock(id) {
    await api.post(`/topics/${id}/unlock`);
  },

  async pin(id) {
    await api.post(`/topics/${id}/pin`);
  },

  async unpin(id) {
    await api.post(`/topics/${id}/unpin`);
  }
};
