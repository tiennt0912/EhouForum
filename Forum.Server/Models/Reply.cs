namespace ForumApi.Models
{
    public class Reply
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsApproved { get; set; } = false;

        // Foreign Keys
        public int TopicId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? ApprovedByUserId { get; set; }
        public DateTime? ApprovedAt { get; set; }

        // Navigation properties
        public virtual Topic Topic { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ApplicationUser? ApprovedByUser { get; set; }
    }
}
