"use client"
import type { DataTableSortStatus } from "mantine-datatable"
import { useState, useEffect, useRef } from "react"
import sortBy from "lodash/sortBy"
import { useDispatch, useSelector } from "react-redux"
import type { IRootState } from "../../../store"
import { setPageTitle } from "../../../store/themeConfigSlice"
import IconTrashLines from "../../../components/Icon/IconTrashLines"
import IconEdit from "../../../components/Icon/IconEdit"
import IconEye from "../../../components/Icon/IconEye"
import Dropdown from "../../../components/Dropdown"
import axios from "axios"
import type { company, Invoice, InvoiceItem } from "../../../types/types"
import { FaOptinMonster, FaDownload, FaTimes, FaWhatsapp } from "react-icons/fa"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import RecordPayment from "../../../components/RecordPayment"
import PurchaseOrderForm from "./PurchaseAdd"


const CreditNote = () => {
  const dispatch = useDispatch()
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(setPageTitle("Invoice List"))
  }, [dispatch])

  const companyId = useSelector((state: IRootState) => state.auth.company_id)
  const [items, setItems] = useState<Invoice[]>([])
  const [viewInvoice, setViewInvoice] = useState<string | null>(null)
  const [viewInvoiceData, setViewInvoiceData] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  const [company, setCompany] = useState<company>({
      companyName: "Chalogoomne.com",
      address: "123 Business Street, City, State 12345",
      adminEmail: "b2b@chaloghoomne.com",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      upi: "",
      imgurl:"",
    })

  const [page, setPage] = useState(1)
  const PAGE_SIZES = [10, 20, 30, 50, 100]
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [recordPayment, setRecordPayment] = useState("")

  const [search, setSearch] = useState("")
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "receiverName",
    direction: "asc",
  })

  const calculateSubtotal = () => {
  if (!viewInvoiceData?.items) return 0
  return viewInvoiceData.items.reduce((acc: { sum: number }, item: InvoiceItem) => ({ sum: acc.sum + (item.amount || 0) }), { sum: 0 }).sum
}

const sendWatsapp = async(phone:string,message:string)=>{
    const formattedPhone = phone
  const encodedMessage = encodeURIComponent(message);

  const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
  }

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal()
    const taxRate = Number.parseFloat(viewInvoiceData?.tax || "0")
    return (subtotal * taxRate) / 100
  }

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal()
    const discountRate = Number.parseFloat(viewInvoiceData?.discount || "0")
    return (subtotal * discountRate) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount()
    const discountAmount = calculateDiscountAmount()
    const shippingCharges = Number.parseFloat(viewInvoiceData?.shippingCharges || "0")
    return subtotal + taxAmount - discountAmount + shippingCharges
  }

  const handleStatusChange = async(id:any,status:string)=>{
    try{
      const res = await axios.put(`${import.meta.env.VITE_BASE_URL}api/updateInvoiceStatus/${id}`,{status});
      console.log(res.data);
      window.location.reload();   
    }
    catch(error){
        console.log(error)
    }
  }

  const filterData = (id: string | null) => {
    if (!id) {
      setViewInvoiceData(null)
      return
    }
    const data = items.find((d: Invoice) => d._id === id)
    setViewInvoiceData(data || null)
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current || !viewInvoiceData) return

    setDownloadingPDF(true)
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
      const imgY = 0

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`invoice-${viewInvoiceData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setDownloadingPDF(false)
    }
  }

  const deleteInvoice = async(id:string)=>{
    try{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/deleteInvoice/${id}`);
    console.log(res.data);
    window.location.reload();   
    }
    catch(error){
        console.log(error)
    }
  }

  const closeInvoiceView = () => {
    setViewInvoice(null)
    setViewInvoiceData(null)
  }

