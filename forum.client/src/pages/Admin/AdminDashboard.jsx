import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moderationService } from '../../services/moderationService';
import { categoryService } from '../../services/categoryService';
import { topicService } from '../../services/topicService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingTopics: 0,
    pendingReplies: 0,
    totalCategories: 0,
    totalTopics: 0
  });
  const [pendingTopics, setPendingTopics] = useState([]);
  const [pendingReplies, setPendingReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        pendingTopicsData,
        pendingRepliesData,
        categoriesData,
        topicsData
      ] = await Promise.all([
        moderationService.getPendingTopics(1, 5),
        moderationService.getPendingReplies(1, 5),
        categoryService.getAll(),
        topicService.getAll(1, 1)
      ]);

      setStats({
        pendingTopics: pendingTopicsData.length,
        pendingReplies: pendingRepliesData.length,
        totalCategories: categoriesData.length,
        totalTopics: topicsData.length
      });

      setPendingTopics(pendingTopicsData);
      setPendingReplies(pendingRepliesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTopic = async (topicId) => {
    try {
      await moderationService.approveTopic(topicId);
      toast.success('Duyệt bài viết thành công');
      fetchDashboardData();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt bài viết');
    }
  };

  const handleRejectTopic = async (topicId) => {
    if (window.confirm('Bạn có chắc muốn từ chối bài viết này?')) {
      try {
        await moderationService.rejectTopic(topicId);
        toast.success('Từ chối bài viết thành công');
        fetchDashboardData();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi từ chối bài viết');
      }
    }
  };

  const handleApproveReply = async (replyId) => {
    try {
      await moderationService.approveReply(replyId);
      toast.success('Duyệt trả lời thành công');
      fetchDashboardData();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt trả lời');
    }
  };

  const handleRejectReply = async (replyId) => {
    if (window.confirm('Bạn có chắc muốn từ chối trả lời này?')) {
      try {
        await moderationService.rejectReply(replyId);
        toast.success('Từ chối trả lời thành công');
        fetchDashboardData();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi từ chối trả lời');
      }
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <Link to="/" className="btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển quản trị</h1>
        <p className="text-gray-600">Quản lý và kiểm duyệt nội dung diễn đàn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bài viết chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTopics}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trả lời chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReplies}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTopics}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Topics */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bài viết chờ duyệt</h2>
            <Link to="/admin/topics" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          <div className="space-y-4">
            {pendingTopics.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Không có bài viết nào chờ duyệt</p>
            ) : (
              pendingTopics.map(topic => (
                <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {topic.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3">
                    Tác giả: {topic.userDisplayName} • {topic.categoryName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveTopic(topic.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectTopic(topic.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
                    >
                      Từ chối
                    </button>
                    <Link
                      to={`/topics/${topic.id}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Replies */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trả lời chờ duyệt</h2>
            <Link to="/admin/replies" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          <div className="space-y-4">
            {pendingReplies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Không có trả lời nào chờ duyệt</p>
            ) : (
              pendingReplies.map(reply => (
                <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 mb-2 line-clamp-3">
                    {reply.content}
                  </p>
                  <div className="text-sm text-gray-500 mb-3">
                    Tác giả: {reply.userDisplayName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveReply(reply.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectReply(reply.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
                    >
                      Từ chối
                    </button>
                    <Link
                      to={`/topics/${reply.topicId}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Xem bài viết
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/categories"
            className="card p-6 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Quản lý danh mục</h3>
            <p className="text-sm text-gray-500 mt-1">Tạo và chỉnh sửa danh mục</p>
          </Link>

          <Link
            to="/admin/topics"
            className="card p-6 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Kiểm duyệt bài viết</h3>
            <p className="text-sm text-gray-500 mt-1">Duyệt bài viết chờ kiểm tra</p>
          </Link>

          <Link
            to="/admin/replies"
            className="card p-6 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Kiểm duyệt trả lời</h3>
            <p className="text-sm text-gray-500 mt-1">Duyệt trả lời chờ kiểm tra</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
