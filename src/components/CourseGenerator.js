import { useState } from 'react';
import { auth } from '../firebase';
import { useToast } from '../hooks/useToast';
import { trackEvent } from '../utils/analytics';

const CourseGenerator = () => {
  const [formData, setFormData] = useState({
    topic: '',
    grade: '10',
    track: 'STEM',
    duration: '8', // weeks
    language: 'English'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      showToast('Please enter a course topic', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required');
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch('/.netlify/functions/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          courseTopic: formData.topic, 
          gradeLevel: formData.grade, 
          track: formData.track,
          duration: formData.duration,
          language: formData.language
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate course');
      }
      
      const data = await response.json();
      setGeneratedCourse(data);
      showToast('Course generated successfully!', 'success');
      trackEvent('course_generated', {
        courseId: data.courseId,
        topic: formData.topic,
        grade: formData.grade
      });
    } catch (error) {
      console.error('Course generation error:', error);
      showToast(error.message || 'Failed to generate course', 'error');
      trackEvent('course_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate New Course</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Course Topic *
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course topic"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {[7, 8, 9, 10, 11, 12].map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="track" className="block text-sm font-medium text-gray-700 mb-1">
              Academic Track
            </label>
            <select
              id="track"
              name="track"
              value={formData.track}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="STEM">STEM & Innovation</option>
              <option value="Humanities">Humanities & Global Affairs</option>
              <option value="Creative Arts">Creative Arts & Design</option>
              <option value="Sustainable Development">Sustainable Development</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Course Duration (weeks)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {[4, 6, 8, 10, 12, 16].map(weeks => (
                <option key={weeks} value={weeks}>{weeks} weeks</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !formData.topic.trim()}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors shadow-sm`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : 'Generate Course'}
      </button>

      {generatedCourse && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Course Generated Successfully!</h3>
          <p className="text-green-700">Course ID: {generatedCourse.courseId}</p>
          <a
            href={`/courses/${generatedCourse.courseId}`}
            className="mt-2 inline-block text-green-600 hover:text-green-800 font-medium"
          >
            View Course →
          </a>
        </div>
      )}
    </div>
  );
};

export default CourseGenerator;