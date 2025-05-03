"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import type { Lead } from "../../types/types"
// import { X, AlertCircle, CheckCircle } from "lucide-react"
import IconXCircle from "../../components/Icon/IconXCircle"
import IconCircleCheck from "../../components/Icon/IconCircleCheck"
import { CrossIcon } from "react-select/dist/declarations/src/components/indicators"
import IconX from "../../components/Icon/IconX"

const LeadView = ({ leadID, setLeadView }: { leadID: string; setLeadView: (value: boolean) => void }) => {
  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  const saveStatus = async () => {
    try {
      setSaving(true)
      setError(null)

      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/setStatus`, {
        id: lead?._id,
        status: status,
      })

      if (res.status === 200) {
        setSaveSuccess(true)
        setTimeout(() => {
          setLeadView(false)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to update status. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllLeads/${leadID}`)

      if (res.data && res.data[0]) {
        setLead(res.data[0])
        setStatus(res.data[0].status || "pending")
      } else {
        setError("Lead not found")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load lead data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [leadID])

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/70" aria-modal="true" role="dialog">
      <div className="bg-white relative dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-white">Lead #{leadID}</h2>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center text-green-500 text-sm">
                <IconCircleCheck className="w-4 h-4 mr-1" />
                Saved successfully
              </div>
            )}
            <button
              className="btn btn-primary px-4 py-2 rounded-md disabled:opacity-50"
              onClick={saveStatus}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setLeadView(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <IconX className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-800 dark:text-gray-200">{lead?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-800 dark:text-gray-200 break-words">{lead?.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                  <p className="text-gray-800 dark:text-gray-200">{lead?.phoneNumber || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Service Specific Information */}
            {lead?.serviceType && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {lead.serviceType === "visa"
                    ? "Visa Details"
                    : lead.serviceType === "tour"
                      ? "Tour Details"
                      : lead.serviceType === "travelInsurance"
                        ? "Travel Insurance Details"
                        : lead.serviceType === "hotel"
                          ? "Hotel Details"
                          : lead.serviceType === "flight"
                            ? "Flight Details"
                            : "Service Details"}
                </h3>

                {/* Visa Details */}
                {lead?.serviceType === "visa" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Visa</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.visaName || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Validity</label>
                      <p className="text-gray-800 dark:text-gray-200">
                        {lead?.validity ? `${lead.validity} Days` : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Passport Number</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.passport || "N/A"}</p>
                    </div>
                  </div>
                )}

                {/* Tour Details */}
                {lead?.serviceType === "tour" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Departure Destination
                      </label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.departureDest || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Arrival Destination
                      </label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.arrivalDest || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.fromDate?.toString())}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.toDate?.toString())}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Adult</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.adult || "0"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Children</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.child || "0"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Infants</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.infant || "0"}</p>
                    </div>
                  </div>
                )}

                {/* Travel Insurance Details */}
                {lead?.serviceType === "travelInsurance" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.fromDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.toDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Insurance Amount</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.insuranceAmount || "N/A"}</p>
                    </div>
                  </div>
                )}

                {/* Hotel Details */}
                {lead?.serviceType === "hotel" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Check In Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.fromDate?.toString())}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Check Out Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.toDate?.toString())}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hotel Offered</label>
                      <p className="text-gray-800 dark:text-gray-200">{lead?.hotelCategory || "N/A"}</p>
                    </div>
                  </div>
                )}

                {/* Flight Details */}
                {lead?.serviceType === "flight" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Flight Type</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.fromDate) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Flight Date</label>
                      <p className="text-gray-800 dark:text-gray-200">{formatDate(lead?.toDate?.toString())}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lead Status Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lead Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Source</label>
                  <p className="text-gray-800 dark:text-gray-200">{lead?.leadSource || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
                  <p className="text-gray-800 dark:text-gray-200">{lead?.priority || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <select
                    name="status"
                    id="status"
                    value={status}
                    className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Lead status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</label>
                  <p className="text-gray-800 dark:text-gray-200">
                    {lead?.createdAt ? formatDate(lead.createdAt) : "N/A"}
                  </p>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Requirements</label>
                <div
                  className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md min-h-[100px]"
                  dangerouslySetInnerHTML={{ __html: lead?.requirements || "N/A" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadView
