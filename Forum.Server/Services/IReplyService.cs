using ForumApi.DTOs;

namespace ForumApi.Services
{
    public interface IReplyService
    {
        Task<IEnumerable<ReplyDto>> GetRepliesByTopicAsync(
            int topicId,
            int page = 1,
            int pageSize = 20
        );
        Task<IEnumerable<ReplyDto>> GetPendingRepliesAsync(int page = 1, int pageSize = 20);
        Task<ReplyDto?> GetReplyByIdAsync(int id);
        Task<ReplyDto> CreateReplyAsync(CreateReplyDto createReplyDto, string userId);
        Task<ReplyDto?> UpdateReplyAsync(int id, UpdateReplyDto updateReplyDto, string userId);
        Task<bool> DeleteReplyAsync(int id, string userId, bool isAdmin = false);
    }
}
