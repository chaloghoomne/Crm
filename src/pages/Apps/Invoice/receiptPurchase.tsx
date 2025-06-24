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
import type { company, Invoice, InvoiceItem, Receipt } from "../../../types/types"
import { FaOptinMonster, FaDownload, FaTimes } from "react-icons/fa"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import RecordPayment from "../../../components/RecordPayment"

interface Company {
  companyName: string
  address: string
  adminEmail: string
  accountNumber: string
  bankName: string
  ifscCode: string
  upi: string
}


const ReceiptPurchase = () => {
  const dispatch = useDispatch()
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(setPageTitle("Invoice List"))
  }, [dispatch])

  const companyId = useSelector((state: IRootState) => state.auth.company_id)
  const [items, setItems] = useState<Receipt[]>([])
  const [viewInvoice, setViewInvoice] = useState<string | null>(null)
  const [viewInvoiceData, setViewInvoiceData] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  const [company, setCompany] = useState<Company>({
      companyName: "Chalogoomne.com",
      address: "123 Business Street, City, State 12345",
      adminEmail: "b2b@chaloghoomne.com",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      upi: "",
    })

  const [page, setPage] = useState(1)
  const PAGE_SIZES = [10, 20, 30, 50, 100]
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])


  const [search, setSearch] = useState("")
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "receiverName",
    direction: "asc",
  })


  const filterData = (id: string | null) => {
    if (!id) {
      setViewInvoiceData(null)
      return
    }
    const data = items.find((d: Receipt) => d._id === id)
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
      pdf.save(`invoice-${viewInvoiceData.receiptNumber}.pdf`)
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

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllReceipts/${companyId}/${"purchase"}`)
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
      item.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
      item.receiptNumber?.toLowerCase().includes(search.toLowerCase()),
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
                    Name
                    {sortStatus.columnAccessor === "receiverName" && (
                      <span className="ml-1">{sortStatus.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th>Receipt Number</th>
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
                    Date
                    {sortStatus.columnAccessor === "dueDate" && (
                      <span className="ml-1">{sortStatus.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
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
                  paginatedItems.map((data: Receipt) => (
                    <tr key={data._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td>
                        <div className="whitespace-nowrap font-semibold">{data.buyerName}</div>
                        {/* <div className="text-xs text-gray-500">{data.receiptNumber}</div> */}
                      </td>
                      <td>
                        <div className="font-mono text-sm">{data.receiptNumber}</div>
                      </td>
                      <td>
                        <div className="whitespace-nowrap">
                          {new Date(data.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{formatCurrency(data.amountPaid,data.currency||"INR")}</div>
                      </td>
                      <td>
                          {data.paymentMode}
                          
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
                                {/* <button type="button" className="flex items-center gap-2 w-full">
                                  <IconEdit className="w-4 h-4" />
                                  Edit
                                </button> */}
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
            <h2 className="text-lg font-semibold">Invoice Preview</h2>
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
      className="bg-white p-8 max-w-2xl mx-auto shadow-lg"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white text-2xl font-bold mb-2">
            {company.companyName?.charAt(0) || "R"}
          </div>
          <h2 className="font-bold text-xl text-gray-800">{company.companyName}</h2>
        </div>
        <div className="text-right text-gray-700 space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RECEIPT</h1>
          <div><span className="font-semibold">Receipt #:</span> {viewInvoiceData.receiptNumber}</div>
          <div><span className="font-semibold">Address:</span> {company.address}</div>
          <h2 className="font-semibold">{company.adminEmail}</h2>
          <div><span className="font-semibold">Date:</span> {new Date(viewInvoiceData.date).toLocaleDateString("en-IN")}</div>
        </div>
      </div>

      {/* Biller + Payment Info */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Receipt Number</h3>
          <p className="text-gray-700">{viewInvoiceData.receiptNumber}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Date</h3>
          <p className="text-gray-700">{new Date(viewInvoiceData.date).toLocaleDateString()}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Payment To:</h3>
          <p className="text-gray-700">{viewInvoiceData.buyerName}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Payment Mode</h3>
          <p className="text-gray-700">{viewInvoiceData.paymentMode}</p>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="mb-6 border border-gray-200 rounded overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="text-left px-4 py-2 font-semibold">Description</th>
        <th className="text-right px-4 py-2 font-semibold">Invoice Total</th>
        <th className="text-right px-4 py-2 font-semibold">Paid Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t">
        <td className="px-4 py-3 text-gray-800">Paid Against Invoice</td>
        <td className="px-4 py-3 text-right text-gray-800 font-medium">
          {formatCurrency(viewInvoiceData.total, viewInvoiceData.currency || "INR")}
        </td>
        <td className="px-4 py-3 text-right text-gray-900 font-semibold">
          {formatCurrency(viewInvoiceData.amountPaid, viewInvoiceData.currency || "INR")}
        </td>
      </tr>
    </tbody>
  </table>
</div>


      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <p><span className="font-semibold">Pending Payment:</span> {viewInvoiceData.total-viewInvoiceData.amountPaid}</p>
        </div>
        <div>
          <p><span className="font-semibold">Paid Amount:</span> ₹{viewInvoiceData.amountPaid || "0.00"}</p>
        </div>
      </div>

      {/* Notes */}
      {viewInvoiceData.note && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-1 text-gray-800">Remarks</h4>
          <p className="text-gray-700">{viewInvoiceData.note}</p>
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

export default ReceiptPurchase;
