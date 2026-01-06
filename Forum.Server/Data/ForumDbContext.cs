using ForumApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Data
{
    public class ForumDbContext : IdentityDbContext<ApplicationUser>
    {
        public ForumDbContext(DbContextOptions<ForumDbContext> options)
            : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Reply> Replies { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Topic relationships
            builder
                .Entity<Topic>()
                .HasOne(t => t.User)
                .WithMany(u => u.Topics)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .Entity<Topic>()
                .HasOne(t => t.Category)
                .WithMany(c => c.Topics)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .Entity<Topic>()
                .HasOne(t => t.ApprovedByUser)
                .WithMany()
                .HasForeignKey(t => t.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reply relationships
            builder
                .Entity<Reply>()
                .HasOne(r => r.Topic)
                .WithMany(t => t.Replies)
                .HasForeignKey(r => r.TopicId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .Entity<Reply>()
                .HasOne(r => r.User)
                .WithMany(u => u.Replies)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .Entity<Reply>()
                .HasOne(r => r.ApprovedByUser)
                .WithMany()
                .HasForeignKey(r => r.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed data
            builder
                .Entity<Category>()
                .HasData(
                    new Category
                    {
                        Id = 1,
                        Name = "Thảo luận chung",
                        Description = "Nơi thảo luận các chủ đề tổng quát",
                        Order = 1,
                    },
                    new Category
                    {
                        Id = 2,
                        Name = "Công nghệ",
                        Description = "Thảo luận về công nghệ thông tin",
                        Order = 2,
                    },
                    new Category
                    {
                        Id = 3,
                        Name = "Giải trí",
                        Description = "Các chủ đề giải trí, thể thao",
                        Order = 3,
                    }
                );
        }
    }
}
