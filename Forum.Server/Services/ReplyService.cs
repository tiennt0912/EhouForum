using ForumApi.Data;
using ForumApi.DTOs;
using ForumApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Services
{
    public class ReplyService : IReplyService
    {
        private readonly ForumDbContext _context;

        public ReplyService(ForumDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReplyDto>> GetRepliesByTopicAsync(
            int topicId,
            int page = 1,
            int pageSize = 20
        )
        {
            return await _context
                .Replies.Where(r => r.TopicId == topicId && r.IsApproved)
                .OrderBy(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReplyDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsApproved = r.IsApproved,
                    TopicId = r.TopicId,
                    UserId = r.UserId,
                    UserDisplayName = r.User.DisplayName,
                    ApprovedByUserDisplayName =
                        r.ApprovedByUser != null ? r.ApprovedByUser.DisplayName : null,
                    ApprovedAt = r.ApprovedAt,
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ReplyDto>> GetPendingRepliesAsync(
            int page = 1,
            int pageSize = 20
        )
        {
            return await _context
                .Replies.Where(r => !r.IsApproved)
                .OrderBy(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReplyDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsApproved = r.IsApproved,
                    TopicId = r.TopicId,
                    UserId = r.UserId,
                    UserDisplayName = r.User.DisplayName,
                    ApprovedByUserDisplayName =
                        r.ApprovedByUser != null ? r.ApprovedByUser.DisplayName : null,
                    ApprovedAt = r.ApprovedAt,
                })
                .ToListAsync();
        }

        public async Task<ReplyDto?> GetReplyByIdAsync(int id)
        {
            return await _context
                .Replies.Where(r => r.Id == id)
                .Select(r => new ReplyDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsApproved = r.IsApproved,
                    TopicId = r.TopicId,
                    UserId = r.UserId,
                    UserDisplayName = r.User.DisplayName,
                    ApprovedByUserDisplayName =
                        r.ApprovedByUser != null ? r.ApprovedByUser.DisplayName : null,
                    ApprovedAt = r.ApprovedAt,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ReplyDto> CreateReplyAsync(CreateReplyDto createReplyDto, string userId)
        {
            // Check if topic exists and is not locked
            var topic = await _context.Topics.FindAsync(createReplyDto.TopicId);
            if (topic == null)
                throw new ArgumentException("Topic không tồn tại");

            if (topic.IsLocked)
                throw new InvalidOperationException("Topic đã bị khóa, không thể trả lời");

            var reply = new Reply
            {
                Content = createReplyDto.Content,
                TopicId = createReplyDto.TopicId,
                UserId = userId,
            };

            _context.Replies.Add(reply);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(reply).Reference(r => r.User).LoadAsync();

            return new ReplyDto
            {
                Id = reply.Id,
                Content = reply.Content,
                CreatedAt = reply.CreatedAt,
                UpdatedAt = reply.UpdatedAt,
                IsApproved = reply.IsApproved,
                TopicId = reply.TopicId,
                UserId = reply.UserId,
                UserDisplayName = reply.User.DisplayName,
            };
        }

        public async Task<ReplyDto?> UpdateReplyAsync(
            int id,
            UpdateReplyDto updateReplyDto,
            string userId
        )
        {
            var reply = await _context
                .Replies.Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reply == null || reply.UserId != userId)
                return null;

            reply.Content = updateReplyDto.Content;
            reply.UpdatedAt = DateTime.UtcNow;
            reply.IsApproved = false; // Require re-approval after edit

            await _context.SaveChangesAsync();

            return new ReplyDto
            {
                Id = reply.Id,
                Content = reply.Content,
                CreatedAt = reply.CreatedAt,
                UpdatedAt = reply.UpdatedAt,
                IsApproved = reply.IsApproved,
                TopicId = reply.TopicId,
                UserId = reply.UserId,
                UserDisplayName = reply.User.DisplayName,
            };
        }

        public async Task<bool> DeleteReplyAsync(int id, string userId, bool isAdmin = false)
        {
            var reply = await _context.Replies.FindAsync(id);
            if (reply == null)
                return false;

            if (!isAdmin && reply.UserId != userId)
                return false;

            _context.Replies.Remove(reply);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
