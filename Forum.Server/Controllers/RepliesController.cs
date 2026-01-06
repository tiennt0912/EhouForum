using System.Security.Claims;
using ForumApi.DTOs;
using ForumApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForumApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepliesController : ControllerBase
    {
        private readonly IReplyService _replyService;

        public RepliesController(IReplyService replyService)
        {
            _replyService = replyService;
        }

        [HttpGet("topic/{topicId}")]
        public async Task<ActionResult<IEnumerable<ReplyDto>>> GetRepliesByTopic(
            int topicId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var replies = await _replyService.GetRepliesByTopicAsync(topicId, page, pageSize);
            return Ok(replies);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ReplyDto>>> GetPendingReplies(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var replies = await _replyService.GetPendingRepliesAsync(page, pageSize);
            return Ok(replies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReplyDto>> GetReply(int id)
        {
            var reply = await _replyService.GetReplyByIdAsync(id);
            if (reply == null)
                return NotFound();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Only show approved replies to non-owners and non-admins
            if (!reply.IsApproved && reply.UserId != userId && !User.IsInRole("Admin"))
                return NotFound();

            return Ok(reply);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReplyDto>> CreateReply(CreateReplyDto createReplyDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var reply = await _replyService.CreateReplyAsync(createReplyDto, userId);
                return CreatedAtAction(nameof(GetReply), new { id = reply.Id }, reply);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReplyDto>> UpdateReply(int id, UpdateReplyDto updateReplyDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var reply = await _replyService.UpdateReplyAsync(id, updateReplyDto, userId);
            if (reply == null)
                return NotFound();

            return Ok(reply);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteReply(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var isAdmin = User.IsInRole("Admin");
            var result = await _replyService.DeleteReplyAsync(id, userId, isAdmin);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
