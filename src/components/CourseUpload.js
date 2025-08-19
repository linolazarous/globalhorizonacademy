import { useState, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '../hooks/useToast';
import { trackEvent } from '../utils/analytics';

const CourseUpload = ({ courseId }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type and size
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'image/jpeg',
      'image/png'
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF, PPT, DOC, MP4, JPG, or PNG.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit.');
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !courseId) return;

    setIsUploading(true);
    setError(null);
    
    try {
      // Create storage reference with organized path
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `material-${timestamp}.${fileExt}`;
      const storageRef = ref(storage, `courses/${courseId}/materials/${fileName}`);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('File upload failed. Please try again.');
          showToast('File upload failed', 'error');
          trackEvent('file_upload_failed', { 
            courseId, 
            error: error.message 
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size
          }]);
          
          showToast('File uploaded successfully!', 'success');
          trackEvent('file_uploaded', {
            courseId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });
          
          // Reset for next upload
          setFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred during upload.');
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Course Material</h3>
        <p className="text-sm text-gray-500">
          Supported formats: PDF, PPT, DOC, MP4, JPG, PNG (Max 50MB)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isUploading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {file && (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 truncate">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !file || isUploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors shadow-sm`}
        >
          {isUploading ? 'Uploading...' : 'Upload Material'}
        </button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 mb-3">Recently Uploaded</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-700 truncate">
                  {uploadedFile.name}
                </span>
                <a
                  href={uploadedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseUpload;