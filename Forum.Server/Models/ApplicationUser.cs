using Microsoft.AspNetCore.Identity;

namespace ForumApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public string? Avatar { get; set; }

        // Navigation properties
        public virtual ICollection<Topic> Topics { get; set; } = new List<Topic>();
        public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
    }
}
