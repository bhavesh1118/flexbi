import React from 'react';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { type, content } = message;
  
  const getBubbleStyle = () => {
    switch (type) {
      case 'user':
        return 'bg-indigo-100 text-gray-800 ml-auto';
      case 'ai':
        return 'bg-white border border-gray-200 text-gray-800';
      case 'system':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800';
      default:
        return 'bg-white border border-gray-200 text-gray-800';
    }
  };
  
  const getAuthorName = () => {
    switch (type) {
      case 'user':
        return 'You';
      case 'ai':
        return 'FlexBI Assistant';
      case 'system':
        return 'System';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };
  
  return (
    <div className={`max-w-[85%] ${type === 'user' ? 'ml-auto' : ''}`}>
      <div className="mb-1 text-xs text-gray-500 font-medium">
        {getAuthorName()}
      </div>
      <div className={`p-3 rounded-lg ${getBubbleStyle()}`}>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;