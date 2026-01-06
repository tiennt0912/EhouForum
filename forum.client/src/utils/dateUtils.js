export const formatDistanceToNow = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày`;
  } else {
    return targetDate.toLocaleDateString('vi-VN');
  }
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN');
};
