import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moderationService } from '../../services/moderationService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/UI/Pagination';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from '../../utils/dateUtils';

const ModerationReplies = () => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPendingReplies();
    }
  }, [user, currentPage]);

  const fetchPendingReplies = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getPendingReplies(currentPage, pageSize);
      setReplies(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    } catch (error) {
      toast.error('Không thể tải danh sách trả lời chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReply = async (replyId) => {
    try {
      await moderationService.approveReply(replyId);
      toast.success('Duyệt trả lời thành công');
      fetchPendingReplies();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt trả lời');
    }
  };

  const handleRejectReply = async (replyId) => {
    if (window.confirm('Bạn có chắc muốn từ chối trả lời này? Trả lời sẽ bị xóa vĩnh viễn.')) {
      try {
        await moderationService.rejectReply(replyId);
        toast.success('Từ chối trả lời thành công');
        fetchPendingReplies();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm duyệt trả lời</h1>
            <p className="text-gray-600">Duyệt các trả lời chờ kiểm tra</p>
          </div>
          <Link to="/admin" className="btn-outline">
            ← Quay lại bảng điều khiển
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : replies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tất cả trả lời đã được duyệt</h3>
          <p className="text-gray-500">Không có trả lời nào chờ kiểm duyệt</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {replies.map(reply => (
              <div key={reply.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {reply.userDisplayName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{reply.userDisplayName}</div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(reply.createdAt)} trước
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleApproveReply(reply.id)}
                        className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition-colors"
                      >
                        ✓ Duyệt trả lời
                      </button>
                      
                      <button
                        onClick={() => handleRejectReply(reply.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ✗ Từ chối
                      </button>
                      
                      <Link
                        to={`/topics/${reply.topicId}`}
                        className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        👁 Xem bài viết gốc
                      </Link>
                    </div>
                  </div>

                  <div className="ml-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💬</span>
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

export default ModerationReplies;
