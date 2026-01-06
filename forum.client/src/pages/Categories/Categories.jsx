import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { toast } from 'react-toastify';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', order: 0 });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      order: category.order
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, {
          ...formData,
          isActive: editingCategory.isActive
        });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(formData);
        toast.success('Tạo danh mục thành công');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await categoryService.delete(id);
        toast.success('Xóa danh mục thành công');
        fetchCategories();
      } catch (error) {
        toast.error('Không thể xóa danh mục');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục</h1>
          <p className="text-gray-600 mt-2">Khám phá các chủ đề thảo luận</p>
        </div>
        {user?.isAdmin && (
          <button
            onClick={handleCreateCategory}
            className="btn-primary"
          >
            Tạo danh mục mới
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục nào</h3>
          <p className="text-gray-500">Hãy tạo danh mục đầu tiên để bắt đầu thảo luận</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                </div>
                {user?.isAdmin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Chỉnh sửa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                  {category.topicCount || 0} bài viết
                </span>
                <Link
                  to={`/categories/${category.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Xem bài viết →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập tên danh mục"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              required
              rows={3}
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả danh mục"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự
            </label>
            <input
              type="number"
              className="input-field"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-outline"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {editingCategory ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
