using System.ComponentModel.DataAnnotations;

namespace ForumApi.DTOs
{
    public class TopicDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsLocked { get; set; }
        public bool IsPinned { get; set; }
        public int ViewCount { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserDisplayName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ReplyCount { get; set; }
        public DateTime? LastReplyAt { get; set; }
        public string? ApprovedByUserDisplayName { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }

    public class CreateTopicDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }
    }

    public class UpdateTopicDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;
    }

    public class TopicListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsLocked { get; set; }
        public bool IsPinned { get; set; }
        public int ViewCount { get; set; }
        public string UserDisplayName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int ReplyCount { get; set; }
        public DateTime? LastReplyAt { get; set; }
    }
}
