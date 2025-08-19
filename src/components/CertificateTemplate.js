// src/components/CertificateTemplate.js
import { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CertificateTemplate = ({ studentName, courseName, completionDate, certificateId }) => {
  const certificateRef = useRef(null);

  const generatePDF = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const uploadCertificate = async (pdf) => {
    const pdfBlob = pdf.output('blob');
    const storageRef = ref(storage, `certificates/${certificateId}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    return await getDownloadURL(storageRef);
  };

  const handleDownload = async () => {
    const pdf = await generatePDF();
    pdf.save(`${studentName}-${courseName}-certificate.pdf`);
  };

  const handleSaveToProfile = async () => {
    const pdf = await generatePDF();
    const downloadURL = await uploadCertificate(pdf);
    // Save URL to user's profile in Firestore
  };

  return (
    <div className="p-6">
      <div 
        ref={certificateRef} 
        className="w-full max-w-4xl mx-auto bg-white border-2 border-gold-500 p-8 shadow-lg"
        style={{
          backgroundImage: 'url(/certificate-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '600px'
        }}
      >
        <div className="text-center">
          <div className="mb-8">
            <img src="/logo.png" alt="Global Horizon Academy" className="h-20 mx-auto" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
          <p className="text-xl text-gray-600 mb-12">This is to certify that</p>
          
          <h2 className="text-5xl font-bold text-blue-800 mb-12">{studentName}</h2>
          
          <p className="text-xl text-gray-600 mb-2">has successfully completed the course</p>
          <h3 className="text-3xl font-semibold text-gray-800 mb-12">{courseName}</h3>
          
          <div className="flex justify-between mt-16">
            <div className="text-center">
              <div className="h-1 bg-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium">{completionDate}</p>
            </div>
            <div className="text-center">
              <div className="h-1 bg-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-gray-600">Certificate ID</p>
              <p className="font-mono">{certificateId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <button 
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Download Certificate
        </button>
        <button 
          onClick={handleSaveToProfile}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Save to Profile
        </button>
      </div>
    </div>
  );
};

export default CertificateTemplate;