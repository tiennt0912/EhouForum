import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topicService';
import TopicList from '../components/Topic/TopicList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import { toast } from 'react-toastify';

const MyTopics = () => {
  const { user, isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  });
  const pageSize = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchMyTopics();
  }, [isAuthenticated]);

  useEffect(() => {
    filterTopics();
  }, [topics, filter, currentPage]);

  const fetchMyTopics = async () => {
    try {
      setLoading(true);
      // Lấy tất cả bài viết và lọc theo userId
      const allTopics = await topicService.getAll(1, 1000);
      const myTopics = allTopics.filter(topic => topic.userDisplayName === user.displayName);
      
      // Sắp xếp theo ngày tạo mới nhất
      const sortedTopics = myTopics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setTopics(sortedTopics);
      
      // Tính toán thống kê
      setStats({
        total: sortedTopics.length,
        approved: sortedTopics.filter(t => t.isApproved).length,
        pending: sortedTopics.filter(t => !t.isApproved).length
      });
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết của bạn');
    } finally {
      setLoading(false);
    }
  };

  const filterTopics = () => {
    let filtered = [...topics];
    
    switch (filter) {
      case 'approved':
        filtered = topics.filter(topic => topic.isApproved);
        break;
      case 'pending':
        filtered = topics.filter(topic => !topic.isApproved);
        break;
      default:
        filtered = topics;
    }
    
    // Phân trang
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTopics = filtered.slice(startIndex, endIndex);
    
    setFilteredTopics(paginatedTopics);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await topicService.delete(topicId);
        toast.success('Xóa bài viết thành công');
        fetchMyTopics();
      } catch (error) {
        toast.error('Không thể xóa bài viết');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h1>
              <p className="text-gray-600">Bạn cần đăng nhập để xem bài viết của mình</p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Bài viết của tôi
                </h1>
                <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả bài viết bạn đã tạo</p>
              </div>
            </div>
            <Link 
              to="/topics/create" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo bài viết mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-gray-600 font-medium">Tổng bài viết</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
                <div className="text-gray-600 font-medium">Đã duyệt</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.pending}</div>
                <div className="text-gray-600 font-medium">Chờ duyệt</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lọc bài viết</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>Tất cả</span>
                  <span className="px-2 py-1 bg-white text-gray-700 bg-opacity-20 rounded-full text-xs">
                    {stats.total}
                  </span>
                </span>
              </button>
              
              <button
                onClick={() => {
                  setFilter('approved');
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  filter === 'approved'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Đã duyệt</span>
                  <span className="px-2 py-1 bg-white text-gray-700 bg-opacity-20 rounded-full text-xs">
                    {stats.approved}
                  </span>
                </span>
              </button>
              
              <button
                onClick={() => {
                  setFilter('pending');
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  filter === 'pending'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  <span>Chờ duyệt</span>
                  <span className="px-2 py-1 bg-white text-gray-700 bg-opacity-20 rounded-full text-xs">
                    {stats.pending}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Topics List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {filteredTopics.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {filter === 'all' 
                    ? 'Bạn chưa có bài viết nào' 
                    : filter === 'approved' 
                      ? 'Chưa có bài viết nào được duyệt'
                      : 'Chưa có bài viết nào chờ duyệt'
                  }
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {filter === 'all' 
                    ? 'Hãy tạo bài viết đầu tiên của bạn và chia sẻ những ý tưởng thú vị!' 
                    : 'Thử chuyển sang tab khác để xem bài viết với trạng thái khác.'
                  }
                </p>
                {filter === 'all' && (
                  <Link 
                    to="/topics/create" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo bài viết đầu tiên
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTopics.map(topic => (
                  <MyTopicCard 
                    key={topic.id} 
                    topic={topic} 
                    onDelete={handleDeleteTopic}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Component card cho bài viết của user
const MyTopicCard = ({ topic, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1">
          {/* Status Badges */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {topic.isPinned && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Đã ghim
              </span>
            )}
            {topic.isLocked && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Đã khóa
              </span>
            )}
            {!topic.isApproved ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                </svg>
                Chờ duyệt
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Đã duyệt
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
            <Link 
              to={`/topics/${topic.id}`}
              className="block"
            >
              {topic.title}
            </Link>
          </h3>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">{topic.categoryName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Tạo ngày {new Date(topic.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {topic.updatedAt && topic.updatedAt !== topic.createdAt && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Đã chỉnh sửa</span>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium text-blue-900">{topic.replyCount}</span>
              <span className="text-blue-700 text-sm">trả lời</span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium text-purple-900">{topic.viewCount}</span>
              <span className="text-purple-700 text-sm">lượt xem</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex lg:flex-col items-center gap-2">
          <Link
            to={`/topics/${topic.id}`}
            className="flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Xem bài viết"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          
          <Link
            to={`/topics/${topic.id}/edit`}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Chỉnh sửa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          
          <button
            onClick={() => onDelete(topic.id)}
            className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Xóa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTopics;
