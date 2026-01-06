import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../utils/dateUtils';

const ReplyCard = ({ reply, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const canEdit = user && (user.id === reply.userId || user.isAdmin);
    const canDelete = user && (user.id === reply.userId || user.isAdmin);

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full text-white flex items-center justify-center text-sm font-medium">
                        {reply.userDisplayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{reply.userDisplayName}</div>
                        <div className="text-sm text-gray-500">
                            {formatDistanceToNow(reply.createdAt)} trước
                            {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                <span> • Đã chỉnh sửa</span>
                            )}
                        </div>
                    </div>
                </div>

                {(canEdit || canDelete) && (
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                {canEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(reply);
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => {
                                            onDelete(reply.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!reply.isApproved && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center text-orange-800">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm font-medium">Bài trả lời đang chờ kiểm duyệt</span>
                    </div>
                </div>
            )}

            <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
            </div>
        </div>
    );
};

export default ReplyCard;
