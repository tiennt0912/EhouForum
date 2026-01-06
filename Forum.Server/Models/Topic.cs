namespace ForumApi.Models
{
    public class Topic
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsLocked { get; set; } = false;
        public bool IsPinned { get; set; } = false;
        public int ViewCount { get; set; } = 0;

        // Foreign Keys
        public string UserId { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string? ApprovedByUserId { get; set; }
        public DateTime? ApprovedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual Category Category { get; set; } = null!;
        public virtual ApplicationUser? ApprovedByUser { get; set; }
        public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
    }
}
