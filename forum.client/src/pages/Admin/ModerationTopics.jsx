import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moderationService } from '../../services/moderationService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/UI/Pagination';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from '../../utils/dateUtils';

const ModerationTopics = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPendingTopics();
    }
  }, [user, currentPage]);

  const fetchPendingTopics = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getPendingTopics(currentPage, pageSize);
      setTopics(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTopic = async (topicId) => {
    try {
      await moderationService.approveTopic(topicId);
      toast.success('Duyệt bài viết thành công');
      fetchPendingTopics();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt bài viết');
    }
  };

  const handleRejectTopic = async (topicId) => {
    if (window.confirm('Bạn có chắc muốn từ chối bài viết này? Bài viết sẽ bị xóa vĩnh viễn.')) {
      try {
        await moderationService.rejectTopic(topicId);
        toast.success('Từ chối bài viết thành công');
        fetchPendingTopics();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi từ chối bài viết');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm duyệt bài viết</h1>
            <p className="text-gray-600">Duyệt các bài viết chờ kiểm tra</p>
          </div>
          <Link to="/admin" className="btn-outline">
            ← Quay lại bảng điều khiển
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tất cả bài viết đã được duyệt</h3>
          <p className="text-gray-500">Không có bài viết nào chờ kiểm duyệt</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {topics.map(topic => (
              <div key={topic.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {topic.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                      <span>Danh mục: {topic.categoryName}</span>
                      <span>•</span>
                      <span>Tác giả: {topic.userDisplayName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(topic.createdAt)} trước</span>
                      <span>•</span>
                      <span>{topic.viewCount} lượt xem</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleApproveTopic(topic.id)}
                        className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition-colors"
                      >
                        ✓ Duyệt bài viết
                      </button>
                      
                      <button
                        onClick={() => handleRejectTopic(topic.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ✗ Từ chối
                      </button>
                      
                      <Link
                        to={`/topics/${topic.id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        👁 Xem chi tiết
                      </Link>
                    </div>
                  </div>

                  <div className="ml-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⏳</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">Chờ duyệt</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
    </div>
  );
};

export default ModerationTopics;