const formatCurrency = (amount: number, currency: string) => {
  const currencySymbol = currency.includes("USD")
    ? "$"
    : currency.includes("GBP")
      ? "£"
      : currency.includes("EUR")
        ? "€"
        : currency.includes("INR")
          ? "₹"
          : "$"
  return `${currencySymbol}${amount}`
}

  const getInvoiceTotal = (invoice: Invoice) => {
    if (!invoice.items || invoice.items.length === 0) return 0
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const taxAmount = (subtotal * Number.parseFloat(invoice.tax || "0")) / 100
    const discountAmount = (subtotal * Number.parseFloat(invoice.discount || "0")) / 100
    // const shippingCharges = Number.parseFloat(invoice.shippingCharges || "0")
    return subtotal + taxAmount - discountAmount 
  }

  useEffect(()=>{
      const fetchCompanyDetails = async () => {
      const res =await axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`);
      console.log(res.data);
      setCompany(res.data);
        
      }
      fetchCompanyDetails();
  
    },[])

  useEffect(() => {
    filterData(viewInvoice)
  }, [viewInvoice, items])

  const [purchase,setPurchase] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getInvoice/${companyId}/${"credit"}`)
        console.log(response.data)
        setItems(response.data)
      } catch (error) {
        console.error("Error fetching invoices:", error)
        alert("Error fetching invoices. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (companyId) {
      fetchInvoice()
    }
  }, [companyId])

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  const filteredItems = items.filter(
    (item) =>
      item.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      item.invoiceNumber?.toLowerCase().includes(search.toLowerCase()),
  )

  const sortedItems = sortBy(filteredItems, sortStatus.columnAccessor)
  if (sortStatus.direction === "desc") {
    sortedItems.reverse()
  }

  const paginatedItems = sortedItems.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b] h-screen">
      {
        purchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50 bg-opacity-70 p-4">
  {/* Modal Content */}
  <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl p-6">
    {/* Close Button */}
    <button
      className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
      onClick={() => setPurchase(false)}
      aria-label="Close"
    >
      ✕
    </button>

    {/* Form Component */}
    <PurchaseOrderForm invoiceType="credit" />
  </div>
</div>
 )
      }
      {!viewInvoice ? (
        <>
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-white-light dark:border-[#1b2e4b]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="form-input w-auto"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <button className="btn-primary  btn" onClick={()=>setPurchase(true)}>
                Add Invoice
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="form-select w-auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive mb-5 h-full">
            <table className="table-hover">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() =>
                      setSortStatus({
                        columnAccessor: "receiverName",
                        direction:
                          sortStatus.columnAccessor === "receiverName" && sortStatus.direction === "asc"
                            ? "desc"
                            : "asc",
                      })
                    }
                  >
                    Credit Note For
                    {sortStatus.columnAccessor === "receiverName" && (
                      <span className="ml-1">{sortStatus.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th>Credit Note #</th>
                  <th
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() =>
                      setSortStatus({
                        columnAccessor: "dueDate",
                        direction:
                          sortStatus.columnAccessor === "dueDate" && sortStatus.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    Credit Note Date
                    {sortStatus.columnAccessor === "dueDate" && (
                      <span className="ml-1">{sortStatus.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th>Amount</th>

                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      {search ? "No invoices found matching your search." : "No invoices found."}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((data: Invoice) => (
                    <tr key={data._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td>
                        <div className="whitespace-nowrap font-semibold">{data.receiverName}</div>
                        <div className="text-xs text-gray-500">{data.receiverEmail}</div>
                      </td>
                      <td>
                        <div className="font-mono text-sm">{data.invoiceNumber}</div>
                      </td>
                      <td>
                        <div className="whitespace-nowrap">
                          {new Date(data.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{formatCurrency(getInvoiceTotal(data),viewInvoiceData?.currency || "INR")}</div>
                      </td>
                     
                      <td className="text-center">
                        <div className="dropdown">
                          <Dropdown
                            offset={[0, 5]}
                            button={
                              <button className="btn btn-outline-primary btn-sm">
                                <FaOptinMonster className="w-4 h-4" />
                              </button>
                            }
                          >
                            <ul>
                              <li>
                                <button
                                  type="button"
                                  className="flex items-center gap-2 w-full"
                                  onClick={() => setViewInvoice(data?._id ?? null)}
                                >
                                  <IconEye className="w-4 h-4" />
                                  View
                                </button>
                              </li>
                              <li>
                                <button type="button" className="flex items-center gap-2 w-full" onClick={()=>sendWatsapp(data.receiverPhone,"This is a trial watsapp message")}>
                                  <FaWhatsapp className="w-4 h-4" />
                                  Watsapp
                                </button>
                              </li>
                              <li>
                                <button type="button" className="flex items-center gap-2 w-full text-danger" onClick={()=> deleteInvoice(data?._id ? data._id : "")}>
                                  <IconTrashLines className="w-4 h-4" />
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {
            recordPayment && <RecordPayment id={recordPayment} invoiceType="purchase" onClose={() => setRecordPayment("")} />
          }

          {/* Pagination */}
          {filteredItems.length > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white-light dark:border-[#1b2e4b]">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredItems.length)} of{" "}
                {filteredItems.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {page} of {Math.ceil(filteredItems.length / pageSize)}
                </span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(filteredItems.length / pageSize)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Invoice Preview */
        <div className="relative">
          {/* Header with controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold">Credit Note Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadPDF}   
                disabled={downloadingPDF}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <FaDownload className="w-4 h-4" />
                {downloadingPDF ? "Generating PDF..." : "Download PDF"}
              </button>
              <button onClick={closeInvoiceView} className="btn btn-outline-secondary btn-sm flex items-center gap-2">
                <FaTimes className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="overflow-auto max-h-[calc(100vh-120px)]">
            {viewInvoiceData && (
              <div
                ref={invoiceRef}
                className="bg-white p-8 max-w-4xl mx-auto shadow-lg"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="w-36 h-32 bg-blue-600 rounded-lg flex items-center justify-center ">
                      <img src={company.imgurl} alt="" className="h-full w-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-xl text-gray-800">{company.companyName}</div>
                      <div className=" text-gray-800">{company.adminEmail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">CREDIT NOTE</h1>
                    <div className="space-y-2 text-gray-700">
                      <div>
                        <span className="font-semibold">Credit Note #:</span> {viewInvoiceData.invoiceNumber}
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(viewInvoiceData.invoiceDate).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To & Payment Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Bill To:</h3>
                    <div className="space-y-1 text-gray-700">
                      <div className="font-semibold text-gray-800">{viewInvoiceData.receiverName}</div>
                      <div>{viewInvoiceData.receiverEmail}</div>
                      <div>{viewInvoiceData.receiverAddress}</div>
                      <div>{viewInvoiceData.receiverPhone}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Payment Details:</h3>
                    <div className="space-y-1 text-gray-700">
                      <div>
                        <span className="font-semibold">Bank:</span> {company.bankName}
                      </div>
                      <div>
                        <span className="font-semibold">Account:</span> {company.accountNumber}
                      </div>
                      <div>
                        <span className="font-semibold">IFSC:</span> {company.ifscCode}
                      </div>
                      <div>
                        <span className="font-semibold">UPI:</span> {company.upi}
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
              <th className="border border-gray-300 p-3 text-right font-semibold w-24">Tax (%)</th>
              <th className="border border-gray-300 p-3 text-right font-semibold w-24">Discount (%)</th>
              <th className="border border-gray-300 p-3 text-right font-semibold w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewInvoiceData.items?.map((item: InvoiceItem, index: number) => (
                        <tr key={item.id}>
                <td className="border border-gray-300 p-3">
                  <div className="font-semibold text-gray-800">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </td>
                <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-right">
                  {formatCurrency(item.rate, viewInvoiceData.currency)}
                </td>
                <td className="border border-gray-300 p-3 text-right">{item.tax}%</td>
                <td className="border border-gray-300 p-3 text-right">{item.discount}%</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">
                  {formatCurrency(item.amount, viewInvoiceData.currency)}
                </td>
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
                        <span>{formatCurrency(calculateSubtotal(),viewInvoiceData.currency)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Tax ({viewInvoiceData.tax || 0}%):</span>
                        <span>{formatCurrency(calculateTaxAmount(),viewInvoiceData.currency)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Shipping:</span>
                        <span>{formatCurrency(Number.parseFloat(viewInvoiceData.shippingCharges || "0"),viewInvoiceData.currency)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Discount ({viewInvoiceData.discount || 0}%):</span>
                        <span>-{formatCurrency(calculateDiscountAmount(),viewInvoiceData.currency)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal(),viewInvoiceData.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewInvoiceData.notes && (
                  <div className="border-t border-gray-300 pt-6">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Notes:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{viewInvoiceData.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreditNote;
