import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { topicService } from '../../services/topicService';
import { categoryService } from '../../services/categoryService';
import TopicList from '../../components/Topic/TopicList';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/UI/Pagination';
import { toast } from 'react-toastify';

const TopicsList = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filteredTopics, setFilteredTopics] = useState([]);
  
  const pageSize = 15;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory]);

  useEffect(() => {
    handleFilterAndSort();
  }, [topics, sortBy, searchQuery, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      let data;
      
      if (selectedCategory === 'all') {
        data = await topicService.getAll(1, 1000); // Lấy nhiều để có thể filter/sort
      } else {
        data = await topicService.getByCategory(parseInt(selectedCategory), 1, 1000);
      }
      
      // Chỉ hiển thị bài viết đã được duyệt
      const approvedTopics = data.filter(topic => topic.isApproved);
      setTopics(approvedTopics);
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterAndSort = () => {
    let filtered = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.userDisplayName.toLowerCase().includes(query) ||
        topic.categoryName.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most-replies':
        filtered.sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
        break;
      case 'most-views':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'last-reply':
        filtered.sort((a, b) => {
          const aDate = a.lastReplyAt ? new Date(a.lastReplyAt) : new Date(a.createdAt);
          const bDate = b.lastReplyAt ? new Date(b.lastReplyAt) : new Date(b.createdAt);
          return bDate - aDate;
        });
        break;
      default:
        break;
    }

    // Pinned topics first
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTopics = filtered.slice(startIndex, endIndex);
    
    setFilteredTopics(paginatedTopics);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURL({ category: categoryId === 'all' ? null : categoryId });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURL({ sort: sort === 'latest' ? null : sort });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL({ search: query.trim() || null });
  };

  const updateURL = (params) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('latest');
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const getCategoryName = (categoryId) => {
    if (categoryId === 'all') return 'Tất cả danh mục';
    const category = categories.find(c => c.id.toString() === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const getSortName = (sort) => {
    const sortOptions = {
      'latest': 'Mới nhất',
      'oldest': 'Cũ nhất',
      'most-replies': 'Nhiều trả lời nhất',
      'most-views': 'Nhiều lượt xem nhất',
      'last-reply': 'Trả lời gần đây'
    };
    return sortOptions[sort] || 'Mới nhất';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả bài viết</h1>
            <p className="text-gray-600">Khám phá và thảo luận các chủ đề thú vị</p>
          </div>
          {isAuthenticated && (
            <Link to="/topics/create" className="btn-primary">
              Tạo bài viết mới
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, tác giả hoặc danh mục..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.topicCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="most-replies">Nhiều trả lời nhất</option>
              <option value="most-views">Nhiều lượt xem nhất</option>
              <option value="last-reply">Trả lời gần đây</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== 'all' || sortBy !== 'latest' || searchQuery) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || sortBy !== 'latest' || searchQuery) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Danh mục: {getCategoryName(selectedCategory)}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {sortBy !== 'latest' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Sắp xếp: {getSortName(sortBy)}
                  <button
                    onClick={() => handleSortChange('latest')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Tìm kiếm: "{searchQuery}"
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Topics List */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedCategory !== 'all' || sortBy !== 'latest'
                  ? 'Không tìm thấy bài viết nào'
                  : 'Chưa có bài viết nào'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedCategory !== 'all' || sortBy !== 'latest'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Hãy là người đầu tiên tạo bài viết!'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && sortBy === 'latest' && isAuthenticated && (
                <Link to="/topics/create" className="btn-primary">
                  Tạo bài viết mới
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6 text-sm text-gray-600">
                Hiển thị {filteredTopics.length} bài viết
                {searchQuery && ` cho "${searchQuery}"`}
                {selectedCategory !== 'all' && ` trong ${getCategoryName(selectedCategory)}`}
              </div>

              <TopicList 
                topics={filteredTopics} 
                loading={false}
              />

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TopicsList;
