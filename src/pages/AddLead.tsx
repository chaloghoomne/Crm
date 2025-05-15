'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploading, { type ImageListType } from 'react-images-uploading';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { Agent, Country, documents, emp, Lead, Package, Tours } from '../types/types';
import IconFolderPlus from '../components/Icon/IconFolderPlus';
import IconPlus from '../components/Icon/IconPlus';
import IconEye from '../components/Icon/IconEye';
import { set, values } from 'lodash';
import LeadView from './Apps/LeadView';
import Swal from 'sweetalert2';
import SweetAlert from './Components/SweetAlert';
import IconCreditCard from '../components/Icon/IconCreditCard';
import IconEdit from '../components/Icon/IconEdit';
import IconMail from '../components/Icon/IconMail';
import Mailbox from './Apps/Mailbox';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FollowUp from './Apps/FollowUp';
import { use } from 'i18next';
import { IRootState } from '../store';
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
    const [leadView, setLeadView] = useState('');
    const [openView, setOpenView] = useState(false);
    const [documentImages, setDocumentImages] = useState<Record<string, ImageListType>>({});
    const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
    const [lead, setLead] = useState<Lead[]>([]);
    const [leadFrom, setLeadFrom] = useState('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [serviceType, setServiceType] = useState('visa');
    const [emailTo, setEmailTo] = useState('');
    const [openMailbox, setOpenMailbox] = useState(false);
    const [value, setValue] = useState('');
    const [agentName, setAgentName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [empName, setEmpName] = useState('');
    // console.log(value);

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

    const loadRazorPayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    const handlePayment = async (lead: any) => {
        console.log(lead.price, lead._id);
        const res = await loadRazorPayScript();
        if (!res) {
            alert('Razorpay SDK failed to Load! Are you online?');
            return;
        }
        // const {data:order} = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getRazorpayOrder/${leadID}`);
        const { data: payment } = await axios.post(`${import.meta.env.VITE_BASE_URL}api/leadPayment`, { leadId: lead._id, amount: lead.price });
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY, // from Razorpay Dashboard
            amount: lead.price * 100,
            currency: 'INR',
            name: 'CRM Company Name',
            description: 'CRM Payment',
            order_id: payment.id,
            handler: async (response: any) => {
                console.log(response);
                // ✅ Payment success, hit backend to verify
                await axios.post('/api/payment-verify', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });
                alert('Payment Successful!');
            },
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '9999999999',
            },
            theme: { color: '#3399cc' },
        };
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };

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

    let price = filteredData ? filteredData.price : '';
    const validity = filteredData ? filteredData.validity : '';
    const entryType = filteredData ? filteredData.entryType : '';
    const visaName = filteredData ? filteredData.visaTypeHeading : '';
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const Docs = filteredData ? (filteredData.documents as documents[]) : [];
    const [agentModle, setAgentModle] = useState(false);

    const requiredDocs = Docs.filter((d) => d.show === 'true');

    // console.log(requiredDocs);
    // console.log(Docs);
    // console.log(filteredData,price,validity);

    const showAlert2 = async (type: number, message: string) => {
        if (type === 15) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
            toast.fire({
                icon: 'success',
                title: message,
                padding: '10px 20px',
            });
        }
        if (type === 16) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
            toast.fire({
                icon: 'warning',
                title: 'Lead Not Added',
                padding: '10px 20px',
            });
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

    const getAllEmp = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllEmp/${companyId}`);
            setEmployees(response.data);
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

    const getAgent = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAgents/${company_id}`);
            // console.log(res.data)
            setAgents(res.data.agent);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCountry();
        getTourTypes();
        getAgent();
        getAllEmp();
    }, []);
    const maxNumber = 10; // allow up to 5 images to be uploaded

    useEffect(() => {
        if (selectedCountry !== '' && selectedTourType !== '') getAllPackages(selectedCountry, selectedTourType);
    }, [selectedCountry, selectedTourType]);
    // console.log(country);

    const handleSubmitAgent = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        console.log('values', value);
        const finalValues = {
            ...values,
            companyId: company_id,
        };
        // console.log(finalValues);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/addnewagent`, finalValues);
            showAlert2(15, res.data.message);
            e.target.reset();
            setAgentModle(false);
        } catch (err) {
            console.log(err);
        }
    };

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

        let finalValues: { [key: string]: any } = {
            ...values,
            leadBy: empId,
            companyId: company_id,
            requirements: value,
            agentName: agentName,
            assignedEmpName: empName,
          };
          
          if (serviceType === 'visa') {
            finalValues = {
              ...finalValues,
              price: price,
              validity: validity,
              entryType: entryType,
              visaName: visaName,
            };
          }


        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/add-new-lead`, finalValues);
            console.log(res);
            e.target.reset();
            showAlert2(15, 'New Lead Added');
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
            <Tab.Group>
                <Tab.List className="mt-1 flex flex-wrap gap-2">
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
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button
                                className={`${
                                    selected ? 'bg-warning text-white !outline-none' : ''
                                } before:inline-block -mb-[1px] flex items-center rounded p-3.5 py-2 hover:bg-warning hover:text-white`}
                            >
                                <IconFolderPlus className="w-6 h-6" />
                                Follow Ups
                            </button>
                        )}
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="pt-5">
                            <button onClick={() => setAgentModle(true)} className="btn btn-primary">
                                Add New Agent
                            </button>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label>B2C/Agent</label>
                                        <select name="leadType" id="" className="form-select" onChange={(e: any) => setLeadFrom(e.target.value)}>
                                            <option value="B2C">B2C</option>
                                            <option value="Agent">Agent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Agent</label>
                                        <select name="agent" id="" className="form-select" onChange={(e: any) => setAgentName(e.target.options[e.target.selectedIndex].getAttribute('data-name'))}>
                                            <option value="#">Select a Agent</option>
                                            {agents.map((agent: Agent) => (
                                                <option key={agent._id} value={agent._id}data-name={agent.name}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Assigned Employeee</label>
                                        <select
                                            name="assignedEmpId"
                                            id=""
                                            className="form-select"
                                            onChange={(e: any) => {
                                                const empName = e.target.options[e.target.selectedIndex].getAttribute('data-name');
                                                if (empName) {
                                                    setEmpName(empName);
                                                }
                                            }}
                                        >
                                            <option value="#">Select a Employee</option>
                                            {employees.map((emp: emp) => (
                                                <option key={emp._id} value={emp._id} data-name={emp.name}>
                                                    {emp.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label htmlFor="Name">Contact Person Name</label>
                                        <input name="name" type="text" className="form-input" placeholder="Enter Name of the Applicant" />
                                    </div>
                                    <div>
                                        <label htmlFor="Email">Email</label>
                                        <input type="email" name="email" id="email" placeholder="abc@gmail.com" className="form-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="PhoneNumber">Phone Number</label>
                                        <input type="number" name="phoneNumber" id="phoneNumber" className="form-input" placeholder="Enter Phone Number" required />
                                    </div>
                                </div>

                                <div>
                                    <label>Service Type</label>
                                    <select name="serviceType" id="" className="form-select" onChange={(e) => setServiceType(e.target.value)} required>
                                        <option value="visa">Visa</option>
                                        <option value="tour">Tour Package</option>
                                        <option value="travelInsurance">Travel Insurance</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="flight">Flight</option>
                                    </select>
                                </div>
                                {serviceType === 'visa' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label htmlFor="Countires">Country</label>
                                            <select name="country" id="country" className="form-select" onChange={(e: any) => setSelectedCountry(e.target.value)}>
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
                                    </div>
                                )}
                                {serviceType === 'tour' && (
                                    <div>
                                        {/* <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label>Departure Destination</label>
                                                <input type="text" name="departureDest" className="form-input" />
                                            </div>
                                            <div>
                                                <label>Arrival Destination</label>
                                                <input type="text" name="arrivalDest" className="form-input" />
                                            </div>
                                        </div> */}
                                    </div>
                                )}

                                {serviceType === 'travelInsurance' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* <div>
                                            <label>Sum Assured</label>
                                            <input type="text" name="insuranceAmount" className="form-input" />
                                        </div> */}
                                    </div>
                                )}
                                {serviceType === 'hotel' && (
                                    <div className="grid grid-cols-1">
                                        <div>
                                            <label>Category</label>
                                            <select name="hotelCategory" id="" className="form-select">
                                                <option value="#">Select an Option</option>
                                                <option value="1star">1 Star</option>
                                                <option value="2star">2 Star</option>
                                                <option value="3star">3 Star</option>
                                                <option value="4star">4 Star</option>
                                                <option value="5star">5 Star</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {serviceType === 'flight' && (
                                    <div className="grid  gap-4">
                                        <div>
                                            <label>Flight Type</label>
                                            <select name="hotelCategory" id="" className="form-select">
                                                <option value="#">Select an Option</option>
                                                <option value="1star">One Way</option>
                                                <option value="2star">Two Way</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label>Destination</label>
                                        <input type="text" name="destination" className="form-input" />
                                    </div>
                                    {serviceType !== 'visa' && (
                                        <div>
                                        <label>Price</label>
                                        <input type="number" name="price" className="form-input" />
                                    </div>
                                    )}
                                    
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label>Adult</label>
                                        <input type="text" name="adult" className="form-input" placeholder="No. of Adults" />
                                    </div>
                                    <div>
                                        <label>Child</label>
                                        <input type="text" name="child" className="form-input" placeholder="No. of Children" />
                                    </div>
                                    <div>
                                        <label>Infants</label>
                                        <input type="text" name="infant" className="form-input" placeholder="No. of Infants" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label>From Date</label>
                                        <input type="date" name="fromDate" id="" className="form-input" />
                                    </div>
                                    <div>
                                        <label>To Date</label>
                                        <input type="date" name="toDate" id="" className="form-input" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label>Lead Source</label>
                                        <select name="leadSource" id="" className="form-select">
                                            <option value="#">Select an Option</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="Website">Website</option>
                                            <option value="referal">Referal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Priority</label>
                                        <select name="priority" id="" className="form-select">
                                            <option value="#">Select an Option</option>
                                            <option value="hot">Hot</option>
                                            <option value="cold">Cold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Payment Status</label>
                                        <select name="status" id="" className="form-select">
                                            <option value="#">Select an Option</option>

                                            <option value="Pending">Pending</option>
                                            <option value="InProgress">In Progress</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Complete">Complete</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label>Requirements</label>
                                    <ReactQuill theme="snow" value={value} onChange={setValue} />
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    {' '}
                                    Save
                                </button>
                            </form>
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div className="flex flex-wrap justify-center  gap-6 pt-5">
                            {lead.map((leadItem: Lead) => (
                                <div key={leadItem._id} className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
                                    {/* Priority Badge */}
                                    <div className="absolute right-3 top-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{leadItem.priority?.toUpperCase()}</div>

                                    {/* View Button */}
                                    <button
                                        onClick={() => {
                                            setLeadView(leadItem._id ?? '');
                                            setOpenView(true);
                                        }}
                                        className="absolute right-4 top-12 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
                                        title="View Lead"
                                    >
                                        <IconEye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEmailTo(leadItem?.email);
                                            setOpenMailbox(true);
                                        }}
                                    >
                                        <IconMail />
                                    </button>

                                    {openMailbox && (
                                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                            <div className="relative bg-white p-10 rounded shadow-lg w-[50%]">
                                                <button className="absolute top-2 right-2  text-gray-600 hover:text-black" onClick={() => setOpenMailbox(false)}>
                                                    Close
                                                </button>
                                                <Mailbox to={emailTo} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid Info */}
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Service Type</p>
                                            <p className="text-base font-bold text-gray-800 dark:text-white">{leadItem.serviceType?.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="text-base text-gray-800 dark:text-white">{leadItem.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-base text-gray-800 dark:text-white">{leadItem.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Phone Number</p>
                                            <p className="text-base text-gray-800 dark:text-white">{leadItem.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Lead Source</p>
                                            <p className="text-base text-gray-800 dark:text-white">{leadItem.leadSource}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Agent</p>
                                            <p className="text-base text-gray-800 dark:text-white">{leadItem.agent}</p>
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="mt-6 bg-green-100 dark:bg-green-700 text-center py-3 rounded-md shadow-sm">
                                        <p className="text-sm font-semibold text-gray-600 dark:text-white">Payment Status</p>
                                        <p className="text-base font-bold text-green-800 dark:text-white">{leadItem.status.toUpperCase()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <FollowUp />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            {agentModle && (
                <div className="fixed inset-0 w-full h-full flex items-center justify-center z-20 bg-black bg-opacity-70">
                    <div className="bg-white p-6 rounded-md w-[30%]">
                        <div className=" bg-blue-200 p-2 justify-center  rounded-md font-bold">
                            <p>ADD AGENT/CLIENT</p>
                        </div>
                        <form className="space-y-4 pt-4" onSubmit={handleSubmitAgent}>
                            <div>
                                <label>Type</label>
                                <select name="type" id="" className="form-select">
                                    <option value="agent">Agent</option>
                                    <option value="client">B2C</option>
                                </select>
                            </div>
                            <div>
                                <label>Name</label>
                                <input type="text" name="name" id="" className="form-input" />
                            </div>
                            <div>
                                <label>Email</label>
                                <input type="text" name="email" id="" className="form-input" />
                            </div>
                            <div>
                                <label>Mobile</label>
                                <input type="text" name="mobile" id="" className="form-input" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setAgentModle(false)} className="btn  btn-secondary">
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {leadView && openView && (
                <div>
                    <LeadView leadID={leadView} setLeadView={setOpenView} />
                </div>
            )}
        </div>
    );
};
export default AddLead;
