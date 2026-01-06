import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from '../../utils/dateUtils';

const TopicCard = ({ topic }) => {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
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
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link 
              to={`/topics/${topic.id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {topic.title}
            </Link>
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>Danh mục: {topic.categoryName}</span>
            <span>•</span>
            <span>Tác giả: {topic.userDisplayName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(topic.createdAt)} trước</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end text-sm text-gray-500 ml-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{topic.replyCount}</div>
              <div>trả lời</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{topic.viewCount}</div>
              <div>lượt xem</div>
            </div>
          </div>
          {topic.lastReplyAt && (
            <div className="mt-2 text-xs">
              Trả lời cuối: {formatDistanceToNow(topic.lastReplyAt)} trước
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
