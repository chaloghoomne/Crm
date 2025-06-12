"use client"

import { useState, useEffect, useRef } from "react"
import { X, Download, Eye, Send, Save, Plus } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import axios from "axios"
import { useSelector } from "react-redux"
import { IRootState } from "../../../store"

interface InvoiceItem {
  id: number
  title: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Company {
  companyName: string
  address: string
  adminEmail: string
}

interface InvoiceFormData {
  invoiceNumber: string
  invoiceLabel: string
  invoiceDate: string
  dueDate: string
  receiverName: string
  receiverEmail: string
  receiverAddress: string
  receiverPhone: string
  accountNumber: string
  bankName: string
  ifscCode: string
  upiId: string
  country: string
  currency: string
  tax: number
  discount: number
  shippingCharge: number
  paymentMethod: string
  notes: string
}

const currencyList = [
  "USD - US Dollar",
  "GBP - British Pound",
  "IDR - Indonesian Rupiah",
  "INR - Indian Rupee",
  "BRL - Brazilian Real",
  "EUR - Germany (Euro)",
  "TRY - Turkish Lira",
]

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Sweden",
  "Denmark",
  "Norway",
  "New Zealand",
  "India",
  "China",
  "Japan",
]

const Add = () => {
  const [company,setCompany] = useState<Company>({
    companyName: "Chalogoomne.com",
    address: "123 Business Street, City, State 12345",
    adminEmail: "b2b@chaloghoomne.com",
  })

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "#8801",
    invoiceLabel: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    receiverName: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverPhone: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
    country: "",
    currency: "USD - US Dollar",
    tax: 0,
    discount: 0,
    shippingCharge: 0,
    paymentMethod: "",
    notes: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      title: "",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ])
  const companyId = useSelector((state:IRootState)=>state.auth.company_id)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Calculate amount for each item when quantity or rate changes
  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
    )
  }, [])

  useEffect(()=>{
    const fetchCompanyDetails = async () => {
    const res =await axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`);
    console.log(res.data);
    setCompany(res.data);
      
    }
    fetchCompanyDetails();

  },[])

  const addItem = () => {
    const maxId = items.length ? Math.max(...items.map((item) => item.id)) : 0
    setItems([
      ...items,
      {
        id: maxId + 1,
        title: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ])
  }

  const removeItem = (itemToRemove: InvoiceItem) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== itemToRemove.id))
    }
  }

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Recalculate amount when quantity or rate changes
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const updateFormData = (field: keyof InvoiceFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Calculation functions
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * formData.tax) / 100
  }

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * formData.discount) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount()
    const discountAmount = calculateDiscountAmount()
    return subtotal + taxAmount - discountAmount + formData.shippingCharge
  }

  const formatCurrency = (amount: number) => {
    const currencySymbol = formData.currency.includes("USD")
      ? "$"
      : formData.currency.includes("GBP")
        ? "£"
        : formData.currency.includes("EUR")
          ? "€"
          : formData.currency.includes("INR")
            ? "₹"
            : "$"
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  // API Functions - Simplified
  const saveInvoice = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000))
      const values = {...formData,items,companyId}
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/createInvoice`,values)
      console.log("Saving invoice:", { formData, items })
      alert("Invoice saved successfully!")
    } catch (error) {
      alert("Failed to save invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const sendInvoice = async () => {
    if (!formData.receiverEmail) {
      alert("Please enter receiver email address")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Sending invoice to:", formData.receiverEmail)
      alert(`Invoice sent successfully to ${formData.receiverEmail}!`)
    } catch (error) {
      alert("Failed to send invoice")
      console.log("Failed To send Invoice                          ")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!previewRef.current) return

    setIsLoading(true)
    try {
      // Show preview temporarily if not visible
      const wasPreviewVisible = showPreview
      if (!wasPreviewVisible) {
        setShowPreview(true)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`invoice-${formData.invoiceNumber}.pdf`)

      // Hide preview if it wasn't visible before
      if (!wasPreviewVisible) {
        setShowPreview(false)
      }
    } catch (error) {
      alert("Failed to generate PDF")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => saveInvoice()
  const handleSend = () => sendInvoice()
  const handlePreview = () => setShowPreview(true)
  const handleDownload = () => downloadPDF()

  // Invoice Preview Component
  const InvoicePreview = () => (
    <div ref={previewRef} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">
            {company.companyName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="font-bold text-xl text-gray-800">{company.companyName}</div>
            <div className="text-gray-600">{company.address}</div>
            <div className="text-gray-600">{company.adminEmail}</div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">INVOICE</h1>
          <div className="space-y-2 text-gray-700">
            <div>
              <span className="font-semibold">Invoice #:</span> {formData.invoiceNumber}
            </div>
            <div>
              <span className="font-semibold">Date:</span> {formData.invoiceDate}
            </div>
            <div>
              <span className="font-semibold">Due Date:</span> {formData.dueDate}
            </div>
          </div>
        </div>
      </div>

      {/* Bill To & Payment Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Bill To:</h3>
          <div className="space-y-1 text-gray-700">
            <div className="font-semibold text-gray-800">{formData.receiverName}</div>
            <div>{formData.receiverEmail}</div>
            <div>{formData.receiverAddress}</div>
            <div>{formData.receiverPhone}</div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Payment Details:</h3>
          <div className="space-y-1 text-gray-700">
            <div>
              <span className="font-semibold">Bank:</span> {formData.bankName}
            </div>
            <div>
              <span className="font-semibold">Account:</span> {formData.accountNumber}
            </div>
            <div>
              <span className="font-semibold">IFSC:</span> {formData.ifscCode}
            </div>
            <div>
              <span className="font-semibold">UPI:</span> {formData.upiId}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-semibold">Item</th>
              <th className="border border-gray-300 p-3 text-center font-semibold w-20">Qty</th>
              <th className="border border-gray-300 p-3 text-right font-semibold w-24">Rate</th>
              <th className="border border-gray-300 p-3 text-right font-semibold w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-3">
                  <div className="font-semibold text-gray-800">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </td>
                <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({formData.tax}%):</span>
              <span>{formatCurrency(calculateTaxAmount())}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Shipping:</span>
              <span>{formatCurrency(formData.shippingCharge)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Discount ({formData.discount}%):</span>
              <span>-{formatCurrency(calculateDiscountAmount())}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-bold text-lg mb-2 text-gray-800">Notes:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main Invoice Form */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row justify-between mb-8">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {company.companyName.charAt(0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-500">
                    <div className="font-semibold text-gray-800">{company.companyName}</div>
                    <div>{company.address}</div>
                    <div>{company.adminEmail}</div>
                  </div>
                </div>

                <div className="space-y-4 lg:w-80">
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-gray-700">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e: any) => updateFormData("invoiceNumber", e.target.value)}
                      placeholder="#8801"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-gray-700">Invoice Label</label>
                    <input
                      type="text"
                      value={formData.invoiceLabel}
                      onChange={(e: any) => updateFormData("invoiceLabel", e.target.value)}
                      placeholder="Enter Invoice Label"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-gray-700">Invoice Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e: any) => updateFormData("invoiceDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e: any) => updateFormData("dueDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-6" />

              {/* Bill To and Payment Details */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Bill To:</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Name</label>
                      <input
                        type="text"
                        value={formData.receiverName}
                        onChange={(e: any) => updateFormData("receiverName", e.target.value)}
                        placeholder="Enter Name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.receiverEmail}
                        onChange={(e: any) => updateFormData("receiverEmail", e.target.value)}
                        placeholder="Enter Email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Address</label>
                      <input
                        type="text"
                        value={formData.receiverAddress}
                        onChange={(e: any) => updateFormData("receiverAddress", e.target.value)}
                        placeholder="Enter Address"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={formData.receiverPhone}
                        onChange={(e: any) => updateFormData("receiverPhone", e.target.value)}
                        placeholder="Enter Phone"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Details:</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Account No.</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e: any) => updateFormData("accountNumber", e.target.value)}
                        placeholder="Account Number"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e: any) => updateFormData("bankName", e.target.value)}
                        placeholder="Bank Name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e: any) => updateFormData("ifscCode", e.target.value)}
                        placeholder="IFSC Code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">UPI ID</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e: any) => updateFormData("upiId", e.target.value)}
                        placeholder="UPI ID"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-gray-700">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e: any) => updateFormData("country", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-gray-700 border-b">Item</th>
                      <th className="px-4 py-2 text-left text-gray-700 border-b w-32">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-700 border-b w-32">Rate</th>
                      <th className="px-4 py-2 text-left text-gray-700 border-b w-32">Total</th>
                      <th className="px-4 py-2 text-left text-gray-700 border-b w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center font-semibold">
                          No Item Available
                        </td>
                      </tr>
                    )}
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e: any) => updateItem(item.id, "title", e.target.value)}
                              placeholder="Enter Item Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                            />
                            <textarea
                              value={item.description}
                              onChange={(e: any) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Enter Description"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e: any) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                            placeholder="Quantity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e: any) => updateItem(item.id, "rate", Number(e.target.value) || 0)}
                            placeholder="Rate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{formatCurrency(item.amount)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            disabled={items.length === 1}
                            className="p-1 text-gray-500 hover:text-red-500 disabled:opacity-50"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-start mt-6">
                  <button
                    onClick={addItem}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>

                  <div className="w-80 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({formData.tax}%):</span>
                      <span>{formatCurrency(calculateTaxAmount())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Rate:</span>
                      <span>{formatCurrency(formData.shippingCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount ({formData.discount}%):</span>
                      <span>-{formatCurrency(calculateDiscountAmount())}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block mb-2 text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: any) => updateFormData("notes", e.target.value)}
                  placeholder="Notes...."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:w-96 w-full space-y-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Currency & Settings</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="currency" className="block mb-2 text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e: any) => updateFormData("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencyList.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tax" className="block mb-2 text-gray-700">
                      Tax (%)
                    </label>
                    <input
                      id="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.tax}
                      onChange={(e: any) => updateFormData("tax", Number(e.target.value) || 0)}
                      placeholder="Tax"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="discount" className="block mb-2 text-gray-700">
                      Discount (%)
                    </label>
                    <input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e: any) => updateFormData("discount", Number(e.target.value) || 0)}
                      placeholder="Discount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shipping-charge" className="block mb-2 text-gray-700">
                    Shipping Charge
                  </label>
                  <input
                    id="shipping-charge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCharge}
                    onChange={(e: any) => updateFormData("shippingCharge", Number(e.target.value) || 0)}
                    placeholder="Shipping Charge"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="payment-method" className="block mb-2 text-gray-700">
                    Accept Payment Via
                  </label>
                  <select
                    id="payment-method"
                    value={formData.paymentMethod}
                    onChange={(e: any) => updateFormData("paymentMethod", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Payment</option>
                    <option value="bank">Bank Account</option>
                    <option value="paypal">PayPal</option>
                    <option value="upi">UPI Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Actions</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Invoice"}
                  </button>
                  <button
                    onClick={handlePreview}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isLoading ? "Generating..." : "Download PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold">Invoice Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <InvoicePreview />
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3 z-10">
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden preview for PDF generation */}
      <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
        <InvoicePreview />
      </div>
    </>
  )
}

export default Add
