"use client"

import { useState, useEffect, useRef } from "react"
import { X, Download, Eye, Send, Save, Plus, Users, Package, Settings, FileText, Edit } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import axios from "axios"
import { useSelector } from "react-redux"
import IconEdit from "../../../components/Icon/IconEdit"
import IconTrash from "../../../components/Icon/IconTrash"
import Swal from "sweetalert2"
import { Supplier } from "../../../types/types"

// Unified Types
interface Product {
  id: string
  name: string
  description: string
  price: number
  // Additional fields for visa packages
  visaTypeHeading?: string
  processingTime?: string
  period?: string
  validity?: string
  entryType?: string
}

interface Client {
  _id: string
  name: string
  email: string
  address: string
  phone: string
  gstNumber?: string
}

interface InvoiceItem {
  id: number
  title: string
  description: string
  quantity: number
  discount:number
  rate: number
  priceAfterTax:number
  amount: number
  tax: number
}

interface Company {
  companyName: string
  address: string
  adminEmail: string
  accountNumber: string
  bankName: string
  ifscCode: string
  upi: string
  imgurl:string
}

interface InvoiceFormData {
  invoiceNumber: string
  invoiceLabel: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  receiverName: string
  receiverEmail: string
  receiverAddress: string
  receiverPhone: string
  invoiceType:string
  accountNumber: string
  bankName: string
  ifscCode: string
  upiId: string
  currency: string
  tax: number
  discount: number
  notes: string
  gstNumber: string
  clientType: string
}

interface IRootState {
  auth: {
    company_id: string
  }
}

// Constants
const CURRENCY_LIST = [
  "USD - US Dollar",
  "GBP - British Pound",
  "IDR - Indonesian Rupiah",
  "INR - Indian Rupee",
  "BRL - Brazilian Real",
  "EUR - Germany (Euro)",
  "TRY - Turkish Lira",
]

