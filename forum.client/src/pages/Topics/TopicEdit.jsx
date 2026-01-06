import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { topicService } from '../../services/topicService';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const TopicEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicData, categoriesData] = await Promise.all([
        topicService.getById(parseInt(id)),
        categoryService.getAll()
      ]);
      
      // Check permissions
      if (!user || (user.id !== topicData.userId && !user.isAdmin)) {
        toast.error('Bạn không có quyền chỉnh sửa bài viết này');
        navigate('/');
        return;
      }
      
      setTopic(topicData);
      setCategories(categoriesData);
      setFormData({
        title: topicData.title,
        content: topicData.content
      });
    } catch (error) {
      toast.error('Không thể tải bài viết');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    setIsSubmitting(true);

    try {
      await topicService.update(parseInt(id), {
        title: formData.title.trim(),
        content: formData.content.trim()
      });
      
      toast.success('Cập nhật bài viết thành công! Bài viết sẽ cần được duyệt lại.');
      navigate(`/topics/${id}`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
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
          <button onClick={() => navigate(-1)} className="btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa bài viết</h1>
        <p className="text-gray-600">Cập nhật nội dung bài viết của bạn</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
              {topic.categoryName}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Không thể thay đổi danh mục khi chỉnh sửa
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              className="input-field"
              placeholder="Nhập tiêu đề bài viết"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 ký tự
            </p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              className="input-field resize-none"
              placeholder="Viết nội dung bài viết của bạn..."
              value={formData.content}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Sau khi chỉnh sửa, bài viết sẽ cần được quản trị viên duyệt lại trước khi hiển thị công khai.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/topics/${id}`)}
              className="btn-outline"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Đang cập nhật...</span>
                </>
              ) : (
                'Cập nhật bài viết'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicEdit;
