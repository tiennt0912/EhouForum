using System.Security.Claims;
using ForumApi.DTOs;
using ForumApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForumApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ModerationController : ControllerBase
    {
        private readonly IModerationService _moderationService;

        public ModerationController(IModerationService moderationService)
        {
            _moderationService = moderationService;
        }

        [HttpPost("topics/{topicId}/approve")]
        public async Task<ActionResult> ApproveTopic(int topicId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.ApproveTopicAsync(topicId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("topics/{topicId}/reject")]
        public async Task<ActionResult> RejectTopic(int topicId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.RejectTopicAsync(topicId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("replies/{replyId}/approve")]
        public async Task<ActionResult> ApproveReply(int replyId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.ApproveReplyAsync(replyId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("replies/{replyId}/reject")]
        public async Task<ActionResult> RejectReply(int replyId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.RejectReplyAsync(replyId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpGet("pending-topics")]
        public async Task<ActionResult<IEnumerable<TopicListDto>>> GetPendingTopics(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var topics = await _moderationService.GetPendingTopicsAsync(page, pageSize);
            return Ok(topics);
        }

        [HttpGet("pending-replies")]
        public async Task<ActionResult<IEnumerable<ReplyDto>>> GetPendingReplies(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var replies = await _moderationService.GetPendingRepliesAsync(page, pageSize);
            return Ok(replies);
        }

        [HttpPost("users/{userId}/ban")]
        public async Task<ActionResult> BanUser(string userId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.BanUserAsync(userId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("users/{userId}/unban")]
        public async Task<ActionResult> UnbanUser(string userId)
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var result = await _moderationService.UnbanUserAsync(userId, adminUserId);
            if (!result)
                return NotFound();

            return Ok();
        }
    }
}