// Utility Functions
const normalizeProduct = (product: any): Product => {
  // Handle products from first database (res1)
  if (product.name) {
    return {
      id: product._id || product.id,
      name: product.name,
      description: product.description || "",
      price: product.price || 0,
    }
  }

  // Handle visa packages from second database (res2)
  return {
    id: product._id,
    name: product.visaTypeHeading || "Visa Package",
    description: [
      product.processingTime && `Processing: ${product.processingTime}`,
      product.period && `Period: ${product.period}`,
      product.validity && `Validity: ${product.validity}`,
      product.entryType && `Entry: ${product.entryType}`,
    ]
      .filter(Boolean)
      .join(" | "),
    price: product.price || 0,
    visaTypeHeading: product.visaTypeHeading,
    processingTime: product.processingTime,
    period: product.period,
    validity: product.validity,
    entryType: product.entryType,
  }
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

const InvoiceForm = ({ invoiceType }: { invoiceType: string }) => {
  const companyId = useSelector((state: IRootState) => state.auth.company_id)

  // State Management
  const [company, setCompany] = useState<Company>({
    companyName: "Chalogoomne.com",
    address: "123 Business Street, City, State 12345",
    adminEmail: "b2b@chaloghoomne.com",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    upi: "",
    imgurl:"",
  })

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "#8801",
    invoiceLabel: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    totalAmount:0,
    receiverName: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverPhone: "",
    accountNumber: "",
    bankName: "",
    invoiceType:"sales",
    ifscCode: "",
    upiId: "",
    currency: "USD - US Dollar",
    tax: 0,
    discount: 0,
    notes: "",
    gstNumber: "",
    clientType: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      title: "",
      description: "",
      discount:0,
      quantity: 1,
      rate: 0,
      priceAfterTax:0,
      amount: 0,
      tax: 0,
    },
  ])

  const [clientType, setClientType] = useState("B2B")
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // UI State
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [showProductPopup, setShowProductPopup] = useState(false)
  const [showBankDetailsEdit, setShowBankDetailsEdit] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [selectedClient, setSelectedClient] = useState<Supplier | null>(null)
  const [selectedProductForPopup, setSelectedProductForPopup] = useState<Product | null>(null)

  // Data State
  const [existingClients, setExistingClients] = useState<Supplier[]>([])
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [clientEditOpen, setClientEditOpen] = useState("")
  const [productEditOpen, setProductEditOpen] = useState("")

  // Product popup state
  const [productPopupData, setProductPopupData] = useState({
    // finalPrice:0,
    quantity: 1,
    tax: 0,
    description:"",
    discount:0,
  })

  const showAlert2 = async (type: number, mes: string) => {
    if (type === 15) {
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      })
      toast.fire({
        icon: "success",
        title: mes,
        padding: "10px 20px",
      })
    } else {
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      })
      toast.fire({
        icon: "error",
        title: mes,
        padding: "10px 20px",
      })
    }
  }

  const [filterData, setFilterData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
  })

  const [productFilterData, setProductFilterData] = useState({
    name: "",
    description: "",
    price: 0,
  })

  const [bankDetailsData, setBankDetailsData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upi: "",
  })

  const updateFilterData = (field: any, value: any) => {
    setFilterData((prev) => ({ ...prev, [field]: value }))
  }

  const updateProductFilterData = (field: any, value: any) => {
    setProductFilterData((prev) => ({ ...prev, [field]: value }))
  }

  const updateBankDetailsData = (field: any, value: any) => {
    setBankDetailsData((prev) => ({ ...prev, [field]: value }))
  }

  

  useEffect(() => {
  const fetchNextInvoiceNumber = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getInvoiceNumber/${companyId}`
      );
      const nextInvoiceNumber = res.data.invoiceNumber;
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: nextInvoiceNumber,
      }));
    } catch (err) {
      console.error("Error fetching invoice number:", err);
    }
  };

  if (companyId) fetchNextInvoiceNumber();
}, [companyId]);

  useEffect(() => {
    if (clientEditOpen) {
      const client = existingClients.find((client) => client._id === clientEditOpen)
      if (client) {
        setFilterData({
          name: client.company || "",
          email: client.email || "",
          phone: client.phoneNumber || "",
          address: client.address || "",
          gstNumber: client.gstNumber || "",
        })
      }
    } else {
      setFilterData({
        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
      })
    }
  }, [clientEditOpen, existingClients])

  useEffect(() => {
    if (productEditOpen) {
      const product = existingProducts.find((product) => product.id === productEditOpen)
      if (product) {
        setProductFilterData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
        })
      }
    } else {
      setProductFilterData({
        name: "",
        description: "",
        price: 0,
      })
    }
  }, [productEditOpen, existingProducts])

  useEffect(() => {
    setBankDetailsData({
      bankName: company.bankName || "",
      accountNumber: company.accountNumber || "",
      ifscCode: company.ifscCode || "",
      upi: company.upi || "",
    })
  }, [company])

  // Data Fetching Effects
  useEffect(() => {
    if (!companyId) return

    const fetchData = async () => {
      try {
        // Fetch clients, products, packages, and company details in parallel
        const [clientsRes, productsRes, packagesRes, companyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}api/getSuppliers/${companyId}`),
          axios.get(`${import.meta.env.VITE_BASE_URL}api/getProducts/${companyId}`),
          axios.get(`${import.meta.env.VITE_BASE_URL2}api/v1/getPackagesCrm`),
          axios.get(`${import.meta.env.VITE_BASE_URL}api/getcompanydetails/${companyId}`),
        ])

        // Set clients
        console.log(clientsRes.data)
        setExistingClients(Array.isArray(clientsRes.data) ? clientsRes.data : [])
        console.log(productsRes.data)
        // Normalize and combine products from both sources
        const products = Array.isArray(productsRes.data) ? productsRes.data.map(normalizeProduct) : []
        const packages = Array.isArray(packagesRes.data?.data) ? packagesRes.data.data.map(normalizeProduct) : []
        setExistingProducts([...products, ...packages])

        // Set company details
        setCompany(companyRes.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    fetchData()
  }, [companyId])

  // Calculate item amounts when quantity or rate changes
  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
    )
  }, [])

  // Item Management Functions
  const addItem = () => {
    const maxId = items.length ? Math.max(...items.map((item) => item.id)) : 0
    setItems([
      ...items,
      {
        id: maxId + 1,
        title: "",
        description: "",
        quantity: 1,
        discount:0,
        rate: 0,
        priceAfterTax:0,
        amount: 0,
        tax: 0,
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
        const updatedItem = { ...item, [field]: value };

        const quantity = Number(updatedItem.quantity) || 1;
        const rate = Number(updatedItem.rate) || 0;
        const tax = Number(updatedItem.tax) || 0;
        const discount = Number(updatedItem.discount) || 0;

        const baseAmount = quantity * rate;
        const taxAmount = (baseAmount * tax) / 100;
        const discountAmount = (baseAmount * discount) / 100;

        updatedItem.amount = baseAmount + taxAmount - discountAmount;

        return updatedItem;
      }
      return item;
    })
  );
};


  const updateFormData = (field: keyof InvoiceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Client Management
  const selectClient = (client: Supplier) => {
    setSelectedClient(client)
    setFormData({
      ...formData,
      receiverName: client.company,
      receiverEmail: client.email,
      receiverAddress: client.address,
      receiverPhone: client.phoneNumber,
      gstNumber: client.gstNumber || "",
    })
    setShowClientSelector(false)
  }

  const saveClient = async (clientData: Partial<Supplier>) => {
    try {
      const newClient = {
        ...clientData,
        id: Date.now().toString(),
        companyId,
        
      }

      await axios.post(`${import.meta.env.VITE_BASE_URL}api/addSupplier`, {finalValues:newClient})

      const savedClient = newClient as Supplier
      setSelectedClient(savedClient)
      setExistingClients([...existingClients, savedClient])
      setShowNewClientForm(false)
    } catch (error) {
      console.error("Failed to save client:", error)
    }
  }

  const addNewClient = () => {
    const newClient = {
      company: formData.receiverName,
      email: formData.receiverEmail,
      address: formData.receiverAddress,
      phoneNumber: formData.receiverPhone,
      gstNumber: formData.gstNumber,
    }
    saveClient(newClient)
  }

  const updateClient = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}api/updateClient/${clientEditOpen}`, filterData)

      // Update local state
      setExistingClients(
        existingClients.map((client) => (client._id === clientEditOpen ? { ...client, ...filterData } : client)),
      )

      setClientEditOpen("")
      showAlert2(15, "Client updated successfully")
    } catch (error) {
      console.error("Error updating client:", error)
      showAlert2(16, "Error updating client")
    }
  }

  // Product Management
  const selectProduct = (product: Product, itemId: number) => {
    setSelectedProductForPopup(product)
    setSelectedItemId(itemId)
    setProductPopupData({ quantity: 1, tax: 0 ,description:"",discount:0})
    setShowProductPopup(true)
    setShowProductSelector(false)
  }

  const confirmProductSelection = () => {
    if (selectedProductForPopup && selectedItemId) {
      updateItem(selectedItemId, "title", selectedProductForPopup.name)
      updateItem(selectedItemId, "description", productPopupData.description)
      updateItem(selectedItemId, "discount",productPopupData.discount)
      updateItem(selectedItemId, "rate", selectedProductForPopup.price)
      updateItem(selectedItemId, "quantity", productPopupData.quantity)
      updateItem(selectedItemId, "tax", productPopupData.tax)
    }
    setShowProductPopup(false)
    setSelectedProductForPopup(null)
    setSelectedItemId(null)
  }

  const saveProduct = async (productData: Partial<Product>) => {
    try {
      const newProduct = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
      }

      await axios.post(`${import.meta.env.VITE_BASE_URL}api/saveProduct/${companyId}`, newProduct)

      const savedProduct: Product = {
        id: Date.now().toString(),
        name: newProduct.name || "",
        description: newProduct.description || " ",
        price: newProduct.price || 0,
      }

      setExistingProducts([...existingProducts, savedProduct])
      setShowNewProductForm(false)
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  const updateProduct = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}api/updateProduct/${productEditOpen}`, productFilterData)

      // Update local state
      setExistingProducts(
        existingProducts.map((product) =>
          product.id === productEditOpen ? { ...product, ...productFilterData } : product,
        ),
      )

      setProductEditOpen("")
      showAlert2(15, "Product updated successfully")
    } catch (error) {
      console.error("Error updating product:", error)
      showAlert2(16, "Error updating product")
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}api/deleteProduct/${id}`)
      setExistingProducts(existingProducts.filter((product) => product.id !== id))
      showAlert2(15, "Product deleted successfully")
    } catch (error) {
      console.log("Error deleting product", error)
      showAlert2(16, "Error deleting product")
    }
  }

  const addNewProduct = (itemId: number) => {
    const item = items.find((i) => i.id === itemId)
    if (item && item.title) {
      saveProduct({
        name: item.title,
        description: item.description,
        price: item.rate,
      })
    }
  }

  const updateBankDetails = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}api/editCompanyDetails/${companyId}`, bankDetailsData)

      setCompany({ ...company, ...bankDetailsData })
      setShowBankDetailsEdit(false)
      showAlert2(15, "Bank details updated successfully")
    } catch (error) {
      console.error("Error updating bank details:", error)
      showAlert2(16, "Error updating bank details")
    }
  }

  // Calculation Functions
  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0)
  const calculateTaxAmount = () => (calculateSubtotal() * formData.tax) / 100
  const calculateDiscountAmount = () => (calculateSubtotal() * formData.discount) / 100
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount()
    const discountAmount = calculateDiscountAmount()
    formData.totalAmount = subtotal+taxAmount-discountAmount
    return subtotal + taxAmount - discountAmount
  }

  // API Functions
  const saveInvoice = async () => {
    setIsLoading(true)               
    try {
      const values = { ...formData, items, companyId,invoiceType,isInvoice:true}
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/createInvoice`, values)

      // Reset form
      setFormData({
        ...formData,
        invoiceNumber: "",
        invoiceLabel: "",
        receiverName: "",
        receiverEmail: "",
        receiverAddress: "",
        receiverPhone: "",
        notes: "",
        gstNumber: "",
        
      })

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
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert(`Invoice sent successfully to ${formData.receiverEmail}!`)
    } catch (error) {
      alert("Failed to send invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteClient = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}api/deleteClients/${id}`)
      setExistingClients(existingClients.filter((client) => client._id !== id))
      showAlert2(15, "Client deleted successfully")
    } catch (err) {
      console.log("Error deleting client", err)
      showAlert2(16, "Error deleting client")
    }
  }

  const downloadPDF = async () => {
    if (!previewRef.current) return

    setIsLoading(true)
    try {
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

      if (!wasPreviewVisible) {
        setShowPreview(false)
      }
    } catch (error) {
      alert("Failed to generate PDF")
    } finally {
      setIsLoading(false)
    }
  }

  // Invoice Preview Component
  const InvoicePreview = () => (
    <div
      ref={previewRef}
      className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1">
            <div className="w-32 h-16 mb-4 rounded-lg overflow-hidden shadow-sm">
              <img
                src={company.imgurl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="font-bold text-2xl text-gray-900">{company.companyName}</div>
              <div className="text-gray-600 leading-relaxed">{company.address}</div>
              <div className="text-gray-600">{company.adminEmail}</div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">TAX INVOICE</h1>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Invoice #:</span>
                <span className="font-mono text-gray-900">{formData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Date:</span>
                <span className="text-gray-900">{formData.invoiceDate}</span>
              </div>
              {invoiceType === "purchase" && 
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Due Date:</span>
                <span className="text-gray-900">{formData.dueDate}</span>
              </div>
}
            </div>
          </div>
        </div>

        {/* Bill To & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-4 text-gray-900 border-b border-gray-200 pb-2">Bill To:</h3>
            <div className="space-y-2">
              <div className="font-semibold text-lg text-gray-900">{formData.receiverName}</div>
              <div className="text-gray-700">{formData.receiverEmail}</div>
              <div className="text-gray-700 leading-relaxed">{formData.receiverAddress}</div>
              <div className="text-gray-700">{formData.receiverPhone}</div>
              {clientType === "B2B" && formData.gstNumber && (
                <div className="text-gray-700 font-medium">GST: {formData.gstNumber}</div>
              )}
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-4 text-gray-900 border-b border-blue-200 pb-2">Payment Details:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Bank:</span>
                <span className="text-gray-900">{company.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Account:</span>
                <span className="font-mono text-gray-900">{company.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">IFSC:</span>
                <span className="font-mono text-gray-900">{company.ifscCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">UPI:</span>
                <span className="font-mono text-gray-900">{company.upi}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10 overflow-x-auto">
          <div className="shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <th className="border-b border-gray-200 p-4 text-left font-bold text-gray-900">Item</th>
                  <th className="border-b border-gray-200 p-4 text-center font-bold text-gray-900 w-20">Qty</th>
                  <th className="border-b border-gray-200 p-4 text-right font-bold text-gray-900 w-28">Rate</th>
                  <th className="border-b border-gray-200 p-4 text-right font-bold text-gray-900 w-24">Tax (%)</th>
                  <th className="border-b border-gray-200 p-4 text-right font-bold text-gray-900 w-28">Discount (%)</th>
                  <th className="border-b border-gray-200 p-4 text-right font-bold text-gray-900 w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-b border-gray-100 p-4">
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-600 leading-relaxed">{item.description}</div>
                    </td>
                    <td className="border-b border-gray-100 p-4 text-center font-medium">{item.quantity}</td>
                    <td className="border-b border-gray-100 p-4 text-right font-mono">
                      {formatCurrency(item.rate, formData.currency)}
                    </td>
                    <td className="border-b border-gray-100 p-4 text-right font-medium">{item.tax}%</td>
                    <td className="border-b border-gray-100 p-4 text-right font-medium">{item.discount}%</td>
                    <td className="border-b border-gray-100 p-4 text-right font-bold text-gray-900">
                      {formatCurrency(item.amount, formData.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-96">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-mono text-gray-900">
                    {formatCurrency(calculateSubtotal(), formData.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Tax ({formData.tax}%):</span>
                  <span className="font-mono text-gray-900">
                    {formatCurrency(calculateTaxAmount(), formData.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Discount ({formData.discount}%):</span>
                  <span className="font-mono text-red-600">
                    -{formatCurrency(calculateDiscountAmount(), formData.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t-2 border-gray-300">
                  <span className="text-gray-900">Total:</span>
                  <span className="font-mono text-gray-900">{formatCurrency(calculateTotal(), formData.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {formData.notes && (
          <div className="border-t-2 border-gray-200 pt-8">
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Notes:
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-full">
      <div className="flex flex-col gap-6">
        {/* Main Invoice Form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
  {/* Company Info */}
              <div className="flex flex-col items-start gap-4">
                <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={company.imgurl}
                    alt="Company Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-lg">
                    {company.companyName}
                  </div>
                  <div className="text-sm text-gray-500">{company.adminEmail}</div>
                </div>
              </div>

              {/* Invoice Form Fields */}
              <div className="w-full lg:w-96 space-y-4">
                {/* Invoice # and Bank Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Invoice #</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => updateFormData("invoiceNumber", e.target.value)}
                      placeholder="#8801"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bank Details</label>
                    <button
                      onClick={() => setShowBankDetailsEdit(true)}
                      className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Bank Details
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => updateFormData("invoiceDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateFormData("dueDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>


            <hr className="border-gray-200 my-4" />

            {/* Client Type Selection */}
            <div className="mb-6">
              {/* Client Selection Bar */}
              <div className="bg-gray-50 border rounded-md p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">{selectedClient ? selectedClient.company : "Select or Add Client"}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowClientSelector(true)
                        setShowNewClientForm(false)
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewClientForm(true)
                        setShowClientSelector(false)
                      }}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                    >
                      Add New
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Client Display */}
              {selectedClient && (
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-blue-800">{selectedClient.company}</div>
                      <div className="text-sm text-blue-600">{selectedClient.email}</div>
                      <div className="text-sm text-blue-600">{selectedClient.phoneNumber}</div>
                      {selectedClient.gstNumber && (
                        <div className="text-sm text-blue-600">GST: {selectedClient.gstNumber}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowNewClientForm(true)
                        setShowClientSelector(false)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Client Selector */}
              {showClientSelector && (
                <div className="border rounded-md mb-4 bg-white shadow-sm">
                  <div className="p-3 border-b bg-gray-50">
                    <h4 className="font-medium">Select Existing Client</h4>
                  </div>
                  <div className="p-3">
                    <div className="max-h-60 overflow-auto">
                      {existingClients.map((client) => (
                        <div
                          key={client._id}
                          className="p-2 hover:bg-gray-50 cursor-pointer rounded border-b last:border-0"
                        >
                          <div className="font-medium" onClick={() => selectClient(client)}>
                            {client.company}
                          </div>
                          <div className="text-sm text-gray-600 justify-between flex">
                            <div>
                              <p>{client.email}</p>
                              <p>{client.phoneNumber}</p>
                              <p>{client.address}</p>
                              {client.gstNumber && <span className="text-gray-500">GST: {client.gstNumber}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => setClientEditOpen(client._id || "")}>
                                <IconEdit />
                              </button>
                              <button onClick={() => deleteClient(client._id || "")}>
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border-t bg-gray-50 text-right">
                    <button
                      type="button"
                      onClick={() => setShowClientSelector(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* New Client Form */}
              {showNewClientForm && (
                <div className="border rounded-md mb-4 bg-white shadow-sm">
                  <div className="p-3 border-b bg-gray-50">
                    <h4 className="font-medium">Add New Client</h4>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.receiverName}
                          onChange={(e) => updateFormData("receiverName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.receiverEmail}
                          onChange={(e) => updateFormData("receiverEmail", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={formData.receiverPhone}
                          onChange={(e) => updateFormData("receiverPhone", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Address</label>
                        <input
                          type="text"
                          value={formData.receiverAddress}
                          onChange={(e) => updateFormData("receiverAddress", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">GST Number</label>
                          <input
                            type="text"
                            value={formData.gstNumber}
                            onChange={(e) => updateFormData("gstNumber", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                    </div>
                  </div>
                  <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewClientForm(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addNewClient}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Add Client
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Settings */}
            <div className="mb-6">
              <div className="bg-gray-50 border rounded-md p-3 mb-4">
                <div className="flex items-center mb-3">
                  <Settings className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">Payment Settings</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateFormData("currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {CURRENCY_LIST.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tax (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.tax}
                      onChange={(e) => updateFormData("tax", Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => updateFormData("discount", Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="bg-gray-50 border rounded-md p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Invoice Items</span>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="border rounded-md mb-3 bg-white">
                  <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                    <h4 className="font-medium">Item #{index + 1}</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item.id)
                          setShowProductSelector(true)
                          setShowNewProductForm(false)
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                      >
                        Select Product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item.id)
                          setShowNewProductForm(true)
                          setShowProductSelector(false)
                        }}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                      >
                        Custom Item
                      </button>
                    </div>
                  </div>

                  {/* Product Selector */}
                  {showProductSelector && selectedItemId === item.id && (
                    <div className="border-b">
                      <div className="p-3">
                        <div className="max-h-48 overflow-auto">
                          {existingProducts.map((product) => (
                            <div
                              key={product.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer rounded border-b last:border-0"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1" onClick={() => selectProduct(product, item.id)}>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-600">{product.description}</div>
                                  <div className="font-medium">{formatCurrency(product.price, formData.currency)}</div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <button onClick={() => setProductEditOpen(product.id)}>
                                    <IconEdit />
                                  </button>
                                  <button onClick={() => deleteProduct(product.id)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 text-right">
                        <button
                          type="button"
                          onClick={() => setShowProductSelector(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Custom Item Form */}
                  {showNewProductForm && selectedItemId === item.id && (
                    <div className="border-b">
                      <div className="p-3">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Item Name</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateItem(item.id, "title", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Rate</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, "rate", Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Tax (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.tax}
                                onChange={(e) => updateItem(item.id, "tax", Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowNewProductForm(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => addNewProduct(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Save as Product
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Product Display */}
                  {item.title && (
                    <div className="p-3 grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <div className="font-medium mb-1 truncate">{item.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Rate</label>
                        <div className="text-sm font-medium">{formatCurrency(item.rate, formData.currency)}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Tax (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.tax}
                          onChange={(e) => updateItem(item.id, "tax", Number(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, "tax", Number(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-2 flex justify-between items-center">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Amount</label>
                          <div className="text-sm font-medium">{formatCurrency(item.rate * item.quantity +
                            (item.rate * item.quantity * item.tax) / 100 -
                            (item.rate * item.quantity * item.discount) / 100, formData.currency)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          disabled={items.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal(), formData.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax}%):</span>
                    <span>{formatCurrency(calculateTaxAmount(), formData.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount ({formData.discount}%):</span>
                    <span>-{formatCurrency(calculateDiscountAmount(), formData.currency)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal(), formData.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="bg-gray-50 border rounded-md p-3 mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">Additional Notes</span>
                </div>
              </div>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Actions Only */}
        <div className="xl:w-80 w-full">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h2 className="text-lg font-medium mb-4 pb-2 border-b">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={saveInvoice}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Invoice"}
              </button>
              <button
                onClick={sendInvoice}
                disabled={isLoading || !formData.receiverEmail}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Send Invoice"}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={downloadPDF}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Edit Modal */}
      {clientEditOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="border rounded-md bg-white shadow-lg w-[50%] max-h-[70%] overflow-auto">
            <div className="p-3 border-b bg-gray-50">
              <h4 className="font-medium">Edit Client</h4>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={filterData.name || ""}
                    onChange={(e) => updateFilterData("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={filterData.email}
                    onChange={(e) => updateFilterData("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={filterData.phone}
                    onChange={(e) => updateFilterData("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={filterData.address}
                    onChange={(e) => updateFilterData("address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={filterData.gstNumber}
                      onChange={(e) => updateFilterData("gstNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setClientEditOpen("")}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateClient}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {productEditOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="border rounded-md bg-white shadow-lg w-[50%] max-h-[70%] overflow-auto">
            <div className="p-3 border-b bg-gray-50">
              <h4 className="font-medium">Edit Product</h4>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productFilterData.name}
                    onChange={(e) => updateProductFilterData("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    value={productFilterData.description}
                    onChange={(e) => updateProductFilterData("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productFilterData.price}
                    onChange={(e) => updateProductFilterData("price", Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setProductEditOpen("")}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateProduct}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Edit Modal */}
      {showBankDetailsEdit && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="border rounded-md bg-white shadow-lg w-[50%] max-h-[70%] overflow-auto">
            <div className="p-3 border-b bg-gray-50">
              <h4 className="font-medium">Edit Bank Details</h4>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankDetailsData.bankName}
                    onChange={(e) => updateBankDetailsData("bankName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankDetailsData.accountNumber}
                    onChange={(e) => updateBankDetailsData("accountNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankDetailsData.ifscCode}
                    onChange={(e) => updateBankDetailsData("ifscCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={bankDetailsData.upi}
                    onChange={(e) => updateBankDetailsData("upi", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowBankDetailsEdit(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateBankDetails}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Update Bank Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Popup */}
      {showProductPopup && selectedProductForPopup && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="border rounded-md bg-white shadow-lg w-[40%] max-h-[60%] overflow-auto">
            <div className="p-3 border-b bg-gray-50">
              <h4 className="font-medium">Configure Product: {selectedProductForPopup.name}</h4>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="font-medium text-gray-800">{selectedProductForPopup.name}</div>
                <div className="text-sm text-gray-600">{selectedProductForPopup.description}</div>
                <div className="text-lg font-semibold text-blue-600 mt-2">
                  {formatCurrency(selectedProductForPopup.price, formData.currency)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={productPopupData.quantity}
                    onChange={(e) =>
                      setProductPopupData({
                        ...productPopupData,
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productPopupData.tax}
                    onChange={(e) =>
                      setProductPopupData({
                        ...productPopupData,
                        tax: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={productPopupData.description}
                    onChange={(e) =>
                      setProductPopupData({
                        ...productPopupData,
                        description: e.target.value || "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productPopupData.discount}
                    onChange={(e) =>
                      setProductPopupData({
                        ...productPopupData,
                        discount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(selectedProductForPopup.price * productPopupData.quantity, formData.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({productPopupData.tax}%):</span>
                  <span>
                    {formatCurrency(
                      (selectedProductForPopup.price * productPopupData.quantity * productPopupData.tax) / 100,
                      formData.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount ({productPopupData.discount}%):</span>
                  <span>
                    {formatCurrency(
                      (selectedProductForPopup.price * productPopupData.quantity * productPopupData.discount) / 100,
                      formData.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                  selectedProductForPopup.price * productPopupData.quantity +
                    (selectedProductForPopup.price * productPopupData.quantity * productPopupData.tax) / 100 -
                    (selectedProductForPopup.price * productPopupData.quantity * productPopupData.discount) / 100,
                  formData.currency,
                  )}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowProductPopup(false)
                  setSelectedProductForPopup(null)
                  setSelectedItemId(null)
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmProductSelection}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add to Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold">Invoice Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <InvoicePreview />
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3 z-10">
              <button
                onClick={downloadPDF}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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
    </div>
  )
}

export default InvoiceForm
