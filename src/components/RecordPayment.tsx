import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import { company, Invoice } from '../types/types';

import IconCashBanknotes from './Icon/IconCashBanknotes';
import { BanknoteArrowUpIcon, Building2, Edit2Icon } from 'lucide-react';

type PaymentMode = 'Cash' | 'Cheque' | 'Net Banking' | 'UPI';

const RecordPayment = ({ id, invoiceType, onClose }: { id: string; invoiceType: string; onClose: () => void }) => {
    const companyId = useSelector((state: IRootState) => state.auth.company_id);

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [company, setCompany] = useState<company | null>(null);
    const [amountPaid, setAmountPaid] = useState<number>();
    const [receiptNumber, setReceiptNumber] = useState('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [account, setAccount] = useState('');

    useEffect(() => {
        const fetchInvoiceAndCompany = async () => {
            try {
                setLoading(true);
                const [invoiceRes, companyRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BASE_URL}api/getSingleInvoice/${id}`),
                    axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`),
                ]);
                setInvoice(invoiceRes.data);
                setAmountPaid(invoiceRes.data.totalAmount - invoiceRes.data.amountPaid || 0);
                setCompany(companyRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Failed to fetch invoice/company details.');
            } finally {
                setLoading(false);
            }
        };

        if (id && companyId) {
            fetchInvoiceAndCompany();
        }
    }, [id, companyId]);

    const [balance, setBalance] = useState<number>();

    useEffect(() => {
        function generateReceiptFromTimestamp() {
            const timestamp = Date.now(); // e.g., 1718778472814
            // const random = Math.floor(Math.random() * 1000);
            setReceiptNumber(`RCPT-${timestamp}`);
        }
        generateReceiptFromTimestamp();
    }, []);

    useEffect(() => {
        if (invoice && company) {
            setBalance(invoice.totalAmount - invoice.amountPaid - (amountPaid ?? 0));
        }
    }, [amountPaid, invoice, company]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('clicked');
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/makeReceipt`, {
                invoiceId: id,
                amountPaid,
                paymentMode,
                note,
                total: invoice?.totalAmount,
                currency: invoice?.currency,
                buyerName: invoice?.receiverName,
                account,
                receiptNumber,
                receiptType: invoiceType,
                date: new Date().toISOString(),
                companyId,
            });
            alert('Payment recorded successfully.');
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to record payment.');
        }
    };

    const paymentModes: { label: string; icon: React.ReactNode; value: PaymentMode }[] = [
        { label: 'Cash', icon: <IconCashBanknotes className="w-4 h-4" />, value: 'Cash' },
        { label: 'Cheque', icon: <Edit2Icon className="w-4 h-4" />, value: 'Cheque' },
        { label: 'Net Banking', icon: <Building2 className="w-4 h-4" />, value: 'Net Banking' },
        { label: 'UPI', icon: <BanknoteArrowUpIcon className="w-4 h-4" />, value: 'UPI' },
    ];

    if (!id) return null;

    return (
        <div className="fixed h-full right-0 inset-0 z-50 flex bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative overflow-y-auto">
                <button className="absolute top-2 right-3 text-lg" onClick={onClose}>
                    ❌
                </button>
                <h2 className="text-xl font-semibold mb-4">Record Payment</h2>

                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : invoice ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Buyer + Receipt Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Buyer Name</label>
                                <input type="text" value={invoice.receiverName} readOnly className="form-input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Receipt Number</label>
                                <input type="text" value={receiptNumber} readOnly className="form-input w-full" />
                            </div>
                        </div>

                        {/* Amount + Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Payment Amount</label>
                                <input type="text" defaultValue={invoice.totalAmount - invoice.amountPaid} onChange={(e: any) => setAmountPaid(e.target.value)} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Date</label>
                                <input type="date" value={new Date().toISOString().split('T')[0]} readOnly className="form-input w-full" />
                            </div>
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Payment Mode</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {paymentModes.map((mode) => (
                                    <button
                                        type="button"
                                        key={mode.value}
                                        onClick={() => setPaymentMode(mode.value)}
                                        className={`btn-secondary btn-sm rounded-lg flex justify-center items-center gap-2 ${paymentMode === mode.value ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        {mode.icon}
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div>
                            <label className="block text-sm font-medium">Select Account</label>
                            {/* <select className="form-select w-full" value={account} onChange={(e) => setAccount(e.target.value)}>
                              <option value="" disabled>
                                  Select Account
                              </option>

                              {company?.accounts?.map((acc, index) => (
                                  <option key={index} value={acc.bankName + ' - ' + acc.accountNumber}>
                                      {acc.bankName} - {acc.accountNumber}
                                  </option>
                              ))}
                          </select> */}

                            <select className="form-select w-full" value={account} onChange={(e) => setAccount(e.target.value)}>
                                <option value={company?.bankName + ' - ' + company?.accountNumber}>
                                    {company?.bankName} - {company?.accountNumber}
                                </option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium">Note / Remark</label>
                            <textarea className="form-input w-full" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>

                        {/* Invoice Info */}
                        <div className="grid grid-cols-1 gap-2 border-t pt-4">
                            <p>
                                <strong>Paid Against Invoice:</strong> {amountPaid}
                            </p>
                            <p>
                                <strong>New Party Balance:</strong> ₹{balance}
                            </p>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            Submit Payment
                        </button>
                    </form>
                ) : (
                    <p>Invoice not found.</p>
                )}
            </div>
        </div>
    );
};

export default RecordPayment;
