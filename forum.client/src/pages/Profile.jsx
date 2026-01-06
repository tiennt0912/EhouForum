import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topicService';
import TopicList from '../components/Topic/TopicList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatDateTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [userTopics, setUserTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTopics: 0,
    approvedTopics: 0,
    pendingTopics: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Lấy tất cả bài viết của user (bao gồm chờ duyệt)
      const topics = await topicService.getAll(1, 100);
      // Một số API trả về `userId`, một số khác chỉ trả `userDisplayName`.
      // Nếu có `userId` và `user.id` thì so sánh theo id, ngược lại so sánh theo displayName.
      const userTopicsData = topics.filter(topic => (
        (topic.userId && user.id && topic.userId === user.id) ||
        (topic.userDisplayName && user.displayName && topic.userDisplayName === user.displayName)
      ));
      
      setUserTopics(userTopicsData);
      setStats({
        totalTopics: userTopicsData.length,
        approvedTopics: userTopicsData.filter(t => t.isApproved).length,
        pendingTopics: userTopicsData.filter(t => !t.isApproved).length
      });
    } catch (error) {
      toast.error('Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin và bài viết của bạn</p>
      </div>

      {/* User Info Card */}
      <div className="card p-8 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {user.displayName?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.displayName}</h2>
            <div className="text-gray-600 space-y-1">
              <p>Email: {user.email}</p>
              <p>Ngày tham gia: {formatDateTime(user.joinDate)}</p>
              {user.isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Quản trị viên
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTopics}</div>
          <div className="text-gray-600">Tổng bài viết</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.approvedTopics}</div>
          <div className="text-gray-600">Đã duyệt</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingTopics}</div>
          <div className="text-gray-600">Chờ duyệt</div>
        </div>
      </div>

      {/* User Topics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết của tôi</h2>
        
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <TopicList 
            topics={userTopics} 
            loading={false}
            emptyMessage="Bạn chưa có bài viết nào. Hãy tạo bài viết đầu tiên của mình!"
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
