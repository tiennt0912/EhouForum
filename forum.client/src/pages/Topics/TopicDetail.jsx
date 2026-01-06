import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { topicService } from '../../services/topicService';
import { replyService } from '../../services/replyService';
import ReplyCard from '../../components/Reply/ReplyCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from '../../utils/dateUtils';

const TopicDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Reply form
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Edit reply modal
  const [editingReply, setEditingReply] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  useEffect(() => {
    if (topic) {
      fetchReplies();
    }
  }, [topic, currentPage]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const data = await topicService.getById(parseInt(id));
      setTopic(data);
    } catch (error) {
      toast.error('Không thể tải bài viết');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      setRepliesLoading(true);
      const data = await replyService.getByTopic(parseInt(id), currentPage, pageSize);
      setReplies(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để trả lời');
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung trả lời');
      return;
    }

    if (topic.isLocked) {
      toast.error('Bài viết đã bị khóa, không thể trả lời');
      return;
    }

    setIsSubmittingReply(true);

    try {
      await replyService.create({
        content: replyContent.trim(),
        topicId: parseInt(id)
      });
      
      toast.success('Gửi trả lời thành công! Trả lời sẽ hiển thị sau khi được duyệt.');
      setReplyContent('');
      fetchReplies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi trả lời');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditReply = (reply) => {
    setEditingReply(reply);
    setEditContent(reply.content);
    setIsEditModalOpen(true);
  };

  const handleUpdateReply = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      await replyService.update(editingReply.id, {
        content: editContent.trim()
      });
      
      toast.success('Cập nhật trả lời thành công!');
      setIsEditModalOpen(false);
      fetchReplies();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trả lời');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (window.confirm('Bạn có chắc muốn xóa trả lời này?')) {
      try {
        await replyService.delete(replyId);
        toast.success('Xóa trả lời thành công');
        fetchReplies();
      } catch (error) {
        toast.error('Không thể xóa trả lời');
      }
    }
  };

  const handleDeleteTopic = async () => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await topicService.delete(topic.id);
        toast.success('Xóa bài viết thành công');
        navigate('/');
      } catch (error) {
        toast.error('Không thể xóa bài viết');
      }
    }
  };

  const handleLockTopic = async () => {
    try {
      if (topic.isLocked) {
        await topicService.unlock(topic.id);
        toast.success('Mở khóa bài viết thành công');
      } else {
        await topicService.lock(topic.id);
        toast.success('Khóa bài viết thành công');
      }
      fetchTopic();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handlePinTopic = async () => {
    try {
      if (topic.isPinned) {
        await topicService.unpin(topic.id);
        toast.success('Bỏ ghim bài viết thành công');
      } else {
        await topicService.pin(topic.id);
        toast.success('Ghim bài viết thành công');
      }
      fetchTopic();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
          <Link to="/" className="btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === topic.userId || user.isAdmin);
  const canDelete = user && (user.id === topic.userId || user.isAdmin);
  const canModerate = user?.isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <span>›</span>
        <Link to="/categories" className="hover:text-primary-600">Danh mục</Link>
        <span>›</span>
        <Link to={`/categories/${topic.categoryId}`} className="hover:text-primary-600">
          {topic.categoryName}
        </Link>
        <span>›</span>
        <span className="text-gray-900 truncate">{topic.title}</span>
      </nav>

      {/* Topic */}
      <div className="card p-8 mb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              {topic.isPinned && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  📌 Ghim
                </span>
              )}
              {topic.isLocked && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  🔒 Đã khóa
                </span>
              )}
              {!topic.isApproved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  ⏳ Chờ duyệt
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{topic.title}</h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {topic.userDisplayName?.charAt(0).toUpperCase()}
                </div>
                <span>Tác giả: {topic.userDisplayName}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(topic.createdAt)} trước</span>
              {topic.updatedAt && topic.updatedAt !== topic.createdAt && (
                <>
                  <span>•</span>
                  <span>Đã chỉnh sửa</span>
                </>
              )}
              <span>•</span>
              <span>{topic.viewCount} lượt xem</span>
            </div>
          </div>

          {/* Action Menu */}
          {(canEdit || canDelete || canModerate) && (
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Link
                  to={`/topics/${topic.id}/edit`}
                  className="text-blue-600 hover:text-blue-700 p-2"
                  title="Chỉnh sửa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              )}
              
              {canModerate && (
                <>
                  <button
                    onClick={handleLockTopic}
                    className={`p-2 ${topic.isLocked ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                    title={topic.isLocked ? 'Mở khóa' : 'Khóa bài viết'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {topic.isLocked ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      )}
                    </svg>
                  </button>
                  
                  <button
                    onClick={handlePinTopic}
                    className={`p-2 ${topic.isPinned ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}`}
                    title={topic.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                  >
                    📌
                  </button>
                </>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDeleteTopic}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Xóa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Approval Notice */}
        {!topic.isApproved && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-orange-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Bài viết đang chờ kiểm duyệt và chỉ hiển thị cho tác giả và quản trị viên</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none">
          <div className="text-gray-800 whitespace-pre-wrap">{topic.content}</div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Trả lời ({topic.replyCount || 0})
          </h2>
        </div>

        {/* Replies List */}
        {repliesLoading ? (
          <LoadingSpinner />
        ) : replies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trả lời nào</h3>
            <p className="text-gray-500">Hãy là người đầu tiên trả lời bài viết này!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {replies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
              />
            ))}
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isAuthenticated && !topic.isLocked ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết trả lời</h3>
          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <textarea
                rows={6}
                className="input-field resize-none"
                placeholder="Viết trả lời của bạn..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={isSubmittingReply}
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Trả lời của bạn sẽ cần được quản trị viên duyệt trước khi hiển thị công khai.
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmittingReply || !replyContent.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmittingReply ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Đang gửi...</span>
                </>
              ) : (
                'Gửi trả lời'
              )}
            </button>
          </form>
        </div>
      ) : !isAuthenticated ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để trả lời bài viết này</p>
          <Link to="/login" className="btn-primary">
            Đăng nhập
          </Link>
        </div>
      ) : (
        <div className="card p-6 text-center bg-red-50">
          <p className="text-red-600">Bài viết đã bị khóa, không thể trả lời</p>
        </div>
      )}

      {/* Edit Reply Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa trả lời"
      >
        <form onSubmit={handleUpdateReply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              rows={6}
              className="input-field resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Nhập nội dung trả lời"
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi chỉnh sửa, trả lời sẽ cần được duyệt lại.
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-outline"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Cập nhật
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TopicDetail;
