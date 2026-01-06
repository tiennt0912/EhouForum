using System.Security.Claims;
using ForumApi.DTOs;
using ForumApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForumApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicsController : ControllerBase
    {
        private readonly ITopicService _topicService;
        private readonly IAuthService _authService;

        public TopicsController(ITopicService topicService, IAuthService authService)
        {
            _topicService = topicService;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TopicListDto>>> GetTopics(
            [FromQuery] int? categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            IEnumerable<TopicListDto> topics;

            if (categoryId.HasValue)
                topics = await _topicService.GetTopicsByCategoryAsync(
                    categoryId.Value,
                    page,
                    pageSize
                );
            else
                topics = await _topicService.GetAllTopicsAsync(page, pageSize);

            return Ok(topics);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TopicListDto>>> GetPendingTopics(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var topics = await _topicService.GetPendingTopicsAsync(page, pageSize);
            return Ok(topics);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TopicDto>> GetTopic(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var topic = await _topicService.GetTopicByIdAsync(id, userId);

            if (topic == null)
                return NotFound();

            // Only show approved topics to non-owners and non-admins
            if (!topic.IsApproved && topic.UserId != userId && !User.IsInRole("Admin"))
                return NotFound();

            return Ok(topic);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TopicDto>> CreateTopic(CreateTopicDto createTopicDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var topic = await _topicService.CreateTopicAsync(createTopicDto, userId);
                return CreatedAtAction(nameof(GetTopic), new { id = topic.Id }, topic);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<TopicDto>> UpdateTopic(int id, UpdateTopicDto updateTopicDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var topic = await _topicService.UpdateTopicAsync(id, updateTopicDto, userId);
            if (topic == null)
                return NotFound();

            return Ok(topic);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteTopic(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var isAdmin = User.IsInRole("Admin");
            var result = await _topicService.DeleteTopicAsync(id, userId, isAdmin);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/lock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> LockTopic(int id)
        {
            var result = await _topicService.LockTopicAsync(id);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("{id}/unlock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UnlockTopic(int id)
        {
            var result = await _topicService.UnlockTopicAsync(id);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("{id}/pin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> PinTopic(int id)
        {
            var result = await _topicService.PinTopicAsync(id);
            if (!result)
                return NotFound();

            return Ok();
        }

        [HttpPost("{id}/unpin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UnpinTopic(int id)
        {
            var result = await _topicService.UnpinTopicAsync(id);
            if (!result)
                return NotFound();

            return Ok();
        }
    }
}
