import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import IconUserPlus from '../components/Icon/IconUserPlus';
import IconUsersGroup from '../components/Icon/IconUsersGroup';
import IconTrash from '../components/Icon/IconTrash';
import Swal from 'sweetalert2';
import { emp } from '../types/types';
import IconEdit from '../components/Icon/IconEdit';
import IconX from '../components/Icon/IconX';
import SweetAlert from './Components/SweetAlert';

const AddEmployee = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [send, setSend] = useState(false);
    const [loading, setLoading] = useState(false);

    const [allEmp, setAllEmp] = useState([]);
    const [editPopUp, setEditPopUp] = useState('');
    const [rolePopUp, setRolePopUp] = useState('');
    const [editAll,setEditAll] = useState('');
    const [passwordPopUp, setPasswordPopUp] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const popupRef = useRef<HTMLDivElement>(null);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const Role = useSelector((state:IRootState)=>state.auth.role);
    const [editForm,setEditForm] = useState<emp>();
    
    useEffect(()=>{
        const emp = allEmp.filter((d: any) => d._id === editAll);
        setEditForm(emp[0]);
    console.log(emp)
    },[editAll])

    // console.log(
    //     'useSelector role:',
    //     useSelector((state: any) => state.auth?.role)
    // );

    useEffect(()=>{
            if(Role !== 'admin') window.location.href = '/';
        })
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        // console.log(values);
        const finalValues = {
            ...values, 
            companyId: companyId,
        };
        // console.log(finalValues)
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/makeNewEmp`, finalValues);
            
            setSend(true);
            e.target.reset();
        } catch (err) {
            console.log(err);
        }
    };

    const handleRoleSubmit = async (type: string) => {
        try {
            if (type === 'role') {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/editEmpRole`, { data: { id: rolePopUp, role: role, type: type } });
                setRolePopUp('');
                console.log(res.data.message);
            showAlert2(15, res.data.message);
            }
            if (type === 'password') {
                if(confirmPassword !== password){
                    return showAlert2(16,'Password does not match');
                }
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/editEmpRole`, { data: { id: passwordPopUp, password: password, type: type } });
                setPasswordPopUp('');
                console.log(res.data.message);
                showAlert2(15, res.data.message);
            }
            if(type === 'complete'){
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/editEmpRole`, { data: { id: editAll, ...editForm, type: type } });
                setEditAll('');
                console.log(res.data.message);
                showAlert2(15, res.data.message);
            }
            setRefreshKey((prevKey) => prevKey + 1);

        } catch (err:any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
    };
    const handleDelete = (id: any) => {
        const res = axios.get(`${import.meta.env.VITE_BASE_URL}api/deleteEmp/${id}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef!.current && !popupRef.current.contains(event.target as Node)) {
                setEditPopUp('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = (id: any) => {
        const res = axios.get(`${import.meta.env.VITE_BASE_URL}api/editEmp/${id}`);
    };
    const showAlert = async (type: number, id: string, onDelete: (id: string) => void) => {
        if (type === 10) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: {
                    popup: 'sweet-alerts',
                },
            });

            if (result.isConfirmed) {
                // Run the delete function
                await onDelete(id);

                // Show success message
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your item has been deleted.',
                    icon: 'success',
                    customClass: { popup: 'sweet-alerts' },
                });
            }
        }
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
        } else {
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

    useEffect(() => {
        const getAllEmp = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllEmp/${companyId}`);
                setAllEmp(response.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        getAllEmp();
    }, [send,refreshKey]);

    // console.log(allEmp)
    // console.log(company_id)
    return (
        <div>
            <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Add Employee</span>
                </li>
            </ul>

            <div>
                <Tab.Group>
                    <Tab.List className="mt-3 flex flex-wrap gap-2">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`${
                                        selected ? 'bg-warning text-white !outline-none' : ''
                                    } before:inline-block -mb-[1px] flex items-center rounded p-3.5 py-2 hover:bg-warning hover:text-white`}
                                >
                                    <div className="grid place-content-center w-14 h-14 border border-white-dark/20 dark:border-[#191e3a] rounded-md">
                                        <IconUserPlus className="w-6 h-6" />
                                    </div>
                                    Add Employees
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
                                    <div className="grid place-content-center w-14 h-14 border border-white-dark/20 dark:border-[#191e3a] rounded-md">
                                        <IconUsersGroup className="w-6 h-6" />
                                    </div>
                                    All Employees
                                </button>
                            )}
                        </Tab>
                    </Tab.List>

                    <Tab.Panels>
                        <Tab.Panel>
                            <div>
                                <form className="space-y-5 pt-5" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="Employee">Employee Name:</label>
                                        <input type="text" name="name" id="name" placeholder="Enter Employee Name" className="form-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="actionEmail">Employee Email:</label>
                                        <div className="flex flex-1">
                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                @
                                            </div>
                                            <input id="actionEmail" name="email" type="email" placeholder="" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="actionPassword">Password:</label>
                                        <input name="password" id="actionPassword" type="password" placeholder="Enter Password" className="form-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="actionCpass">Confirm Password:</label>
                                        <input id="actionCpass" type="password" placeholder="Enter Confirm Password" className="form-input" />
                                    </div>
                                    <button type="submit" onClick={() => showAlert2(15, 'Employee Added Successfully')} className="btn btn-primary !mt-6">
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="pt-5">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <span className="animate-spin border-4 border-success border-l-transparent rounded-full w-12 h-12 inline-block"></span>
                                    </div>
                                ) : allEmp.length === 0 ? (
                                    <p className="text-center text-gray-500 py-6">No Data Found</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg shadow">
                                        <table className="min-w-full text-sm text-left table-auto">
                                            <thead className="bg-gray-100 dark:bg-[#1f2937] text-gray-700 dark:text-white border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Password</th>
                                                    <th className="px-4 py-3">Role</th>
                                                    <th className="px-4 py-3 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allEmp.map((val: emp) => (
                                                    <tr key={val._id} className="border-b hover:bg-gray-50 dark:hover:bg-[#2c3e50]">
                                                        <td className="px-4 py-3">{val.name}</td>
                                                        <td className="px-4 py-3">{val.email}</td>
                                                        <td className="px-4 py-3">{val.password}</td>
                                                        <td className="px-4 py-3">{val.role}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button onClick={() => setEditPopUp(val._id)}>
                                                                <IconEdit className="w-5 h-5 text-green-500" />
                                                            </button>
                                                        </td>
                                                        {editPopUp === val._id && (
                                                            <div ref={popupRef} className="absolute z-10 mt-2 bg-white border shadow-lg rounded-md p-4 w-60 right-0">
                                                                <div className="flex flex-col gap-2">
                                                                    <button onClick={() => setEditAll(val._id)}>Edit</button>
                                                                    <button onClick={() => setRolePopUp(val._id)}>Role Management</button>
                                                                    <button onClick={() => setPasswordPopUp(val._id)}>Change Password</button>
                                                                    <button onClick={() => showAlert(10, val._id, handleDelete)}>Delete</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
                {rolePopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="relative bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                            {/* Close button */}
                            <button onClick={() => setRolePopUp('')} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" title="Close">
                                <IconX className="w-5 h-5" />
                            </button>

                            {/* Title */}
                            <h2 className="text-xl font-semibold mb-4 text-center">Assign Role</h2>

                            {/* Select Role */}
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-sm font-medium mb-1">
                                    Choose a Role
                                </label>
                                <select
                                    name="role"
                                    id="role"
                                    onChange={(e: any) => setRole(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="sales">Sales</option>
                                    <option value="operations">Operations</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => handleRoleSubmit('role')}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {passwordPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="relative bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                            {/* Close button */}
                            <button onClick={() => setRolePopUp('')} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" title="Close">
                                <IconX className="w-5 h-5" />
                            </button>

                            {/* Title */}
                            <h2 className="text-xl font-semibold mb-4 text-center">Enter Password</h2>

                            {/* Select Role */}
                            <div className="mb-4">
                                <div>
                                    <label htmlFor="actionPassword">Password:</label>
                                    <input id="actionPassword" onChange={(e: any) => setPassword(e.target.value)} type="password" placeholder="Enter Password" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="actionCpass">Confirm Password:</label>
                                    <input id="actionCpass" onChange={(e: any) => setConfirmPassword(e.target.value)} type="password" placeholder="Enter Confirm Password" className="form-input" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => handleRoleSubmit('password')}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {editAll && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="relative bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                            <button onClick={() => setEditAll('')} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" title="Close">
                                <IconX className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-semibold mb-4 text-center">Edit Employee</h2>
                            <form className="space-y-5 pt-5" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="Employee">Employee Name:</label>
                                        <input type="text" value={editForm?.name} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value } as emp)} name="name" id="name" placeholder="Enter Employee Name" className="form-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="actionEmail">Employee Email:</label>
                                        <div className="flex flex-1">
                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                @
                                            </div>
                                            <input id="actionEmail" value={editForm?.email} onChange={(e: any) => setEditForm({ ...editForm, email: e.target.value } as emp)} name="email" type="email" placeholder="" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="actionPassword">Password:</label>
                                        <input name="password" value={editForm?.password} onChange={(e: any) => setEditForm({ ...editForm, password: e.target.value } as emp)} id="actionPassword" type="password" placeholder="Enter Password" className="form-input" />
                                    </div>
                                    <button type="submit" onClick={() => handleRoleSubmit("complete")} className="btn btn-primary !mt-6">
                                        Submit
                                    </button>
                                </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEmployee;
