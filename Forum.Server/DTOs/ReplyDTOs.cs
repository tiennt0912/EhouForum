using System.ComponentModel.DataAnnotations;

namespace ForumApi.DTOs
{
    public class ReplyDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsApproved { get; set; }
        public int TopicId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserDisplayName { get; set; } = string.Empty;
        public string? ApprovedByUserDisplayName { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }

    public class CreateReplyDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int TopicId { get; set; }
    }

    public class UpdateReplyDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;
    }
}
