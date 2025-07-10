import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useBunnyUpload } from '../components/useBunny';
import { FaImages, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';

type EmailConfig = {
    name: string;
    email: string;
    password: string;
    host: string;
    secure: boolean;
    provider: string;
};

const Company = () => {
    const defaultParams = {
        company: '',
        admnEmail: '',
        email: [{}],
        password: '',
    };
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const role = useSelector((state:IRootState)=>state.auth.role);
    const [Images, setImages] = useState('');
    const [signature, setSignature] = useState('');
    const [configs, setConfigs] = useState<EmailConfig[]>([
        {
            name: '',
            email: '',
            password: '',
            host: '',
            secure: true,
            provider: '',
        },
    ]);
    const { uploadFiles, loading } = useBunnyUpload();

    useEffect(()=>{
        if(role !== 'admin') window.location.href = '/';
    })

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
                title: message,
                padding: '10px 20px',
            });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const name = e.target.name;
        const result = await uploadFiles(files?.[0] ?? [], name); // Use optional chaining and default to an empty array if files is null

        setImages(result.imageUrls[0]);
        console.log(result);
    };
    const handleRemoveImage = () => {
        setImages('');
    };

    const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const name = e.target.name;
        const result = await uploadFiles(files?.[0] ?? [], name); // Use optional chaining and default to an empty array if files is null

        setSignature(result.imageUrls[0]);
        console.log(result);
    };
    const handleRemoveSignature = () => {
        setSignature('');
    };

    const handleChange = (index: number, field: keyof EmailConfig, value: string | boolean) => {
        const updated = [...configs];
        if (field === 'secure') {
            updated[index][field] = value === 'true';
        } else {
            updated[index][field] = value as any;
        }
        setConfigs(updated);
    };

    const addMore = () => {
        setConfigs([
            ...configs,
            {
                name: '',
                email: '',
                password: '',
                host: '',
                secure: true,
                provider: '',
            },
        ]);
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log(formData);
        const values = Object.fromEntries(formData.entries());
        const finalValues = {
            ...values,
            imgurl: Images,
            signature: signature,
            subscription: {
                plan: 'Pro',
                status: 'Active',
            },
            emailAccounts: configs,
        };
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/addnewcompany`, finalValues);
            showAlert2(15, res.data.message);
            e.target.reset();
            setConfigs([
                {
                    name: '',
                    email: '',
                    password: '',
                    host: '',
                    secure: true,
                    provider: '',
                },
            ]);
            setImages('');
            setSignature('');
        } catch (err: any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
        console.log('Form Data:', finalValues);
    };
    return (
        <div>
            <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Company</span>
                </li>
            </ul>

            <div className="pt-5">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="actionName">Company Name:</label>
                        <input name="companyName" id="actionName" type="text" placeholder="Enter Company Name" className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="actionEmail">Admin Email:</label>
                        <div className="flex flex-1">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                @
                            </div>
                            <input id="actionEmail" name="adminEmail" type="email" placeholder="" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label>Address:</label>
                            <textarea name="address" placeholder="Address" className="form-input" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Upload Company Logo:</label>
                            <label className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm cursor-pointer w-fit">
                                <FaImages className="h-3 w-3 mr-1" />
                                <span>{loading ? 'Uploading...' : 'Upload Logo'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
                            </label>

                            {Images && (
                                <div className="relative mt-3 w-fit">
                                    <img src={Images} alt="Logo" className="w-24 h-24 object-cover rounded-md" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Upload Company Signature:</label>
                            <label className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm cursor-pointer w-fit">
                                <FaImages className="h-3 w-3 mr-1" />
                                <span>{loading ? 'Uploading...' : 'Upload Signature'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadSignature} disabled={loading} />
                            </label>

                            {signature && (
                                <div className="relative mt-3 w-fit">
                                    <img src={signature} alt="Logo" className="w-24 h-24 object-cover rounded-md" />
                                    <button type="button" onClick={handleRemoveSignature} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-md p-5 pb-8">
                        <h1 className="font-semibold text-center pb-2 text-lg dark:text-white-light">Bank Details</h1>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label>Bank Name</label>
                                <input type="text" placeholder="Bank Name" className="form-input" name="bankName" />
                            </div>
                            <div>
                                <label>Account Number</label>
                                <input type="text" placeholder="Account Number" className="form-input" name="accountNumber" />
                            </div>
                            <div>
                                <label>IFSC Code</label>
                                <input type="text" placeholder="IFSC Code" className="form-input" name="ifscCode" />
                            </div>
                            <div>
                                <label>Upi</label>
                                <input type="text" placeholder="Upi" className="form-input" name="upi" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 font-semibold mb-2>
                            Add Company Configured Mails
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {configs.map((config, index) => (
                        <div key={index} className="bg-white border rounded-lg shadow p-4">
                            <button >X</button>
                            <h3 className="text-lg font-semibold text-blue-600 mb-4">Email #{index + 1}</h3>

                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" value={config.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className="mt-1 block form-input shadow-sm " />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" value={config.email} onChange={(e) => handleChange(index, 'email', e.target.value)} className="mt-1 block form-input shadow-sm " />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input type="text" value={config.password} onChange={(e) => handleChange(index, 'password', e.target.value)} className="mt-1 block form-input shadow-sm " />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Host</label>
                                    {/* <input
                                        type="text"
                                        value={config.host}
                                        onChange={(e) => handleChange(index, 'host', e.target.value)}
                                        className="mt-1 block form-input shadow-sm "
                                    /> */}
                                    <select name="host" id="host" value={config.host} onChange={(e) => handleChange(index, 'host', e.target.value)} className="mt-1 block form-select shadow-sm w-full">
                                        <option value="">Select SMTP Provider</option>
                                        <option value="smtp.gmail.com">Gmail</option>
                                        <option value="smtp.zoho.com">Zoho Mail</option>
                                        <option value="smtp.office365.com">Outlook / Office365</option>
                                        <option value="smtp.mail.yahoo.com">Yahoo Mail</option>
                                        <option value="smtp.mail.me.com">iCloud Mail</option>
                                        <option value="smtp.yandex.com">Yandex Mail</option>
                                        <option value="smtp.fastmail.com">FastMail</option>
                                        <option value="smtp.mailgun.org">Mailgun</option>
                                        <option value="smtp.sendgrid.net">SendGrid</option>
                                        <option value="smtp.postmarkapp.com">Postmark</option>
                                        <option value="mail.privateemail.com">Namecheap Private Email</option>
                                        <option value="mail.gandi.net">Gandi Mail</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Secure</label>
                                    <select value={config.secure ? 'true' : 'false'} onChange={(e) => handleChange(index, 'secure', e.target.value)} className="mt-1 block form-select shadow-sm ">
                                        <option value="">Select Security Type</option>
                                        <option value="true">Secure (SSL) — Port 465</option>
                                        <option value="false">Not Secure (TLS/STARTTLS) — Port 587</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                                    {/* <input
                                        type="text"
                                        value={config.provider}
                                        onChange={(e) => handleChange(index, 'provider', e.target.value)}
                                        className="mt-1 block form-input shadow-sm "
                                    /> */}
                                    <select
                                        value={config.provider}
                                        name="provider"
                                        id="provider"
                                        onChange={(e) => handleChange(index, 'provider', e.target.value)}
                                        className="mt-1 block form-input shadow-sm "
                                    >
                                        <option value="">Select Email Provider</option>
                                        <option value="gmail">Gmail</option>
                                        <option value="zoho">Zoho Mail</option>
                                        <option value="outlook">Outlook / Office365</option>
                                        <option value="yahoo">Yahoo Mail</option>
                                        <option value="icloud">iCloud Mail</option>
                                        <option value="yandex">Yandex Mail</option>
                                        <option value="fastmail">FastMail</option>
                                        <option value="mailgun">Mailgun</option>
                                        <option value="sendgrid">SendGrid</option>
                                        <option value="postmark">Postmark</option>
                                        <option value="namecheap">Namecheap Private Email</option>
                                        <option value="gandi">Gandi Mail</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                        </div>

                        <button type="button" onClick={addMore} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
                            Add More
                        </button>
                        {/* <label htmlFor="actionWeb">Emails:</label>
                            <input id="actionWeb" type="text" placeholder="https://" className="form-input" /> */}
                    </div>
                    <div>
                        <label htmlFor="actionPassword">Password:</label>
                        <input name="password" id="actionPassword" type="password" placeholder="Enter Password" className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="actionCpass">Confirm Password:</label>
                        <input id="actionCpass" type="password" placeholder="Enter Confirm Password" className="form-input" />
                    </div>
                    <button type="submit" className="btn btn-primary !mt-6">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Company;
