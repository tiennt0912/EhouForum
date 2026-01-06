import React from 'react';
import TopicCard from './TopicCard';
import LoadingSpinner from '../UI/LoadingSpinner';

const TopicList = ({ topics, loading, emptyMessage = "Chưa có bài viết nào" }) => {
  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map(topic => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
};

export default TopicList;
