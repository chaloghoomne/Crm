import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import axios from 'axios';
import { emp, Lead, Operations as Ops, Supplier } from '../types/types';
import { assign, set } from 'lodash';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import Swal from 'sweetalert2';
import IconChatDot from '../components/Icon/IconChatDot';
import IconHorizontalDots from '../components/Icon/IconHorizontalDots';
import { Navigate, useNavigate } from 'react-router-dom';
import Itenaries from './Apps/Itenaries';
import IconX from '../components/Icon/IconX';
import IconDollarSign from '../components/Icon/IconDollarSign';
import { FaAccusoft, FaFireAlt, FaRupeeSign } from 'react-icons/fa';
import { GiMountains } from 'react-icons/gi';
import { SlCalender } from 'react-icons/sl';
import { IoLocation } from 'react-icons/io5';
import { MdOutlineSevereCold } from 'react-icons/md';
import { AiOutlineMail } from 'react-icons/ai';
import * as io from 'react-icons/io5';
import * as fa from 'react-icons/fa';
import * as md from 'react-icons/md';
import { FCPThresholds } from 'web-vitals';

const Operations = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [selectedEmpName, setSelectedEmpName] = useState('');
    const [lead, setLead] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [assignLeads, setAssignedLeads] = useState<Ops[]>([]);
    const [optionWindow, setOptionWindow] = useState(false);
    const [leadId, setLeadId] = useState('');
    const [itenaryWindow, setItenaryWindow] = useState('');
    const [supplierWindow, setSupplierWindow] = useState(false);
    const [hotelWindow, setHotelWindow] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [supplierName, setSupplierName] = useState('');
    const [selectSupplierWindow, setSelectSupllierWindow] = useState(false);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const role = useSelector((state: IRootState) => state.auth.role);
    const id = useSelector((state: IRootState) => state.auth.id);
    console.log(id);

    const handleAssign = async (leadId: string) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/assignLead`, { assignedEmpId: selectedEmp, leadId, assignedEmpName: selectedEmpName, companyId });
            showAlert2(15, res.data.message);
        } catch (err: any) {
            console.log(err.response.data);
            showAlert2(16, err.response.data.message);
        }
    };

    const handleSupplierSubmit = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const values = Object.fromEntries(data.entries());
        const finalValues = { ...values, companyId };
        // console.log(values);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/addSupplier`, {
                finalValues,
            });
            setSupplierWindow(false);
            showAlert2(15, res.data.message);
        } catch (err: any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
    };

    const handleHotelSubmit = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const values = Object.fromEntries(data.entries());
        const finalValues = { ...values, companyId };
        // console.log(values);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/addHotel`, {
                ...finalValues,
            });
            setHotelWindow(false);
            showAlert2(15, res.data.message);
        } catch (err: any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
    };

    const saveSupplierInfo = async (e: any) => {
        try {
            e.preventDefault();
            const data = new FormData(e.target);
            const value = Object.fromEntries(data.entries());
            const finalValues = { ...value, leadId, supplierName };
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/saveSupplierInfo`, {
                finalValues,
            });
            setSelectSupllierWindow(false);
            showAlert2(15, res.data.message);
        } catch (err: any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
    };

    useEffect(() => {
        const fetchLeads = async () => {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/getLeadsPaged`, {
                companyId,
                selectedTab: 'Complete',
                limit: 10,
                page,
            });
            console.log(response.data);
            const { data, totalCount } = response.data;
            setLead(data);
            // console.log(totalCount)
            setTotalPages(Math.ceil(totalCount / 10));
        };
        fetchLeads();
    }, [page]);

    const assignedLeads = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAssignedLeads`, {
                params: {
                    companyId: `${companyId}`,
                    empId: `${id}`,
                },
            });
            console.log(res.data);
            setAssignedLeads(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const getAllEmployees = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllEmp/${companyId}`);
            setEmployee(response.data);

            // console.log(response.data)
            // console.log(role)
        } catch (err: any) {
            console.log(err);
        }
    };
    const getSuppliers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getSuppliers/${companyId}`);
            setSupplierList(response.data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        getSuppliers();
    }, [selectSupplierWindow]);
    useEffect(() => {
        getAllEmployees();
        assignedLeads();
    }, []);

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

    return (
        <div onClick={() => setOptionWindow(false)}>
            <div className="mb-5 flex flex-col sm:flex-row h-screen w-full">
                <Tab.Group>
                    <div className="mx-10 mb-5 sm:mb-0">
                        <Tab.List className="mt-3 mb-5 grid grid-cols-4 gap-2 rtl:space-x-reverse sm:flex sm:flex-wrap sm:justify-center sm:space-x-3">
                            {role === 'admin' && (
                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <div className="flex-auto text-center !outline-none">
                                            <button
                                                className={`${
                                                    selected ? '!bg-success text-white !outline-none' : ''
                                                }  flex flex-col items-center justify-center rounded-lg bg-[#f1f2f3] p-7 py-3 hover:!bg-success hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                                            >
                                                Assign Employee
                                            </button>
                                        </div>
                                    )}
                                </Tab>
                            )}
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? '!bg-success text-white !outline-none' : ''
                                        }  flex flex-col items-center justify-center rounded-lg bg-[#f1f2f3] p-7 py-3 hover:!bg-success hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                                    >
                                        Assigned Leads
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? '!bg-success text-white !outline-none' : ''
                                        }  flex flex-col items-center justify-center rounded-lg bg-[#f1f2f3] p-7 py-3 hover:!bg-success hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                                    >
                                        Contact
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? '!bg-success text-white !outline-none' : ''
                                        }  flex flex-col items-center justify-center rounded-lg bg-[#f1f2f3] p-7 py-3 hover:!bg-success hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                                    >
                                        Settings
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                    </div>
                    {/* <div className='flex gap-2 my-3'>
                    <button className="btn btn-primary" onClick={() => setSupplierWindow(true)}>
                        Add Supplier
                    </button>
                    <button className="btn btn-primary" onClick={() => setHotelWindow(true)}>Add Hotel</button>
                    </div> */}
                    <Tab.Panels>
                        <Tab.Panel>
                            <div className="active">
                                <h4 className="mb-4 text-2xl font-semibold">We move your world!</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>
                                                <p className="flex items-center gap-1">
                                                    {' '}
                                                    <fa.FaInfo />
                                                    Title
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center gap-1">
                                                    <fa.FaSearchLocation />
                                                    Destination{' '}
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center gap-1">
                                                    <fa.FaUser />
                                                    Agent/Client
                                                </p>
                                            </th>
                                            <th>
                                                {' '}
                                                <p className="flex items-center gap-1">
                                                    <SlCalender />
                                                    Query Date
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center gap-1">
                                                    <fa.FaHourglass />
                                                    Status
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center gap-1">
                                                    <fa.FaUserPlus />
                                                    Assign Employee
                                                </p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lead.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p className="text-xs w-16 overflow-auto">{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p className="text-sm">
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.destination}</p>}
                                                    {/* <p>Destination:{lead.departureDest+" - "+lead.arrivalDest || lead.visaName }</p> */}
                                                    <p>Lead Source: {lead.leadSource}</p>
                                                    <p>
                                                        <b>{lead.priority}</b>
                                                    </p>
                                                </td>
                                                <td>
                                                    <p>Agent:{lead.agentName}</p>
                                                    <p>Name:{lead?.name}</p>
                                                    <p>Email: {lead?.email}</p>
                                                    <p>Mobile No. : {lead?.phoneNumber}</p>
                                                </td>
                                                <td>
                                                    <p className="flex items-center gap-1">
                                                        <SlCalender />
                                                        {new Date(lead.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {/* <p>Added By:{lead.assignedEmpName}</p> */}
                                                </td>
                                                <td>
                                                    <div className="bg-success bg-opacity-60 w-full h-full rounded-md text-white p-2">
                                                        <p>{lead.status}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-col  items-center gap-1">
                                                        <div>
                                                            <select
                                                                name="assignedOperator"
                                                                id=""
                                                                className="form-select"
                                                                onChange={(e) => {
                                                                    setSelectedEmp(e.target.value);
                                                                    setSelectedEmpName(e.target.selectedOptions[0].getAttribute('data-name') as string);
                                                                }}
                                                            >
                                                                <option value="#">Select Employee</option>
                                                                {employee &&
                                                                    employee.map((item: emp) => (
                                                                        <option key={item._id} value={item._id} data-name={item.name}>
                                                                            {item.name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <button className="btn btn-outline-primary" onClick={() => handleAssign(lead._id)}>
                                                                Assign
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="pt-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>
                                                <p className="flex items-center">
                                                    {' '}
                                                    <fa.FaInfo />
                                                    Title
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center">
                                                    <fa.FaSearchLocation />
                                                    Destination{' '}
                                                </p>
                                            </th>
                                            <th>
                                                <p className="flex items-center">
                                                    <fa.FaUser />
                                                    Agent/Client
                                                </p>
                                            </th>
                                            <th>
                                                {' '}
                                                <p className="flex items-center">
                                                    <SlCalender />
                                                    Query Date
                                                </p>
                                            </th>
                                            {lead.length > 0 && (
                                                <th>
                                                    {' '}
                                                    <p className="flex items-center">
                                                        <fa.FaRupeeSign />
                                                        Supplier/Price
                                                    </p>
                                                </th>
                                            )}
                                            <th>
                                                {' '}
                                                <p className="flex items-center">
                                                    <io.IoOptions />
                                                    Options
                                                </p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignLeads.map((lead: Ops) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p className="text-xs w-16 overflow-auto">{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p className="flex items-center gap-1">
                                                        <GiMountains />
                                                        {lead.leadId?.serviceType?.toUpperCase()}
                                                    </p>
                                                    <p className="text-sm flex items-center gap-1">
                                                        <SlCalender />
                                                        {new Date(lead?.leadId?.fromDate || '').toLocaleDateString()} - {new Date(lead?.leadId?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead?.leadId?.adult} Infant:{lead.leadId?.infant} Child:{lead.leadId?.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.leadId?.serviceType === 'visa' && <p>Visa Name:{lead.leadId?.visaName}</p>}
                                                    {lead.leadId?.serviceType === 'tour' && (
                                                        <p className="flex items-center gap-1">
                                                            <IoLocation />
                                                            Destination:{lead.leadId?.destination}
                                                        </p>
                                                    )}
                                                    {/* <p>Destination:{lead.departureDest+" - "+lead.arrivalDest || lead.visaName }</p> */}
                                                    <p>Lead Source: {lead.leadId?.leadSource}</p>
                                                    <p className="flex items-center gap-1">
                                                        {lead?.leadId?.priority === 'hot' && (
                                                            <b className="flex items-center gap-1">
                                                                <FaFireAlt color="red" />
                                                                {lead.leadId?.priority}
                                                            </b>
                                                        )}
                                                        {lead.leadId?.priority === 'cold' && (
                                                            <b className="flex items-center gap-1">
                                                                <MdOutlineSevereCold color="blue" />
                                                                {lead.leadId?.priority}
                                                            </b>
                                                        )}
                                                    </p>
                                                </td>
                                                <td>
                                                    <p>
                                                        <span className="font-bold">Agent: </span>
                                                        {lead.leadId?.agentName}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="font-bold">Name: </span>
                                                        {lead?.leadId?.name}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <AiOutlineMail />: {lead?.leadId?.email}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <io.IoCallOutline /> {lead?.leadId?.phoneNumber}
                                                    </p>
                                                </td>
                                                <td>
                                                    <p className="flex items-center gap-1">
                                                        <io.IoCalendarClearOutline />
                                                        {new Date(lead.leadId?.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {/* <p>Added By:{lead.assignedEmpName}</p> */}
                                                </td>
                                                <td>
                                                    <p className="flex items-center gap-1">
                                                        <fa.FaBuilding />
                                                        {lead?.supplierName && <span>{lead?.supplierName}</span>}
                                                    </p>

                                                    <p className="flex items-center">
                                                        <FaRupeeSign className="text-yellow-500 mr-1" />
                                                        Supplier &nbsp;
                                                        {lead?.supplierPrice ? <>{Number(lead?.supplierPrice).toLocaleString('en-IN')}</> : '-'}
                                                    </p>

                                                    <p className="flex items-center">
                                                        <FaRupeeSign className="text-yellow-500 mr-1" /> Offered &nbsp;
                                                        {lead.leadId?.price ? <>{Number(lead.leadId?.price).toLocaleString('en-IN')}</> : '-'}
                                                    </p>
                                                    <p>Status: {lead?.operationStatus}</p>
                                                </td>

                                                <td>
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e: any) => {
                                                                setOptionWindow(true);
                                                                setLeadId(lead._id);
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <IconHorizontalDots className="cursor-pointer size-8 ml-4" />
                                                        </button>

                                                        {optionWindow && leadId === lead._id && (
                                                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                                                <h2 className="text-sm font-semibold px-4 py-2 border-b">Options</h2>
                                                                <div className="flex flex-col">
                                                                    <button
                                                                        className="text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                                                        onClick={() => {
                                                                            setItenaryWindow(lead._id);
                                                                            setOptionWindow(false);
                                                                            // handle delete logic
                                                                        }}
                                                                    >
                                                                        Create Itenaries
                                                                    </button>
                                                                    <button
                                                                        className="text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                                                        onClick={() => {
                                                                            setSelectSupllierWindow(true);
                                                                        }}
                                                                    >
                                                                        Add Supplier Info
                                                                    </button>
                                                                    <button
                                                                        className="text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                                                        onClick={() => {
                                                                            // navigate('/create        itenary');
                                                                            // handle delete logic
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="pt-5">
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="rounded-tr-md rounded-br-md border border-l-2 border-white-light !border-l-primary bg-white p-5 text-black shadow-md ltr:pl-3.5 rtl:pr-3.5 dark:border-[#060818] dark:bg-[#060818]">
                                <div className="flex items-start">
                                    <p className="m-0 text-sm not-italic text-[#515365] dark:text-white-dark">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
                                    </p>
                                </div>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
                {itenaryWindow && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                        <Itenaries leadId={itenaryWindow} setItineraryWindow={setItenaryWindow} />
                    </div>
                )}

                {supplierWindow && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="relative w-full max-w-2xl bg-white rounded-md p-5">
                            <button className="absolute top-2 right-2" onClick={() => setSupplierWindow(false)}>
                                <IconX />
                            </button>
                            <h2>Add Supplier</h2>
                            <form onSubmit={handleSupplierSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Name</label>
                                        <input type="text" placeholder="Supplier Name" className="form-input" name="name" />
                                    </div>
                                    <div>
                                        <label>Contact Person Name</label>
                                        <input type="text" placeholder="Contact Person Name" className="form-input" name="contactPersonName" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Phone Number</label>
                                        <input type="text" placeholder="Phone Number" className="form-input" name="phoneNumber" />
                                    </div>
                                    <div>
                                        <label>Email</label>
                                        <input type="email" placeholder="Enter Email" className="form-input" name="email" />
                                    </div>
                                </div>
                                <div>
                                    <label>Service Provided</label>
                                    <select name="serviceType" id="" className="form-select">
                                        <option value="#">Select a Service</option>
                                        <option value="tour">Tour Package</option>
                                        <option value="visa">Visa</option>
                                        <option value="travelInsurance">Travel Insurance</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="flight">Flight</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button className="btn btn-secondary" type="submit">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {hotelWindow && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="relative w-full max-w-2xl bg-white rounded-md p-5">
                            <button className="absolute top-2 right-2" onClick={() => setHotelWindow(false)}>
                                <IconX />
                            </button>
                            <h2>Add Hotel</h2>
                            <form onSubmit={handleHotelSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Hotel Name</label>
                                        <input type="text" placeholder="Enter Hotel Name" className="form-input" name="name" />
                                    </div>
                                    <div>
                                        <label>Hotel Address</label>
                                        <input type="text" placeholder="Enter Hotel Address" className="form-input" name="location" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Phone Number</label>
                                        <input type="text" placeholder="Phone Number" className="form-input" name="phoneNumber" />
                                    </div>
                                    <div>
                                        <label>Email</label>
                                        <input type="email" placeholder="Enter Email" className="form-input" name="email" />
                                    </div>
                                </div>
                                <div>
                                    <label>Hotel Type</label>
                                    <select name="hotelType" id="" className="form-select">
                                        <option value="#">Select a Service</option>
                                        <option value="1Star">1 Star</option>
                                        <option value="2Star">2 Star</option>
                                        <option value="3Star">3 Star</option>
                                        <option value="4Star">4 Star</option>
                                        <option value="5Star">5 Star</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button className="btn btn-secondary" type="submit">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectSupplierWindow && (
                    <div className=" fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white relative rounded-md p-5">
                            <button className="absolute top-2 right-2" onClick={() => setSelectSupllierWindow(false)}>
                                <IconX />
                            </button>
                            <form onSubmit={saveSupplierInfo} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Supplier</label>
                                        <select name="supplierId" id="" className="form-select" onChange={(e) => setSupplierName(e.target.selectedOptions[0].getAttribute('data-name') as string)}>
                                            <option value="#">Select Supplier</option>
                                            {supplierList.map((supplier: Supplier) => (
                                                <option key={supplier._id} value={supplier._id} data-name={supplier.company}>
                                                    {supplier.company + '(' + supplier.serviceType + ')'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Price Decided</label>
                                        <input type="text" placeholder="Enter the Supplier Price" className="form-input" name="supplierPrice" />
                                    </div>
                                </div>
                                <div>
                                    <label>Status</label>
                                    <select
                                        name="operationStatus"
                                        id=""
                                        className="form-select"
                                        defaultValue={assignLeads?.find((lead: Ops) => lead?.leadId?._id === leadId)?.operationStatus ?? 'Pending'}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Complete">Complete</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="flex ">
                                    <button className="btn btn-secondary w-full" type="submit">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Operations;
