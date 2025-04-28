import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';


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
        company: "",
        admnEmail: "",
        email:[{}],
        password:"",
      }
      const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)))
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

      const handleChange = (
        index: number,
        field: keyof EmailConfig,
        value: string | boolean
      ) => {
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
      const handleSubmit=(e:any)=>{
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log(formData);
        const values = Object.fromEntries(formData.entries());
        const finalValues = {
            ...values,
            subscription:{
                plan:"Pro",
                status:"Active",
                
            },
            emailAccounts:configs
        }
        try{
            const res = axios.post(`${import.meta.env.VITE_BASE_URL}api/addnewcompany`,finalValues)
        }catch(err){
            console.log(err)
        }
        console.log("Form Data:", finalValues);
      }
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
                            <input name='companyName' id="actionName" type="text" placeholder="Enter Company Name" className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="actionEmail">Admin Email:</label>
                            <div className="flex flex-1">
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                    @
                                </div>
                                <input id="actionEmail"  name='adminEmail' type="email" placeholder="" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                            </div>
                        </div>
                        <div >
                            <h3 font-semibold mb-2>
                            Add Company Configured Mails
                            </h3>
                            <div className='flex flex-row'>
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
                                        <select value={config.secure?'true':'false'} onChange={(e) => handleChange(index, 'secure', e.target.value)} className="form-select w-full">
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
                            <input name='password' id="actionPassword" type="password" placeholder="Enter Password" className="form-input" />
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
