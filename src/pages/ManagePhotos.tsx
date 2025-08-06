import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { usePhotoVerification } from "@/hooks/usePhotoVerification";
import { Badge } from "@/components/ui/badge";

const ManagePhotos = () => {
  const navigate = useNavigate();
  const { 
    uploads, 
    loading, 
    uploading, 
    uploadPhoto, 
    deletePhoto, 
    setPrimaryPhoto,
    getUploadStats 
  } = usePhotoVerification();

  const stats = getUploadStats();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadPhoto(file);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Processing</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/account")}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Photos</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Photo Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload 2-6 high-quality photos</li>
            <li>• Your first photo will be your main profile picture</li>
            <li>• Show your face clearly in at least one photo</li>
            <li>• Avoid group photos as your main picture</li>
          </ul>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading photos...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {uploads.map((upload) => (
                <div key={upload.id} className="relative">
                  <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                    <img 
                      src={upload.file_url} 
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo Controls */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between">
                    <div className="flex flex-col gap-1">
                      {upload.is_primary && (
                        <div className="bg-primary text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Main
                        </div>
                      )}
                      {getStatusBadge(upload.upload_status)}
                    </div>
                    <button
                      onClick={() => deletePhoto(upload.id)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Set as Main Button */}
                  {!upload.is_primary && upload.upload_status === 'approved' && (
                    <button
                      onClick={() => setPrimaryPhoto(upload.id)}
                      className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg text-sm font-medium"
                    >
                      Set as Main
                    </button>
                  )}
                </div>
              ))}

              {/* Add Photo Button */}
              {stats.total < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-lg font-bold">+</span>
                      </div>
                      <span className="text-sm text-gray-500">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Photo Count & Stats */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                {stats.total} of 6 photos added
              </p>
              {stats.total > 0 && (
                <div className="text-xs text-gray-400">
                  Approved: {stats.approved} | Pending: {stats.pending} | Rejected: {stats.rejected}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default ManagePhotos;