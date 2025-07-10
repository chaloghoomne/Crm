import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import axios from 'axios';
import { useBunnyUpload } from '../../components/useBunny';

export const ImageChange = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [loadings, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<"logo" | "signature" | null>(null);

  const companyId = useSelector((state: IRootState) => state.auth.company_id);
  const { uploadFiles, loading } = useBunnyUpload();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`);
        setLogo(res.data.imgurl);
        setSignature(res.data.signature);
      } catch (err) {
        console.error('Error', err);
        setError('Failed to fetch images');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchData();
  }, [companyId]);

  const handleSubmit = async (file: File | null, name: "logo" | "signature") => {
    if (!file) {
      setError(`No file selected for ${name}`);
      return;
    }

    setUploadingType(name);
    try {
      const uploaded = await uploadFiles(file, name);
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/editImage`, {
        img: uploaded.imageUrls[0],
        name,
        companyId,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setUploadingType(null);
    }
  };

  if (loading || loadings) return <p className="text-center py-4">Loading images...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="space-y-8 max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Section: Logo */}
      <div className="border-b pb-6">
        <p className="text-lg font-semibold mb-2">Company Logo</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="cursor-pointer text-sm px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 transition w-fit">
            Select Logo
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogo(URL.createObjectURL(file));
                  setLogoFile(file);
                }
              }}
            />
          </label>
          {logo && (
            <img
              src={logo}
              alt="Company Logo"
              className="w-32 h-auto border rounded object-contain hover:scale-105 transition-transform duration-200"
            />
          )}
        </div>
        <button
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => handleSubmit(logoFile, "logo")}
          disabled={uploadingType === "logo"}
        >
          {uploadingType === "logo" ? "Uploading..." : "Upload Logo"}
        </button>
      </div>

      {/* Section: Signature */}
      <div>
        <p className="text-lg font-semibold mb-2">Signature</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="cursor-pointer text-sm px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 transition w-fit">
            Select Signature
            <input
              type="file"
              name="signature"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSignature(URL.createObjectURL(file));
                  setSignatureFile(file);
                }
              }}
            />
          </label>
          {signature && (
            <img
              src={signature}
              alt="Signature"
              className="w-32 h-auto border rounded object-contain hover:scale-105 transition-transform duration-200"
            />
          )}
        </div>
        <button
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => handleSubmit(signatureFile, "signature")}
          disabled={uploadingType === "signature"}
        >
          {uploadingType === "signature" ? "Uploading..." : "Upload Signature"}
        </button>
      </div>
    </div>
  );
};


