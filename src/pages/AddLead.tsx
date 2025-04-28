'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploading, { type ImageListType } from 'react-images-uploading';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { Country, documents, Lead, Package, Tours } from '../types/types';
import IconFolderPlus from '../components/Icon/IconFolderPlus';
import IconPlus from '../components/Icon/IconPlus';
import IconEye from '../components/Icon/IconEye';
import { set } from 'lodash';
import LeadView from './Apps/LeadView';
import Swal from 'sweetalert2';
import SweetAlert from './Components/SweetAlert';
import IconCreditCard from '../components/Icon/IconCreditCard';

const AddLead = () => {
    const empId = useSelector((state: any) => state.auth.id);
    const navigate = useNavigate();
    const company_id = useSelector((state: any) => state.auth.company_id);
    const [country, setCountry] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [tourTypes, setTourTypes] = useState([]);
    const [selectedTourType, setSelectedTourType] = useState('');
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [leadView, setLeadView] = useState("");
    const [openView, setOpenView] = useState(false);
    const [documentImages, setDocumentImages] = useState<Record<string, ImageListType>>({});
    const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
    const [lead, setLead] = useState<Lead[]>([]);
 
    const uploadToBunny = async (file: File, docName: string): Promise<string> => {
        try {
            // console.log(file.name, file.lastModified);
            const storageZoneName = import.meta.env.VITE_PUBLIC_BUNNY_STORAGE_ZONE;
            const accessKey = import.meta.env.VITE_PUBLIC_BUNNY_ACCESS_KEY;
            const pullZone = import.meta.env.VITE_PUBLIC_BUNNY_CDN_URL;
            const placeName = `${company_id}`;

            const timestamp = Date.now();
            const safeFileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;

            const uploadUrl = `https://sg.storage.bunnycdn.com/${storageZoneName}/${placeName}/${safeFileName}`;

            // console.log('Uploading to:', uploadUrl);

            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    AccessKey: accessKey,
                    'Content-Type': file.type,
                },
                body: file,
            });

            // 🛑 Check if response is OK
            if (!response.ok) {
                console.error('Upload failed! Status:', response.status);
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const fileUrl = `${pullZone}/${placeName}/${safeFileName}`;

            // console.log(`Successfully uploaded ${docName} to ${fileUrl}`);

            setDocumentUrls((prev) => ({
                ...prev,
                [docName]: fileUrl,
            }));

            return fileUrl;
        } catch (error) {
            console.error('Error uploading to Bunny via fetch:', error);
            return '';
        }
    };


     const loadRazorPayScript = () =>{
            return new Promise((resolve)=>{
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            })
        }
        const handlePayment = async(lead:any)=>{
            console.log(lead.price,lead._id);
            const res = await loadRazorPayScript();
            if(!res){
                alert('Razorpay SDK failed to Load! Are you online?');
                return;
            }
            // const {data:order} = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getRazorpayOrder/${leadID}`);
            const {data:payment} = await axios.post(`${import.meta.env.VITE_BASE_URL}api/leadPayment`, {leadId:lead._id, amount:lead.price});
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY, // from Razorpay Dashboard
                amount: lead.price*100,
                currency: 'INR',
                name: "CRM Company Name",
                description: "CRM Payment",
                order_id: payment.id,
                handler: async (response: any) => {
                  console.log(response);
                  // ✅ Payment success, hit backend to verify
                  await axios.post("/api/payment-verify", {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                  alert("Payment Successful!");
                },
                prefill: {
                  name: "Customer Name",
                  email: "customer@example.com",
                  contact: "9999999999",
                },
                theme: { color: "#3399cc" },
              };
              const paymentObject = new (window as any).Razorpay(options);
              paymentObject.open();
            
        }

    // console.log(storageZoneName, accessKey, storageUrl);

    const onImageChange = (docName: string, imageList: ImageListType) => {
        setDocumentImages((prev) => ({
            ...prev,
            [docName]: imageList,
        }));

        // If the image was removed, also remove from documentUrls
        if (imageList.length === 0) {
            setDocumentUrls((prev) => {
                const newUrls = { ...prev };
                delete newUrls[docName];
                return newUrls;
            });
        }
    };
    // console.log(documentImages);

    const filteredData = packages.find((d: Package) => d._id === selectedPackage);

    const price = filteredData ? filteredData.price : "";
    const validity = filteredData ? filteredData.validity : "";
    const entryType = filteredData ? filteredData.entryType : "";
    const visaName = filteredData ? filteredData.visaTypeHeading : "";
    
    const Docs = filteredData ? (filteredData.documents as documents[]) : [];
    
    const requiredDocs = Docs.filter((d) => d.show === 'true'); 
    
    console.log(requiredDocs);
    console.log(Docs);
    console.log(filteredData,price,validity);

    const showAlert2 = async (type: number) => {
            if (type === 15) {
                const toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
                toast.fire({
                    icon: 'success',
                    title: 'New Lead Added successfully',
                    padding: '10px 20px',
                });
            }
            if(type === 16){
                const toast = Swal.mixin({
                    toast:true,
                    position:'top-end',
                    showConfirmButton:false,
                    timer:3000,
                });
                toast.fire({
                    icon:'warning',
                    title:'Lead Not Added',
                    padding:'10px 20px'
                })
            }
        };

    const getCountry = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL2}api/v1/getAllCountries`);
            setCountry(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };
    const getTourTypes = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL2}api/v1/getTourTypes`);
            setTourTypes(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };
    const getAllPackages = async (id1: string, id2: string) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL2}api/v1/getPackages`, { id1: id1, id2: id2 });
            console.log(res.data.data);
            setPackages(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCountry();
        getTourTypes();
    }, []);
    const maxNumber = 10; // allow up to 5 images to be uploaded

    useEffect(() => {
        if (selectedCountry !== '' && selectedTourType !== '') getAllPackages(selectedCountry, selectedTourType);
    }, [selectedCountry, selectedTourType]);
    // console.log(country);



    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());

        // Upload all images first
        const uploadPromises = [];
        for (const docName in documentImages) {
            console.log(docName);
            const images = documentImages[docName];
            console.log(images);
            console.log(images[0]?.file);
            if (images && images.length > 0 && images[0]?.file) {
                uploadPromises.push(uploadToBunny(images[0].file, docName));
            }
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        const finalValues = {
            ...values,
            price: price,
            validity: validity,
            entryType: entryType,
            visaName: visaName,
            leadBy: empId,
            company_id: company_id,
            document: documentUrls, // This now contains all the uploaded document URLs
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/add-new-lead`, finalValues);
            console.log(res);
            e.target.reset();
            showAlert2(15)

            // You might want to add success notification or redirect here
        } catch (err) {
            console.log(err);
            // You might want to add error notification here
        }
    };

    const getLeads = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getLeads`);
            console.log(res.data);
            setLead(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        getLeads();
    }, []);

    

    return (
        <div>
            <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        DashBoard
                    </Link>
                </li>
                <li>
                    <span className=" before:content-['/'] before:ltr:mr-2 before:rtl:ml-2 hover:underline">Add Lead</span>
                </li>
            </ul>

            <Tab.Group>
                <Tab.List className="mt-3 flex flex-wrap gap-2">
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button
                                className={`${
                                    selected ? 'bg-warning text-white !outline-none' : ''
                                } before:inline-block -mb-[1px] flex items-center rounded p-3.5 py-2 hover:bg-warning hover:text-white`}
                            >
                                <IconPlus className="w-6 h-6" />
                                Add Leads
                            </button>
                        )}
                    </Tab>
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button
                                className={`${
                                    selected ? 'bg-warning text-white !outline-none' : ''
                                } before:inline-block -mb-[1px] flex items-center rounded p-3.5 py-2 hover:bg-warning hover:text-white`}
                            >
                                <IconEye className="w-6 h-6" />
                                View Leads
                            </button>
                        )}
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="pt-5">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="Countires">Country</label>
                                    <select name="package" id="country" className="form-select" onChange={(e: any) => setSelectedCountry(e.target.value)}>
                                        <option value="#">Select a Country</option>
                                        {country.map((coun: Country) => (
                                            <option key={coun._id} value={coun._id}>
                                                {coun.country}{' '}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="TourType">Tour Type</label>
                                    <select name="tourType" id="" className="form-select" onChange={(e: any) => setSelectedTourType(e.target.value)}>
                                        <option value="#"> Select a Tour Type</option>
                                        {tourTypes.map((tour: Tours) => (
                                            <option key={tour.name} value={tour._id}>
                                                {tour.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="visaCategory">Packages</label>
                                    <select name="visaCategory" id="" className="form-select" onChange={(e: any) => setSelectedPackage(e.target.value)}>
                                        <option value="#"> Select a Visa Package</option>
                                        {packages.map((pack: Package) => (
                                            <option key={pack._id} value={pack._id}>
                                                {pack.visaTypeHeading + ' - ' + 'Price:' + ' ' + pack.price + ' - ' + pack.validity + ' ' + 'Days Validity' + ' - ' + pack.entryType}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="Name">Full Name</label>
                                    <input name="name" type="text" className="form-input" placeholder="Enter Name of the Applicant" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="Gender">Gender</label>
                                        <select name="gender" id="gender" className="form-select">
                                            <option value="#">Select a Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="ageGroup">Age Group</label>
                                        <select name="ageGroup" id="ageGroup" className="form-select">
                                            <option value="#">Select Age Group</option>
                                            <option value="Child">Under 18</option>
                                            <option value="Adult">18 and Over</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="date">Date</label>
                                    <input type="date" name="dob" id="dob" className="form-input" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="FathersName">Father's Name</label>
                                        <input type="text" className="form-input" name="fathersName" id="fathersName" placeholder="Enter Father's Name" />
                                    </div>
                                    <div>
                                        <label htmlFor="MothersName">Mother's Name</label>
                                        <input type="text" className="form-input" name="mothersName" id="mothersName" placeholder="Enter Mother's Name" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <input type="email" name="email" id="email" placeholder="abc@gmail.com" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="PhoneNumber">Phone Number</label>
                                    <input type="number" name="phoneNumber" id="phoneNumber" className="form-input" placeholder="9140949751" />
                                </div>
                                <div>
                                    <label htmlFor="PassportNumber">Passport Number</label>
                                    <input type="text" name="passport" id="passport" className="form-input" placeholder="Enter your passport number" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="PassportIssueDate"> Passport Issue Date</label>
                                        <input type="date" name="passportIssueDate" id="passportIssueDate" className="form-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="PassportExpiryDate"> Passport Valid Till</label>
                                        <input type="date" name="passportExpiryDate" id="passportExpiryDate" className="form-input" />
                                    </div>
                                </div>
                                <p className='font-semibold text-2xl text-center my-5 border-t-2 border-dashed border-gray-500 p-4'>Add Documents</p>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    
                                    {requiredDocs?.map((doc: documents, index: number) => (      
                                        <div key={doc.name} className="mb-6">
                                            
                                            <div className="custom-file-container" data-upload-id={`document-${doc.name}`}>
                                                {/* Label and Clear Button */}
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="font-semibold">{doc.name}</label>
                                                    <button
                                                        type="button"
                                                        className="custom-file-container__image-clear text-red-500"
                                                        title="Clear Image"
                                                        onClick={() =>
                                                            setDocumentImages((prev) => ({
                                                                ...prev,
                                                                [doc.name]: [],
                                                            }))
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>

                                                {/* File Upload Button */}
                                                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                                <ImageUploading value={documentImages[doc.name] || []} onChange={(imageList) => onImageChange(doc.name, imageList)} maxNumber={maxNumber}>
                                                    {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
                                                        <div className="upload__image-wrapper text-center">
                                                            <button type="button" className="custom-file-container__custom-file__custom-file-control mb-10" onClick={onImageUpload} {...dragProps}>
                                                                Choose File...
                                                            </button>

                                                            {/* Image Previews */}
                                                            {imageList.length > 0 ? (
                                                                imageList.map((image, imgIndex) => (
                                                                    <div key={imgIndex} className="custom-file-container__image-preview relative mb-2">
                                                                        <img src={image.dataURL || '/placeholder.svg'} alt="uploaded" className="m-auto max-h-48" />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                                            onClick={() => onImageRemove(imgIndex)}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <img src="/assets/images/file-preview.svg" alt="default preview" className="max-w-md w-full m-auto" />
                                                            )}
                                                        </div>
                                                    )}
                                                </ImageUploading>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    {' '}
                                    Button
                                </button>
                            </form>
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div className="flex flex-wrap justify-center  gap-6 pt-5">
                            {lead.map((leadItem: Lead) => (
                                <div key={leadItem._id} className=" bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">ID</p>
                                            <p className="text-base font-bold">{leadItem._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">Name</p>
                                            <p className="text-base">{leadItem.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">Email</p>
                                            <p className="text-base">{leadItem.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">Phone Number</p>
                                            <p className="text-base">{leadItem.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">Passport Number</p>
                                            <p className="text-base">{leadItem.passport}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">Gender</p>
                                            <p className="text-base">{leadItem.gender}</p>
                                        </div>
                                        <div className='btn btn-primary'  onClick={() => {setLeadView(leadItem._id ?? ''); setOpenView(true)}}>
                                            <p className="text-sm font-semibold "><IconEye/>View</p>
                                            {/* <p></p> */}
                                        </div>
                                        <div className='btn btn-primary'>
                                        <button onClick={()=>handlePayment(leadItem)}> <IconCreditCard/> Pay Now</button>
                                        </div>
                                        <div className=' col-span-2 py-4 rounded-md text-center bg-green-500 w-full'>
                                            <p className="text-sm font-semibold text-gray-500">Visa Status</p>
                                            <p className="text-base">{leadItem.status.toUpperCase()}</p>
                                        </div>
                                        
                                       
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            {leadView && openView && (
                <div>
                    <LeadView leadID={leadView} setLeadView={setLeadView} />
                </div>
            )}
        </div>
    );
};
export default AddLead;
