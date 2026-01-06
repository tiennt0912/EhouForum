import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { topicService } from '../../services/topicService';
import TopicList from '../../components/Topic/TopicList';
import Pagination from '../../components/UI/Pagination';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCategory();
  }, [id]);

  useEffect(() => {
    if (category) {
      fetchTopics();
    }
  }, [category, currentPage]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getById(parseInt(id));
      setCategory(data);
    } catch (error) {
      toast.error('Không thể tải thông tin danh mục');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const data = await topicService.getByCategory(parseInt(id), currentPage, pageSize);
      setTopics(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setTopicsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy danh mục</h1>
          <Link to="/categories" className="btn-primary">
            Quay lại danh mục
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <span>›</span>
        <Link to="/categories" className="hover:text-primary-600">Danh mục</Link>
        <span>›</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{category.description}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                {category.topicCount || 0} bài viết
              </span>
              <span>Tạo ngày {new Date(category.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <Link
            to="/topics/create"
            state={{ categoryId: category.id }}
            className="btn-primary"
          >
            Tạo bài viết
          </Link>
        </div>
      </div>

      {/* Topics */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết trong danh mục</h2>
        
        <TopicList 
          topics={topics} 
          loading={topicsLoading}
          emptyMessage={`Chưa có bài viết nào trong danh mục "${category.name}"`}
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
      </div>
    </div>
  );
};

export default CategoryDetail;
