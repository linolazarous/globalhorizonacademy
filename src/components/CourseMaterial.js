import { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { useToast } from '../hooks/useToast';
import FileIcon from './FileIcon';

const CourseMaterial = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const materialsRef = ref(storage, `courses/${courseId}/`);
        const res = await listAll(materialsRef);
        
        const materialsData = await Promise.all(
          res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return {
              name: item.name,
              url,
              type: item.name.split('.').pop().toLowerCase(),
              size: null // Can be enhanced with metadata
            };
          })
        );
        
        setMaterials(materialsData);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError('Failed to load course materials');
        showToast('Failed to load course materials', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [courseId, showToast]);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
        <p className="text-gray-600">No materials available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Course Materials</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {materials.map((material, index) => (
          <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <FileIcon type={material.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {material.name}
                </p>
                <p className="text-xs text-gray-500">
                  {material.type.toUpperCase()} • {formatFileSize(material.size)}
                </p>
              </div>
              <div>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  download
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseMaterial;