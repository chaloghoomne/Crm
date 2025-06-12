import Select from 'react-select';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { IRootState } from '../../store';

const EditSupplier = ({ id, setSupplierEdit }: { id: string; setSupplierEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const [serviceType, setServiceType] = useState<string[] | string>('');
    const [supplier, setSupplier] = useState([]);
    const [formValues, setFormValues] = useState<any>({
        company: '',
        ownerName: '',
        phoneNumber: '',
        email: '',
        city: '',
        address: '',
        gstNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upi: '',
        description: '',
        Images: [],
    });
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

    const handleServiceTypeChange = (selected: any) => {
        if (Array.isArray(selected)) {
            setServiceType(selected.map((item) => item.value)); // returns array of strings
        } else {
            setServiceType(selected?.value || '');
        }
    };

    const handleSupplierSubmit = async (e: any) => {
        e.preventDefault();
        const finalValues = { ...formValues, companyId, serviceType };
        console.log(finalValues);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/updateSupplier/${id}`, {
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

    const getSupplier = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getSupplier/${id}`);
            setSupplier(res.data);
            const supplierData = res.data[0];
            setFormValues({
                company: supplierData.company || '',
                ownerName: supplierData.ownerName || '',
                phoneNumber: supplierData.phoneNumber || '',
                email: supplierData.email || '',
                city: supplierData.city || '',
                address: supplierData.address || '',
                gstNumber: supplierData.gstNumber || '',
                bankName: supplierData.bankName || '',
                accountNumber: supplierData.accountNumber || '',
                ifscCode: supplierData.ifscCode || '',
                upi: supplierData.upi || '',
                description: supplierData.description || '',
                Images: supplierData.Images || [],
            });
            setServiceType(supplierData.serviceType || []);
            console.log(res.data[0]);
        } catch (err: any) {
            console.log(err);
            showAlert2(16, err.response.data.message);
        }
    };
    useEffect(() => {
        getSupplier();
    }, []);
    return (
        <div>
            <h1>Edit Supplier</h1>
            <div className="mt-5">
                <div className="w-[90%]  bg-white rounded-md p-5">
                    <form onSubmit={handleSupplierSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Company name</label>
                                <input
                                    type="text"
                                    placeholder="Supplier Name"
                                    className="form-input"
                                    name="company"
                                    value={formValues.company}
                                    onChange={(e) => setFormValues({ ...formValues, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Owner Name</label>
                                <input
                                    type="text"
                                    placeholder="Contact Person Name"
                                    className="form-input"
                                    name="ownerName"
                                    value={formValues.ownerName}
                                    onChange={(e) => setFormValues({ ...formValues, ownerName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    className="form-input"
                                    name="phoneNumber"
                                    value={formValues.phoneNumber}
                                    onChange={(e) => setFormValues({ ...formValues, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="form-input"
                                    name="email"
                                    value={formValues.email}
                                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>City</label>
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="form-input"
                                    name="city"
                                    value={formValues.city}
                                    onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Address</label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    className="form-input"
                                    name="address"
                                    value={formValues.address}
                                    onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Service Provided</label>
                                <Select
                                    placeholder="Select an option"
                                    options={options5}
                                    isMulti
                                    isSearchable={false}
                                    className="basic-multi-select"
                                    onChange={handleServiceTypeChange}
                                    value={options5.filter((option) => serviceType.includes(option.value))}
                                />
                            </div>
                            <div>
                                <label>GST Number</label>
                                <input
                                    type="text"
                                    placeholder="GST Number"
                                    className="form-input"
                                    name="gstNumber"
                                    value={formValues.gstNumber}
                                    onChange={(e) => setFormValues({ ...formValues, gstNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-md p-5 pb-8">
                            <h1 className="font-semibold text-center pb-2 text-lg dark:text-white-light">Bank Details</h1>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label>Bank Name</label>
                                    <input
                                        type="text"
                                        placeholder="Bank Name"
                                        className="form-input"
                                        name="bankName"
                                        value={formValues.bankName}
                                        onChange={(e) => setFormValues({ ...formValues, bankName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        placeholder="Account Number"
                                        className="form-input"
                                        name="accountNumber"
                                        value={formValues.accountNumber}
                                        onChange={(e) => setFormValues({ ...formValues, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>IFSC Code</label>
                                    <input
                                        type="text"
                                        placeholder="IFSC Code"
                                        className="form-input"
                                        name="ifscCode"
                                        value={formValues.ifscCode}
                                        onChange={(e) => setFormValues({ ...formValues, ifscCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Upi</label>
                                    <input
                                        type="text"
                                        placeholder="Upi"
                                        className="form-input"
                                        name="upi"
                                        value={formValues.upi}
                                        onChange={(e) => setFormValues({ ...formValues, upi: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label>Description</label>
                            <textarea
                                className="form-input"
                                placeholder="Description"
                                name="description"
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div>
                            <label>Documents</label>
                            {formValues?.Images?.length  &&(
                                <div>
                                    {formValues?.Images?.map((image:any,index:number)=>{
                                        return(
                                            <div className="flex items-center mt-2" key={index}>
                                                <img src={image} alt="" className="w-10 h-10 object-cover rounded mr-2" />
                                                {/* <button onClick={() => handleRemoveImage(index)}>Remove</button> */}
                                            </div>
                                        )
                                    })}
                    
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button className="btn btn-outline-danger mr-2" onClick={() => setSupplierEdit(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-secondary" type="submit">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default EditSupplier;
