import api from './api';

export const moderationService = {
  async approveTopic(topicId) {
    await api.post(`/moderation/topics/${topicId}/approve`);
  },

  async rejectTopic(topicId) {
    await api.post(`/moderation/topics/${topicId}/reject`);
  },

  async approveReply(replyId) {
    await api.post(`/moderation/replies/${replyId}/approve`);
  },

  async rejectReply(replyId) {
    await api.post(`/moderation/replies/${replyId}/reject`);
  },

  async getPendingTopics(page = 1, pageSize = 20) {
    const response = await api.get(`/moderation/pending-topics?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getPendingReplies(page = 1, pageSize = 20) {
    const response = await api.get(`/moderation/pending-replies?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async banUser(userId) {
    await api.post(`/moderation/users/${userId}/ban`);
  },

  async unbanUser(userId) {
    await api.post(`/moderation/users/${userId}/unban`);
  }
};
