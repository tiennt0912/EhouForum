using ForumApi.Data;
using ForumApi.DTOs;
using ForumApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Services
{
    public class TopicService : ITopicService
    {
        private readonly ForumDbContext _context;

        public TopicService(ForumDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TopicListDto>> GetTopicsByCategoryAsync(
            int categoryId,
            int page = 1,
            int pageSize = 20
        )
        {
            return await _context
                .Topics.Where(t => t.CategoryId == categoryId && t.IsApproved)
                .OrderByDescending(t => t.IsPinned)
                .ThenByDescending(t =>
                    t.Replies.Where(r => r.IsApproved).Max(r => (DateTime?)r.CreatedAt)
                    ?? t.CreatedAt
                )
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TopicListDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    CreatedAt = t.CreatedAt,
                    IsApproved = t.IsApproved,
                    IsLocked = t.IsLocked,
                    IsPinned = t.IsPinned,
                    ViewCount = t.ViewCount,
                    UserDisplayName = t.User.DisplayName,
                    CategoryName = t.Category.Name,
                    ReplyCount = t.Replies.Count(r => r.IsApproved),
                    LastReplyAt = t
                        .Replies.Where(r => r.IsApproved)
                        .Max(r => (DateTime?)r.CreatedAt),
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<TopicListDto>> GetAllTopicsAsync(
            int page = 1,
            int pageSize = 20
        )
        {
            return await _context
                .Topics.Where(t => t.IsApproved)
                .OrderByDescending(t => t.IsPinned)
                .ThenByDescending(t =>
                    t.Replies.Where(r => r.IsApproved).Max(r => (DateTime?)r.CreatedAt)
                    ?? t.CreatedAt
                )
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TopicListDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    CreatedAt = t.CreatedAt,
                    IsApproved = t.IsApproved,
                    IsLocked = t.IsLocked,
                    IsPinned = t.IsPinned,
                    ViewCount = t.ViewCount,
                    UserDisplayName = t.User.DisplayName,
                    CategoryName = t.Category.Name,
                    ReplyCount = t.Replies.Count(r => r.IsApproved),
                    LastReplyAt = t
                        .Replies.Where(r => r.IsApproved)
                        .Max(r => (DateTime?)r.CreatedAt),
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<TopicListDto>> GetPendingTopicsAsync(
            int page = 1,
            int pageSize = 20
        )
        {
            return await _context
                .Topics.Where(t => !t.IsApproved)
                .OrderBy(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TopicListDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    CreatedAt = t.CreatedAt,
                    IsApproved = t.IsApproved,
                    IsLocked = t.IsLocked,
                    IsPinned = t.IsPinned,
                    ViewCount = t.ViewCount,
                    UserDisplayName = t.User.DisplayName,
                    CategoryName = t.Category.Name,
                    ReplyCount = t.Replies.Count(r => r.IsApproved),
                    LastReplyAt = t
                        .Replies.Where(r => r.IsApproved)
                        .Max(r => (DateTime?)r.CreatedAt),
                })
                .ToListAsync();
        }

        public async Task<TopicDto?> GetTopicByIdAsync(int id, string? userId = null)
        {
            var topic = await _context
                .Topics.Include(t => t.User)
                .Include(t => t.Category)
                .Include(t => t.ApprovedByUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (topic == null)
                return null;

            // Increment view count if not the owner viewing
            if (userId != topic.UserId)
            {
                topic.ViewCount++;
                await _context.SaveChangesAsync();
            }

            return new TopicDto
            {
                Id = topic.Id,
                Title = topic.Title,
                Content = topic.Content,
                CreatedAt = topic.CreatedAt,
                UpdatedAt = topic.UpdatedAt,
                IsApproved = topic.IsApproved,
                IsLocked = topic.IsLocked,
                IsPinned = topic.IsPinned,
                ViewCount = topic.ViewCount,
                UserId = topic.UserId,
                UserDisplayName = topic.User.DisplayName,
                CategoryId = topic.CategoryId,
                CategoryName = topic.Category.Name,
                ReplyCount = topic.Replies.Count(r => r.IsApproved),
                LastReplyAt = topic
                    .Replies.Where(r => r.IsApproved)
                    .Max(r => (DateTime?)r.CreatedAt),
                ApprovedByUserDisplayName = topic.ApprovedByUser?.DisplayName,
                ApprovedAt = topic.ApprovedAt,
            };
        }

        public async Task<TopicDto> CreateTopicAsync(CreateTopicDto createTopicDto, string userId)
        {
            var topic = new Topic
            {
                Title = createTopicDto.Title,
                Content = createTopicDto.Content,
                CategoryId = createTopicDto.CategoryId,
                UserId = userId,
            };

            _context.Topics.Add(topic);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(topic).Reference(t => t.User).LoadAsync();
            await _context.Entry(topic).Reference(t => t.Category).LoadAsync();

            return new TopicDto
            {
                Id = topic.Id,
                Title = topic.Title,
                Content = topic.Content,
                CreatedAt = topic.CreatedAt,
                UpdatedAt = topic.UpdatedAt,
                IsApproved = topic.IsApproved,
                IsLocked = topic.IsLocked,
                IsPinned = topic.IsPinned,
                ViewCount = topic.ViewCount,
                UserId = topic.UserId,
                UserDisplayName = topic.User.DisplayName,
                CategoryId = topic.CategoryId,
                CategoryName = topic.Category.Name,
                ReplyCount = 0,
            };
        }

        public async Task<TopicDto?> UpdateTopicAsync(
            int id,
            UpdateTopicDto updateTopicDto,
            string userId
        )
        {
            var topic = await _context
                .Topics.Include(t => t.User)
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (topic == null || topic.UserId != userId)
                return null;

            topic.Title = updateTopicDto.Title;
            topic.Content = updateTopicDto.Content;
            topic.UpdatedAt = DateTime.UtcNow;
            topic.IsApproved = false; // Require re-approval after edit

            await _context.SaveChangesAsync();

            return new TopicDto
            {
                Id = topic.Id,
                Title = topic.Title,
                Content = topic.Content,
                CreatedAt = topic.CreatedAt,
                UpdatedAt = topic.UpdatedAt,
                IsApproved = topic.IsApproved,
                IsLocked = topic.IsLocked,
                IsPinned = topic.IsPinned,
                ViewCount = topic.ViewCount,
                UserId = topic.UserId,
                UserDisplayName = topic.User.DisplayName,
                CategoryId = topic.CategoryId,
                CategoryName = topic.Category.Name,
                ReplyCount = topic.Replies.Count(r => r.IsApproved),
            };
        }

        public async Task<bool> DeleteTopicAsync(int id, string userId, bool isAdmin = false)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;

            if (!isAdmin && topic.UserId != userId)
                return false;

            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LockTopicAsync(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;

            topic.IsLocked = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockTopicAsync(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;

            topic.IsLocked = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PinTopicAsync(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;

            topic.IsPinned = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpinTopicAsync(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;

            topic.IsPinned = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
