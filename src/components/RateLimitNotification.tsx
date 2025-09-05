import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface RateLimitNotificationProps {
  isRateLimited: boolean;
  waitTime?: number;
  onDismiss?: () => void;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  isRateLimited,
  waitTime = 0,
  onDismiss
}) => {
  const [timeLeft, setTimeLeft] = useState(waitTime);

  useEffect(() => {
    if (isRateLimited && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, timeLeft]);

  if (!isRateLimited) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Rate Limit Active
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              {timeLeft > 0 ? (
                <p>Please wait {timeLeft} seconds before making another AI request.</p>
              ) : (
                <p>You can now make AI requests again.</p>
              )}
              <p className="mt-1 text-xs">
                Basic analysis is still available without AI features.
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 flex-shrink-0 text-yellow-400 hover:text-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ApiStatusNotification: React.FC<{ status: 'available' | 'unavailable' | 'rate-limited' }> = ({ status }) => {
  if (status === 'available') {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                AI Service Available
              </h3>
              <p className="mt-1 text-sm text-green-700">
                OpenAI API is working properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                AI Service Unavailable
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Using basic analysis. Check your API key configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
