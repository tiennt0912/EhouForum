using ForumApi.Data;
using ForumApi.DTOs;
using ForumApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ForumDbContext _context;

        public CategoryService(ForumDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            return await _context
                .Categories.Where(c => c.IsActive)
                .OrderBy(c => c.Order)
                .ThenBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.IsActive,
                    Order = c.Order,
                    TopicCount = c.Topics.Count(t => t.IsApproved),
                })
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            return await _context
                .Categories.Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.IsActive,
                    Order = c.Order,
                    TopicCount = c.Topics.Count(t => t.IsApproved),
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                Order = createCategoryDto.Order,
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt,
                IsActive = category.IsActive,
                Order = category.Order,
                TopicCount = 0,
            };
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(
            int id,
            UpdateCategoryDto updateCategoryDto
        )
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return null;

            category.Name = updateCategoryDto.Name;
            category.Description = updateCategoryDto.Description;
            category.Order = updateCategoryDto.Order;
            category.IsActive = updateCategoryDto.IsActive;

            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt,
                IsActive = category.IsActive,
                Order = category.Order,
                TopicCount = await _context.Topics.CountAsync(t =>
                    t.CategoryId == id && t.IsApproved
                ),
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context
                .Categories.Include(c => c.Topics)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return false;

            if (category.Topics.Any())
            {
                // Soft delete - deactivate instead of removing
                category.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
