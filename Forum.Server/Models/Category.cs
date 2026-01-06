namespace ForumApi.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public int Order { get; set; } = 0;

        // Navigation properties
        public virtual ICollection<Topic> Topics { get; set; } = new List<Topic>();
    }
}
