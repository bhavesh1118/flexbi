import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Clock, FileText, Database, BarChart3, Zap, Loader2 } from 'lucide-react';
import { BackendConnection } from '../utils/BackendConnection';

interface LargeFileUploadProps {
  onFileProcessed: (result: any) => void;
  onError: (error: string) => void;
}

interface ProcessingStatus {
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error' | 'cancelled';
  progress: number;
  message: string;
  processingId?: string;
  estimatedTime?: string;
  systemStats?: {
    memory_usage: number;
    cpu_usage: number;
    available_memory: number;
  };
}

interface FileValidation {
  filename: string;
  size: number;
  extension: string;
  content_type: string;
  estimated_processing_time: {
    estimated_seconds: number;
    estimated_human: string;
    confidence: string;
  };
  recommendations: string[];
}

const LargeFileUpload: React.FC<LargeFileUploadProps> = ({ onFileProcessed, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to upload'
  });
  const [dragActive, setDragActive] = useState(false);
  const [useChunked, setUseChunked] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Maximum file size: 200MB
  const MAX_FILE_SIZE = 200 * 1024 * 1024;
  const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB chunks

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [eventSource]);

  const validateFile = async (file: File): Promise<boolean> => {
    try {
      setStatus({ status: 'validating', progress: 0, message: 'Validating file...' });

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        onError(`File too large. Maximum size allowed: ${Math.round(MAX_FILE_SIZE / (1024*1024))}MB`);
        return false;
      }

      // Check file type
      const allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.tsv', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        onError(`Unsupported file type. Allowed: ${allowedTypes.join(', ')}`);
        return false;
      }

      // Validate with backend
      const formData = new FormData();
      formData.append('file', file);

      const response = await BackendConnection.post('/api/upload/validate', formData);

      const validationResult = response;
      setValidation(validationResult.file_info);
      
      // Recommend chunked upload for files > 50MB
      if (file.size > 50 * 1024 * 1024) {
        setUseChunked(true);
      }

      setStatus({ 
        status: 'idle', 
        progress: 0, 
        message: `File validated: ${file.name} (${formatFileSize(file.size)})` 
      });

      return true;
    } catch (error) {
      onError(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const uploadFile = async (file: File) => {
    try {
      abortControllerRef.current = new AbortController();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify({
        chunk_processing: useChunked,
        memory_efficient: file.size > 100 * 1024 * 1024
      }));

      setStatus({ status: 'uploading', progress: 0, message: 'Starting upload...' });

      const response = await BackendConnection.post('/api/upload/process', formData);

      const result = response;
      
      if (result.processing_id) {
        // Start monitoring progress
        startProgressMonitoring(result.processing_id);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus({ status: 'cancelled', progress: 0, message: 'Upload cancelled' });
      } else {
        onError(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setStatus({ status: 'error', progress: 0, message: 'Upload failed' });
      }
    }
  };

  const uploadFileChunked = async (file: File) => {
    try {
      const fileId = generateFileId(file);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      setStatus({ 
        status: 'uploading', 
        progress: 0, 
        message: 'Uploading ' + totalChunks + ' chunks...' 
      });

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunk_index', chunkIndex.toString());
        formData.append('total_chunks', totalChunks.toString());
        formData.append('file_id', fileId);
        formData.append('filename', file.name);

        const response = await BackendConnection.post('/api/upload/chunk', formData);

        const result = response;
        
        setStatus({
          status: 'uploading',
          progress: (chunkIndex + 1) / totalChunks * 50, // 50% for upload
          message: 'Uploaded chunk ' + (chunkIndex + 1) + '/' + totalChunks
        });

        if (result.ready_for_processing) {
          // Start processing the assembled file
          setStatus({
            status: 'processing',
            progress: 50,
            message: 'File assembled, starting processing...'
          });
          // Additional processing would be triggered here
        }
      }

    } catch (error) {
      onError('Chunked upload error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const startProgressMonitoring = (processingId: string) => {
    // Close existing event source
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource(BackendConnection.getUrl(`/api/upload/stream/${processingId}`));
    setEventSource(es);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        setStatus({
          status: data.status,
          progress: data.progress || 0,
          message: data.message || 'Processing...',
          processingId: processingId,
          systemStats: data.system_stats
        });

        if (data.status === 'complete') {
          onFileProcessed(data);
          es.close();
          setEventSource(null);
        } else if (data.status === 'error') {
          onError(data.message || 'Processing failed');
          es.close();
          setEventSource(null);
        }
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    };

    es.onerror = () => {
      console.error('EventSource error');
      es.close();
      setEventSource(null);
    };
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);

    const isValid = await validateFile(file);
    if (isValid) {
      // Auto-start upload after validation
      if (useChunked) {
        await uploadFileChunked(file);
      } else {
        await uploadFile(file);
      }
    }
  }, [useChunked]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const cancelProcessing = async () => {
    if (status.processingId) {
      try {
        await BackendConnection.fetchWithRetry(`/api/upload/cancel/${status.processingId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Cancel request failed:', error);
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    setStatus({ status: 'cancelled', progress: 0, message: 'Processing cancelled' });
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setValidation(null);
    setStatus({ status: 'idle', progress: 0, message: 'Ready to upload' });
    setUseChunked(false);
    
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateFileId = (file: File): string => {
    return `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'validating':
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-yellow-600" />;
      default:
        return <Upload className="w-5 h-5" />;
    }
  };

  const getProgressColor = () => {
    switch (status.status) {
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'cancelled':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : status.status === 'idle' 
              ? 'border-gray-300 hover:border-gray-400' 
              : 'border-gray-200'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={status.status !== 'idle'}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className={`p-3 rounded-full ${
              status.status === 'idle' ? 'bg-gray-100' : 'bg-blue-100'
            }`}>
              {getStatusIcon()}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enhanced Large File Upload
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Support for files up to 200MB with unlimited rows
            </p>
          </div>

          {status.status === 'idle' && (
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </button>
              <p className="text-xs text-gray-500">
                Or drag and drop your file here
              </p>
              <p className="text-xs text-gray-500">
                Supported: CSV, Excel, JSON, TSV (up to 200MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                  {validation && (
                    <span className="ml-2">
                      • Est. {validation.estimated_processing_time.estimated_human}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {status.status === 'idle' && (
              <button
                onClick={resetUpload}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Processing Options */}
          {status.status === 'idle' && selectedFile.size > 50 * 1024 * 1024 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Large File Detected
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Will use chunked upload and memory-efficient processing for optimal performance
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {status.status !== 'idle' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {status.message}
            </span>
            <span className="text-sm text-gray-500">
              {status.progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${status.progress}%` }}
            />
          </div>

          {/* System Stats */}
          {status.systemStats && (
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Database className="w-3 h-3 mr-1" />
                Memory: {status.systemStats.memory_usage.toFixed(0)}%
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-3 h-3 mr-1" />
                CPU: {status.systemStats.cpu_usage.toFixed(0)}%
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Available: {status.systemStats.available_memory.toFixed(1)}GB
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {(status.status === 'uploading' || status.status === 'processing') && (
            <button
              onClick={cancelProcessing}
              className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Cancel Processing
            </button>
          )}
        </div>
      )}

      {/* Recommendations */}
      {validation && validation.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="flex items-center text-sm font-medium text-yellow-800 mb-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            Recommendations
          </h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validation.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LargeFileUpload;
