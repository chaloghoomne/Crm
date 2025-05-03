import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { followUp, Lead } from '../../types/types';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import IconSend from '../../components/Icon/IconSend';
import IconX from '../../components/Icon/IconX';
import { set } from 'lodash';
import Swal from 'sweetalert2';

const FollowUp = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const [followUpWindow, setFollowUpWindow] = useState(false);
    const [selectedLead, setSelectedLead] = useState('');
    const [historyWindow, setHistoryWindow] = useState(false);
    const [historyLead, setHistoryLead] = useState('');
    const [followups, setFollowUps] = useState<followUp[]>([]);

    // const serviceType = [{'visa':}]
    // console.log(companyId)

    const handleWhatsapp = (number: string) => {
        const message = 'Hello, we are currently working on your application and will get back to you with a response soon.';
        const url = `https://api.whatsapp.com/send?phone=+91${number}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

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

    const handleFollowUpSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        const finalValues = {
            ...values,
            leadID: selectedLead,
        };
        console.log(values);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/saveFollowUp`, finalValues);
            console.log(res);
            showAlert2(15, res.data.message);
            setFollowUpWindow(false);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const filter = () => {
            const followUps = leads.find((lead) => lead._id === historyLead);
            console.log(followUps?.followUp);
            setFollowUps(followUps?.followUp ?? []);
        };
        filter();
    }, [historyLead]);

    useEffect(() => {
        const fetchLeads = async () => {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/getLeadsPaged`, {
                companyId,
                selectedTab,
                limit: 10,
                page,
            });
            // console.log(response.data)
            const { data, totalCount } = response.data;
            setLeads(data);
            // console.log(totalCount)
            setTotalPages(Math.ceil(totalCount / 10));
        };
        fetchLeads();
    }, [page, selectedTab]);

    return (
        <div>
            {/* <h1>Follow Up</h1> */}

            <div className="mb-5 flex flex-col sm:flex-row ">
                <Tab.Group>
                    <div className="mx-10 mb-5 sm:mb-0">
                        <Tab.List className="mt-3 flex flex-wrap justify-center border-b border-white-light dark:border-[#191e3a]">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <div className="flex-auto text-center !outline-none">
                                        <button
                                            onClick={() => setSelectedTab('all')}
                                            className={`${
                                                selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                            } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                        >
                                            All Query
                                        </button>
                                    </div>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab('Pending')}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        Pending
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab('InProgress')}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        In Process
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab('Cancelled')}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        Cancelled
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab('Confirmed')}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        Confirmed
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab('Complete')}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        Completed
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
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
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                        ${
                                                            lead.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : lead.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : lead.status === 'Complete'
                                                                ? 'bg-green-100 text-green-800'
                                                                : lead.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>

                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                    <button
                                                        className=" border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setHistoryWindow(true);
                                                            setHistoryLead(lead._id);
                                                        }}
                                                    >
                                                        History
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p>
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                                        ${
                                                                            lead.status === 'Pending'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : lead.status === 'InProgress'
                                                                                ? 'bg-blue-100 text-blue-800'
                                                                                : lead.status === 'Complete'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : lead.status === 'Cancelled'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>

                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p>
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                        ${
                                                            lead.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : lead.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : lead.status === 'Complete'
                                                                ? 'bg-green-100 text-green-800'
                                                                : lead.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>
                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p>
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                        ${
                                                            lead.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : lead.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : lead.status === 'Complete'
                                                                ? 'bg-green-100 text-green-800'
                                                                : lead.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>

                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p>
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                        ${
                                                            lead.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : lead.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : lead.status === 'Complete'
                                                                ? 'bg-green-100 text-green-800'
                                                                : lead.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>

                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="table-responsive mb-5">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Destination</th>
                                            <th>Agent/Client</th>
                                            <th>Query Date</th>
                                            <th>Status</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead: Lead) => (
                                            <tr key={lead._id}>
                                                <td>
                                                    <p>{lead._id}</p>
                                                </td>
                                                <td>
                                                    <p>{lead.serviceType.toUpperCase()}</p>
                                                    <p>
                                                        {new Date(lead?.fromDate || '').toLocaleDateString()} - {new Date(lead?.toDate || '').toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Adult:{lead.adult} Infant:{lead.infant} Child:{lead.child}
                                                    </p>
                                                </td>
                                                <td>
                                                    {lead.serviceType === 'visa' && <p>Visa Name:{lead.visaName}</p>}
                                                    {lead.serviceType === 'tour' && <p>Destination:{lead.departureDest + ' - ' + lead.arrivalDest}</p>}
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
                                                    <p>Date:{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    <p>Added By:{lead.leadBy}</p>
                                                </td>
                                                <td
                                                    className={`px-4 py-2 font-medium rounded
                                                        ${
                                                            lead.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : lead.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : lead.status === 'Complete'
                                                                ? 'bg-green-100 text-green-800'
                                                                : lead.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {lead.status}
                                                </td>

                                                <td className="flex justify-center flex-col gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleWhatsapp(lead.phoneNumber)}>
                                                        <IconSend />
                                                    </button>
                                                    <button
                                                        className=" border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            setFollowUpWindow(true);
                                                            setSelectedLead(lead._id);
                                                        }}
                                                    >
                                                        Follow Up
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex space-x-2 justify-center mt-6 items-center  ">
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Prev
                                        </button>
                                    </li>
                                    <span>
                                        {page} of {totalPages}
                                    </span>
                                    <li>
                                        <button
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            type="button"
                                            className="flex justify-center font-semibold px-3.5 py-2 rounded transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:bg-gray-400"
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
                {followUpWindow && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                        <div className="bg-white p-4 relative w-[25%]">
                            <h1>Follow Up Window</h1>
                            <button onClick={() => setFollowUpWindow(false)} className="absolute top-2 right-2 text-red-400">
                                <IconX />
                            </button>
                            <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                                <div>
                                    <label>Remarks</label>
                                    <textarea name="remarks" id="" placeholder="Enter Follow Up Remarks" className="form-textarea"></textarea>
                                </div>
                                <div>
                                    <label>Next Follow Up Date</label>
                                    <input type="date" name="nextDate" id="" className="form-input" />
                                </div>
                                <div>
                                    <div>
                                        <label>Current Status</label>
                                        <select name="status" id="" className="form-select">
                                            <option value="Pedning">Pending</option>
                                            <option value="InProgress">In Progress</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Complete">Complete</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center my-4">
                                        <input type="checkbox" name="reminder" id="" className="form-checkbox " />
                                        Set Reminder?
                                    </div>
                                    <div>
                                        <button type="submit" className="btn btn-primary w-full">
                                            Save Follow Up
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {historyWindow && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                        <div className="bg-white p-4 w-[30%] relative">
                            <button className='absolute top-2 right-2 ' onClick={() => setHistoryWindow(false)}><IconX /></button>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {followups.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.status}</td>
                                            <td>{item.remarks}</td>
                                            <td>{new Date(item?.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowUp;
