import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3003/api",
  timeout: 5000, 
});

export const handlePrintDownload = async (selectedInvoice: any) => {
  try {
    // Send the selected invoice ID to the backend
    const response = await api.get(`/generate-pdf/${selectedInvoice._id}`, { responseType: 'blob' });
    
    // Create blob URL
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Open in new tab
    window.open(pdfUrl, '_blank');
    
    // Clean up
    window.URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

export default api;


