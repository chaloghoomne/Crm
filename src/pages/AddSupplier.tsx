import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '../components/Icon/IconX';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import Select from 'react-select';
import { IoOptions, IoPencilOutline, IoPencilSharp } from 'react-icons/io5';
import EditSupplier from './Apps/EditSupplier';
import { FaImage, FaImages, FaTimes } from 'react-icons/fa';
import { useBunnyUpload } from '../components/useBunny';

const AddSupplier = () => {
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const [serviceType, setServiceType] = useState<string[] | string>('');
    const [supplier, setSupplier] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [supplierEdit, setSupplierEdit] = useState(false);
    const [Images, setImages] = useState<String[]>([]);
    const {uploadFiles,loading} = useBunnyUpload();

    const handleUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const name = e.target.name;
         const result = await uploadFiles(files?.[0] ?? [], name); // Use optional chaining and default to an empty array if files is null

        setImages([...Images, ...result.imageUrls]);
        console.log(result);
    }

    const handleRemoveImage = (index: number) => {
        Images.splice(index, 1);
        setImages([...Images]);
    }

    const handleServiceTypeChange = (selected: any) => {
        if (Array.isArray(selected)) {
            setServiceType(selected.map((item) => item.value)); // returns array of strings
        } else {
            setServiceType(selected?.value || '');
        }
    };
    const handleEdit = (id: string) => {
        setSupplierEdit(true);
        setSupplierId(id);
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
                title: message,
                padding: '10px 20px',
            });
        }
    };

    const handleSupplierSubmit = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const values = Object.fromEntries(data.entries());
        const finalValues = { ...values, companyId, serviceType ,Images};
        console.log(finalValues);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/addSupplier`, {
                finalValues,
            });
            // setSupplierWindow(false);
            showAlert2(15, res.data.message);
            window.location.reload();
        } catch (err: any) {
            showAlert2(16, err.response.data.message);
            console.log(err);
        }
    };
    const options5 = [
        { value: 'tour', label: 'Tour Package' },
        { value: 'visa', label: 'Visa' },
        { value: 'travelInsurance', label: 'Travel Insurance' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'flight', label: 'Flight' },
    ];

    const getSuppliers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getSuppliers/${companyId}`);
            console.log(response.data);
            setSupplier(response.data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        getSuppliers();
    }, []);
    return (
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
                                {/* <svg>...</svg> */}
                                Add Suppliers
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
                                {/* <svg>...</svg> */}
                                Suppliers List
                            </button>
                        )}
                    </Tab>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <div className="mt-5">
                            <div className="w-full  bg-white rounded-md p-5">
                                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label>Company name</label>
                                            <input type="text" placeholder="Supplier Name" className="form-input" name="company" />
                                        </div>
                                        <div>
                                            <label>Owner Name</label>
                                            <input type="text" placeholder="Contact Person Name" className="form-input" name="ownerName" />
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label>City</label>
                                            <input type="text" placeholder="City" className="form-input" name="city" />
                                        </div>
                                        <div>
                                            <label>Address</label>
                                            <input type="text" placeholder="Address" className="form-input" name="address" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label>Service Provided</label>
                                            <Select placeholder="Select an option" options={options5} isMulti isSearchable={false} className="basic-multi-select" onChange={handleServiceTypeChange} />
                                        </div>
                                        <div>
                                            <label>GST Number</label>
                                            <input type="text" placeholder="GST Number" className="form-input" name="gstNumber" />
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
                                        <label>Description</label>
                                        <textarea className="form-input" placeholder="Description" name="description"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Images</label>
                                        <label className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm cursor-pointer">
                                            <FaImages className="h-3 w-3 mr-1" />
                                            <span>{loading ? 'Uploading...' : 'Upload Images'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={(e:any) => handleUpload (e)}
                                                disabled={loading}
                                            />
                                        </label>
                                        {Images.length > 0 && (
                                            <div className="flex flex-wrap mt-2">
                                                {Images.map((image: any, index: number) => (
                                                    <div key={index} className="relative mr-2 mb-2">
                                                        <img src={image} alt={`Image ${index}`} className="w-20 h-20 object-cover rounded-md" />
                                                        <button
                                                            type="button"
                                                            className="absolute top-0 right-0 text-white bg-red-500 hover:bg-red-600 rounded-full p-1"
                                                            onClick={() => handleRemoveImage(index)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}                                               
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button className="btn btn-secondary" type="submit">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div className="overflow-x-auto p-4">
                            <table className="min-w-full table-auto border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Supplier Name</th>
                                        <th className="px-4 py-2 text-left">Owner Name</th>
                                        <th className="px-4 py-2 text-left">Phone Number</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Address</th>
                                        <th className="px-4 py-2 text-left">Bank Details</th>
                                        <th className="px-4 py-2 text-center">
                                            <IoOptions className="inline-block text-lg" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplier.map((supplier: any) => (
                                        <tr key={supplier._id} className="border-t border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                {supplier.company} <span className="text-gray-500">({supplier.city})</span>
                                            </td>
                                            <td className="px-4 py-2">{supplier.ownerName}</td>
                                            <td className="px-4 py-2">{supplier.phoneNumber}</td>
                                            <td className="px-4 py-2">{supplier.email}</td>
                                            <td className="px-4 py-2 max-w-[200px] break-words">{supplier.address}</td>
                                            <td className="px-4 py-2 text-sm">
                                                <p>
                                                    <strong>Bank:</strong> {supplier.bankName}
                                                </p>
                                                <p>
                                                    <strong>Acc. No.:</strong> {supplier.accountNumber}
                                                </p>
                                                <p>
                                                    <strong>IFSC:</strong> {supplier.ifscCode}
                                                </p>
                                                <p>
                                                    <strong>UPI:</strong> {supplier.upi}
                                                </p>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={() => handleEdit(supplier._id)} className="text-blue-600 hover:text-blue-800" title="Edit Supplier">
                                                    <IoPencilSharp />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {supplierEdit && (
                <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                    <EditSupplier id={supplierId} setSupplierEdit={setSupplierEdit} />
                </div>
            )}
        </div>
    );
};

export default AddSupplier;
