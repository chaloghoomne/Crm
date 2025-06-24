import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useBunnyUpload } from '../components/useBunny';
import { FaImages, FaTimes } from 'react-icons/fa';

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
    const [Images, setImages] = useState<String[]>([]);
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

        setImages([...Images, ...result.imageUrls]);
        console.log(result);
    };
    const handleRemoveImage = (index: number) => {
        Images.splice(index, 1);
        setImages([...Images]);
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Address:</label>
                            <textarea name="address" placeholder="Address" className="form-input" />
                        </div>
                        <div>
                            <label>Upload Company Logo:</label>
                            <label className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm cursor-pointer">
                                <FaImages className="h-3 w-3 mr-1" />
                                <span>{loading ? 'Uploading...' : 'Upload Images'}</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={(e: any) => handleUpload(e)} disabled={loading} />
                            </label>
                            {Images.length > 0 && (
                                <div className="flex flex-wrap mt-2">
                                    {Images.map((image: any, index: number) => (
                                        <div key={index} className="relative mr-2 mb-2">
                                            <img src={image} alt={`Image ${index}`} className="w-20 h-20 object-cover rounded-md" />
                                            <button type="button" className="absolute top-0 right-0 text-white bg-red-500 hover:bg-red-600 rounded-full p-1" onClick={() => handleRemoveImage(index)}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
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
                        <div className="flex flex-row">
                            {configs.map((config, index) => (
                                <div key={index} className="mb-6 p-4 border rounded-lg shadow">
                                    <h3 className="font-semibold mb-2">Email Configuration {index + 1}</h3>
                                    <div className="mb-2">
                                        <label className="block">Name:</label>
                                        <input type="text" value={config.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className="form-input w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block">Email:</label>
                                        <input type="email" value={config.email} onChange={(e) => handleChange(index, 'email', e.target.value)} className="form-input w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block">Password:</label>
                                        <input type="text" value={config.password} onChange={(e) => handleChange(index, 'password', e.target.value)} className="form-input w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block">Host:</label>
                                        <input type="text" value={config.host} onChange={(e) => handleChange(index, 'host', e.target.value)} className="form-input w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block">Secure:</label>
                                        <select value={config.secure ? 'true' : 'false'} onChange={(e) => handleChange(index, 'secure', e.target.value)} className="form-select w-full">
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block">Provider:</label>
                                        <input type="text" value={config.provider} onChange={(e) => handleChange(index, 'provider', e.target.value)} className="form-input w-full" />
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
