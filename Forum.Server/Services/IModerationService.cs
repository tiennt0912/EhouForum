using ForumApi.DTOs;

namespace ForumApi.Services
{
    public interface IModerationService
    {
        Task<bool> ApproveTopicAsync(int topicId, string adminUserId);
        Task<bool> RejectTopicAsync(int topicId, string adminUserId);
        Task<bool> ApproveReplyAsync(int replyId, string adminUserId);
        Task<bool> RejectReplyAsync(int replyId, string adminUserId);
        Task<IEnumerable<TopicListDto>> GetPendingTopicsAsync(int page = 1, int pageSize = 20);
        Task<IEnumerable<ReplyDto>> GetPendingRepliesAsync(int page = 1, int pageSize = 20);
        Task<bool> BanUserAsync(string userId, string adminUserId);
        Task<bool> UnbanUserAsync(string userId, string adminUserId);
    }
}
