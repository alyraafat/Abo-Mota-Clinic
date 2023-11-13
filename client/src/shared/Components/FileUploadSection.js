import { useRemoveDocumentMutation, useUploadMedicalHistoryMutation } from "../../store";
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';

function FileUploadSection({ files }) {
  const [uploadMedicalHistory] = useUploadMedicalHistoryMutation();
  const [removeDocument]  = useRemoveDocumentMutation();
  
  const handleFileUpload = (event) => {
    const files = event.target.files;
    
    if (files.length > 0) {
        uploadMedicalHistory({medicalHistory:files[0]});
    }
  };
  
  
  const handleViewFile = (file) => {
    const arrayBuffer = new Uint8Array(file.data.data).buffer;
    const blob = new Blob([arrayBuffer], {type: file.contentType});
    const fileUrl = URL.createObjectURL(blob);
    window.open(fileUrl, '_blank');
  };

  const handleRemoveFile = (file)=>{
    console.log(file);
    removeDocument(file);
  }
  

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">Medical History :</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">{file.fileName}, {/*{file.size}*/}</span>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:underline" onClick={() => handleViewFile(file)}>View</button>
              <button 
            className="text-red-600 hover:underline" 
            onClick={() => {handleRemoveFile(file)}}
            aria-label="Remove file"
          >
            <AiOutlineClose />
          </button>
            </div>
          </div>
        ))}
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">
            Upload Files
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} multiple />
        </div>
      </div>
    </div>
  );
}

export default FileUploadSection;
