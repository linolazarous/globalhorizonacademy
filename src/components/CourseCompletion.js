// src/components/CourseCompletion.js
import { useState, useEffect } from 'react';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import CertificateTemplate from './CertificateTemplate';
import { useToast } from '../hooks/useToast';

const CourseCompletion = ({ courseId, courseName }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const triggerCertificate = httpsCallable(functions, 'triggerCertificate');
  const verifyCertificate = httpsCallable(functions, 'verifyCertificate');

  const handleGenerateCertificate = async () => {
    try {
      setLoading(true);
      const result = await triggerCertificate({ courseId });
      const { certificateId } = result.data;
      
      // Poll for certificate generation
      const checkCertificate = async () => {
        const verification = await verifyCertificate({ certificateId });
        
        if (verification.data.valid) {
          setCertificate(verification.data.certificate);
          showToast('Certificate generated successfully!', 'success');
        } else if (verification.data.reason === 'Certificate not yet generated') {
          setTimeout(checkCertificate, 2000); // Check again after 2 seconds
        } else {
          throw new Error(verification.data.reason || 'Certificate generation failed');
        }
      };
      
      await checkCertificate();
    } catch (error) {
      console.error('Certificate error:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check for existing certificate on load
  useEffect(() => {
    const checkExistingCertificate = async () => {
      try {
        const verification = await verifyCertificate({ courseId });
        if (verification.data.valid) {
          setCertificate(verification.data.certificate);
        }
      } catch (error) {
        console.error('Verification check failed:', error);
      }
    };
    
    checkExistingCertificate();
  }, [courseId]);

  if (certificate) {
    return (
      <CertificateTemplate
        studentName={certificate.studentName}
        courseName={certificate.courseName}
        completionDate={certificate.completionDate}
        certificateId={certificate.id}
        pdfUrl={certificate.pdfUrl}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Completed!</h2>
      <p className="text-gray-600 mb-6">
        Congratulations on completing {courseName}! You can now generate your certificate of completion.
      </p>
      <button
        onClick={handleGenerateCertificate}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-medium ${
          loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors`}
      >
        {loading ? 'Generating Certificate...' : 'Generate Certificate'}
      </button>
    </div>
  );
};

export default CourseCompletion;