using ForumApi.DTOs;

namespace ForumApi.Services
{
    public interface ITopicService
    {
        Task<IEnumerable<TopicListDto>> GetTopicsByCategoryAsync(
            int categoryId,
            int page = 1,
            int pageSize = 20
        );
        Task<IEnumerable<TopicListDto>> GetAllTopicsAsync(int page = 1, int pageSize = 20);
        Task<IEnumerable<TopicListDto>> GetPendingTopicsAsync(int page = 1, int pageSize = 20);
        Task<TopicDto?> GetTopicByIdAsync(int id, string? userId = null);
        Task<TopicDto> CreateTopicAsync(CreateTopicDto createTopicDto, string userId);
        Task<TopicDto?> UpdateTopicAsync(int id, UpdateTopicDto updateTopicDto, string userId);
        Task<bool> DeleteTopicAsync(int id, string userId, bool isAdmin = false);
        Task<bool> LockTopicAsync(int id);
        Task<bool> UnlockTopicAsync(int id);
        Task<bool> PinTopicAsync(int id);
        Task<bool> UnpinTopicAsync(int id);
    }
}
