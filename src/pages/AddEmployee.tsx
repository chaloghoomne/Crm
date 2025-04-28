import axios from 'axios';
import React, { useEffect, useState } from 'react';
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

const AddEmployee = () => {
    const [send, setSend] = useState(false);
    const [loading, setLoading] = useState(false);

    const [allEmp, setAllEmp] = useState([]);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);

    // console.log(
    //     'useSelector role:',
    //     useSelector((state: any) => state.auth?.role)
    // );

    const handleSubmit = async(e: any) => {
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
    const handleDelete = (id: any) => {
        const res = axios.get(`${import.meta.env.VITE_BASE_URL}api/deleteEmp/${id}`);
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
                title: 'New Employee Added successfully',
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
    }, [send]);
    

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
                                    <button type="submit" onClick={() => showAlert2(15)} className="btn btn-primary !mt-6">
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="pt-5">
                                {loading && (
                                    <p>
                                        <span className="animate-spin border-4 border-success border-l-transparent rounded-full w-12 h-12 inline-block align-middle m-auto mb-10"></span>
                                    </p>
                                )}
                                {!loading && !allEmp.length && <p>No Data Found</p>}
                                {allEmp.map((val: emp) => (
                                    <div className="flex justify-between items-center gap-2 flex-1" key={val._id}>
                                        <p>{val.name}</p>
                                        <p>{val.email}</p>
                                        <p>{val.password}</p>
                                        <div
                                            onClick={() => showAlert(10, val._id, handleDelete)}
                                            className="grid place-content-center w-14 h-14 border border-white-dark/20 dark:border-[#191e3a] rounded-md cursor-pointer"
                                        >
                                            <IconTrash className="w-6 h-6 hover:text-danger" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

export default AddEmployee;
