using ForumApi.Data;
using ForumApi.DTOs;
using ForumApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Services
{
    public class ModerationService : IModerationService
    {
        private readonly ForumDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ModerationService(ForumDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<bool> ApproveTopicAsync(int topicId, string adminUserId)
        {
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic == null)
                return false;

            topic.IsApproved = true;
            topic.ApprovedByUserId = adminUserId;
            topic.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectTopicAsync(int topicId, string adminUserId)
        {
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic == null)
                return false;

            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveReplyAsync(int replyId, string adminUserId)
        {
            var reply = await _context.Replies.FindAsync(replyId);
            if (reply == null)
                return false;

            reply.IsApproved = true;
            reply.ApprovedByUserId = adminUserId;
            reply.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectReplyAsync(int replyId, string adminUserId)
        {
            var reply = await _context.Replies.FindAsync(replyId);
            if (reply == null)
                return false;

            _context.Replies.Remove(reply);
            await _context.SaveChangesAsync();
            return true;
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
                .Include(r => r.Topic)
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
                })
                .ToListAsync();
        }

        public async Task<bool> BanUserAsync(string userId, string adminUserId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> UnbanUserAsync(string userId, string adminUserId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            user.IsActive = true;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }
    }
}
