const SimpleChatMessage = ({ message }: { message: any }) => {
  const { type, content } = message;
  
  return (
    <div className={`p-3 mb-3 rounded-lg ${
      type === 'user' 
        ? 'bg-blue-100 ml-auto max-w-xs' 
        : 'bg-gray-100 mr-auto max-w-xs'
    }`}>
      <div className="text-xs text-gray-500 mb-1">
        {type === 'user' ? 'You' : 'AI'}
      </div>
      <div className="text-sm">
        {typeof content === 'string' && content.startsWith('<div') ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
};

export default SimpleChatMessage;
