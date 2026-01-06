import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topicService';
import { categoryService } from '../services/categoryService';
import TopicList from '../components/Topic/TopicList';
import Pagination from '../components/UI/Pagination';
import { toast } from 'react-toastify';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await topicService.getAll(currentPage, pageSize);
      setTopics(data);
      // Giả sử API trả về tổng số items, tính totalPages
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.slice(0, 6)); // Hiển thị 6 category đầu
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với Diễn Đàn Thảo Luận
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Nơi chia sẻ kiến thức và kết nối cộng đồng
        </p>
        
        {!isAuthenticated ? (
          <div className="flex items-center justify-center space-x-4">
            <Link to="/register" className="btn-primary">
              Tham gia ngay
            </Link>
            <Link to="/login" className="btn-outline">
              Đăng nhập
            </Link>
          </div>
        ) : (
          <Link to="/topics/create" className="btn-primary">
            Tạo bài viết mới
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
            <Link 
              to="/topics" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          <TopicList 
            topics={topics} 
            loading={loading}
            emptyMessage="Chưa có bài viết nào. Hãy là người đầu tiên tạo bài viết!"
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

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Categories */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.description}</div>
                  </div>
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {category.topicCount || 0}
                  </span>
                </Link>
              ))}
            </div>
            <Link 
              to="/categories" 
              className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
            >
              Xem tất cả danh mục
            </Link>
          </div>

          {/* Statistics */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng bài viết:</span>
                <span className="font-medium">{topics.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Danh mục:</span>
                <span className="font-medium">{categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thành viên:</span>
                <span className="font-medium">Nhiều</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
