import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Lead } from '../../types/types';
import IconX from '../../components/Icon/IconX';

const LeadView = ({ leadID, setLeadView }: { leadID: string, setLeadView: any }) => {

    const [lead, setLead] = useState<Lead | null>(null);
    const fetchData = async () => {
        try{
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllLeads/${leadID}`);
        console.log(res.data);
        setLead(res.data[0]);
        
        }catch(err){
            console.log(err);
        }
      }
      useEffect(() => {
        fetchData();
    }, [leadID]);

   

    console.log(lead);
    return (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center z-20 bg-black bg-opacity-70'>
        <div className='bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full'>
            <div className="flex items-center justify-between mb-5 border-b pb-4">
                <h5 className="font-semibold text-lg text-gray-800 dark:text-white">Lead #{leadID}</h5>
                <button
                    onClick={() => setLeadView(false)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition duration-200"
                >
                    <IconX/>
                </button>
            </div>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="" className="text-sm font-medium text-gray-600"> Visa</label>
                    <p className='text-gray-800'>{lead?.visaName}</p>
                </div>
                <div>
                    <label className='text-sm font-medium text-gray-600'>Entry Type</label>
                    <p className='text-gray-800'>{lead?.entryType}</p>
                </div>
                <div>
                    <label className=' text-sm font-medium text-gray-600'>Price</label>
                    <p className='text=gray-800'>{lead?.price}</p>
                </div>
                <div>
                    <label className='text-sm font-medium text-gray-600'>Validity</label>
                    <p className='text-gray-800'>{lead?.validity} Days</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-800">{lead?.name}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-800">{lead?.email}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-gray-800">{lead?.phoneNumber}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-gray-800">{lead?.gender}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Age Group</label>
                    <p className="text-gray-800">{lead?.ageGroup}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-gray-800">{lead?.dob}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Father's Name</label>
                    <p className="text-gray-800">{lead?.fathersName}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Mother's Name</label>
                    <p className="text-gray-800">{lead?.mothersName}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Passport Number</label>
                    <p className="text-gray-800">{lead?.passport}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Passport Issue Date</label>
                    <p className="text-gray-800">{lead?.passportIssueDate ? new Date(lead.passportIssueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Passport Expiry Date</label>
                    <p className="text-gray-800">{lead?.passportExpiryDate ? new Date(lead.passportExpiryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-800">{lead?.status}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-gray-800">{lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                
            </div>
        </div>
    </div>
    
    )
};

export default LeadView;