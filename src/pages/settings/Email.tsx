import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
// import { useBunnyUpload } from '../components/useBunny';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useBunnyUpload } from '../../components/useBunny';
// import { IRootState } from '../store';

type EmailConfig = {
    name: string;
    email: string;
    password: string;
    host: string;
    secure: boolean;
    provider: string;
};

const Email = () => {
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
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

    const role = useSelector((state: IRootState) => state.auth.role);
    useEffect(() => {
        if (role !== 'admin') window.location.href = '/';
    });

    useEffect(() => {
        const getcompanydetails = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`);
                setConfigs(res.data.emailAccounts || []);
            } catch (err) {
                console.error(err);
            }
        };
        getcompanydetails();
    }, []);

    const showAlert2 = async (type: number, message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type === 15 ? 'success' : 'warning',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            padding: '10px 20px',
        });
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
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/editEmail/${companyId}`, { emailAccounts: configs });
            showAlert2(15, res.data.message);
            window.location.reload();
        } catch (err: any) {
            showAlert2(16, err.response?.data?.message || 'Error updating email configuration.');
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Email Configuration</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {configs.map((config, index) => (
                        <div key={index} className="bg-white border rounded-lg shadow p-4">
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

                <div className="flex gap-4">
                    <button type="button" onClick={addMore} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700">
                        Add More
                    </button>
                    <button type="submit" className="px-5 py-2 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700">
                        Submit Emails
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Email;
