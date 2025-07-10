"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import Swal from "sweetalert2"
import { useDispatch, useSelector } from "react-redux"
import type { IRootState } from "../../store"
import { setPageTitle } from "../../store/themeConfigSlice"
import html2pdf from "html2pdf.js"
import axios from "axios"

// Define interfaces
interface EmailIdentity {
  _id: string
  name: string
  email: string
  password: string
  host: string
  provider: string
  secure?: boolean
}

interface Mail {
  _id: string
  to: string
  from: string
  subject: string
  body: string
  displayText: string
  sentAt: string
  isUnread?: boolean
  attachments?: any[]
}

interface EmailParams {
  from: any
  to: string
  cc: string
  title: string
  description: string
  displayDescription: string
}

const Mailbox = ({ to }: { to: string }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Mailbox"))
  }, [dispatch])

  const [mailList, setMailList] = useState<Mail[]>([])
  const [isShowMailMenu, setIsShowMailMenu] = useState<boolean>(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
  const [emailIdentities, setEmailIdentities] = useState<EmailIdentity[]>([])

  const company_id = useSelector((state: IRootState) => state.auth.company_id)
  const emp_id = useSelector((state: IRootState) => state.auth.id)

  const defaultParams: EmailParams = {
    from: null,
    to: to || "",
    cc: "",
    title: "",
    description: "",
    displayDescription: "",
  }
  const [params, setParams] = useState<EmailParams>(defaultParams)

  // Fetch email identities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_BASE_URL + `api/getcompanydetails/${company_id}`)
        setEmailIdentities(res.data.emailAccounts || [])
      } catch (error) {
        console.error("Error fetching email identities:", error)
      }
    }
    if (company_id) fetchData()
  }, [company_id])

  // Fetch emails
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_BASE_URL + "api/getallmails")
        setMailList(res.data || [])
      } catch (error) {
        console.error("Error fetching emails:", error)
      }
    }
    fetchEmails()
  }, [])

  const showTime = (item: Mail): string => {
    const displayDt = new Date(item.sentAt)
    const currentDt = new Date()
    const isToday = displayDt.toDateString() === currentDt.toDateString()

    if (isToday) {
      return displayDt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (displayDt.getFullYear() === currentDt.getFullYear()) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[displayDt.getMonth()]} ${String(displayDt.getDate()).padStart(2, "0")}`
    } else {
      return `${String(displayDt.getMonth() + 1).padStart(2, "0")}/${String(displayDt.getDate()).padStart(2, "0")}/${displayDt.getFullYear()}`
    }
  }

  const openMail = (type: string, item?: Mail) => {
    if (type === "add") {
      setParams({ ...defaultParams })
    } else if (type === "reply" && item) {
      setParams({
        ...defaultParams,
        to: item.from,
        title: "Re: " + item.subject,
        displayDescription: "Re: " + item.subject,
      })
    } else if (type === "forward" && item) {
      setParams({
        ...defaultParams,
        title: "Fwd: " + item.subject,
        displayDescription: "Fwd: " + item.subject,
      })
    }
    setIsEdit(true)
    setIsShowMailMenu(false)
  }

  const sendMail = async () => {
    try {
      if (!params.from || !params.from.fromEmail || !params.from.pass || !params.from.host) {
        showMessage("Please select a valid sender email.", "error")
        return
      }
      if (!params.to || !params.title || !params.description) {
        showMessage("To, Subject, and Description are required.", "error")
        return
      }

      const payload = {
        fromEmail: params.from.fromEmail,
        pass: params.from.pass,
        host: params.from.host,
        provider: params.from.provider,
        secure: params.from.secure,
        to: params.to,
        cc: params.cc || "",
        subject: params.title,
        companyId: company_id,
        sentBy: emp_id,
        body: params.description,
        displayText: params.displayDescription || "",
        attachments: [],
      }

      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/sendmail`, payload, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.data.success) {
        showMessage("Mail has been sent successfully.", "success")
        setIsEdit(false)
        setSelectedMail(null)
        setParams({ ...defaultParams })
      } else {
        showMessage(res.data.message || "Failed to send email.", "error")
      }
    } catch (error) {
      console.error("Send mail error:", error)
      showMessage("An unexpected error occurred while sending email.", "error")
    }
  }

  const handlePrintPDF = () => {
    const pdf = document.getElementById("printPdf")
    if (pdf && selectedMail) {
      html2pdf()
        .from(pdf)
        .save(`${selectedMail.subject || "mail"}.pdf`)
    }
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, id } = e.target
    if (name === "fromIndex") {
      try {
        setParams((prev) => ({ ...prev, from: JSON.parse(value) }))
      } catch (error) {
        console.error("Error parsing from value:", error)
      }
    } else {
      setParams((prev) => ({ ...prev, [id]: value }))
    }
  }

  const showMessage = (msg = "", type: "success" | "error" = "success") => {
    const toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: "toast" },
    })
    toast.fire({ icon: type, title: msg, padding: "10px 20px" })
  }

  return (
    <div className="flex gap-5 relative h-[calc(100vh-150px)]">
      {/* Overlay for mobile */}
      {isShowMailMenu && (
        <div
          className="overlay bg-black/60 z-[5] w-full h-full rounded-md absolute block xl:hidden"
          onClick={() => setIsShowMailMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white dark:bg-gray-800 w-64 p-4 z-10 ${isShowMailMenu ? "block" : "hidden xl:block"} xl:relative absolute h-full`}
      >
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4 flex items-center justify-center"
          onClick={() => openMail("add")}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          New Message
        </button>

        <div className="space-y-2">
          <div className="flex items-center p-2 text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Sent Mail
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {!selectedMail && !isEdit && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button className="xl:hidden mr-4 hover:text-blue-600" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {mailList.length ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mailList.length ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mailList.map((mail) => (
                    <div
                      key={mail._id}
                      className="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-blue-400"
                      onClick={() => setSelectedMail(mail)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          {/* Email header with status indicator */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {mail.isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {mail.to.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-medium truncate ${mail.isUnread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                              >
                                To: {mail.to}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">From: {mail.from}</div>
                            </div>
                          </div>

                          {/* Subject line */}
                          <div
                            className={`text-sm mb-1 truncate ${mail.isUnread ? "font-semibold text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {mail.subject || "No Subject"}
                          </div>

                          {/* Preview text */}
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {mail.displayText || "No preview available"}
                          </div>

                          {/* Attachments indicator */}
                          {mail.attachments && mail.attachments.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                              <span className="text-xs text-gray-500">
                                {mail.attachments.length} attachment{mail.attachments.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Time and actions */}
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {showTime(mail)}
                          </div>

                          {/* Quick actions - shown on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openMail("reply", mail)
                              }}
                              className="p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-600 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Reply"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openMail("forward", mail)
                              }}
                              className="p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-600 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Forward"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No emails found</h3>
                  <p className="text-sm text-center max-w-sm">
                    Your mailbox is empty. Click "New Message" to compose your first email.
                  </p>
                </div>
              )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No emails found</div>
              )}
            </div>
          </div>
        )}

        {selectedMail && !isEdit && (
          <div className="h-full flex flex-col">
            {/* Email Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <button className="mr-4 hover:text-blue-600" onClick={() => setSelectedMail(null)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium">{selectedMail.subject}</h3>
              </div>
              <div className="flex space-x-2">
                <button onClick={handlePrintPDF} className="hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                </button>
                <button onClick={() => openMail("reply", selectedMail)} className="hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
                <button onClick={() => openMail("forward", selectedMail)} className="hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4 space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">From: {selectedMail.from}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">To: {selectedMail.to}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Date: {showTime(selectedMail)}</div>
              </div>

              <div
                id="printPdf"
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedMail.body }}
              />
            </div>
          </div>
        )}

        {isEdit && (
          <div className="h-full flex flex-col">
            {/* Compose Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <button className="xl:hidden mr-4" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h3 className="text-lg font-medium">Compose Message</h3>
            </div>

            {/* Compose Form */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <select
                    name="fromIndex"
                    onChange={changeValue}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select sender email</option>
                    {emailIdentities.map((identity) => (
                      <option
                        key={identity._id}
                        value={JSON.stringify({
                          fromEmail: identity.email,
                          pass: identity.password,
                          host: identity.host,
                          provider: identity.provider,
                          secure: identity.secure,
                        })}
                      >
                        {identity.name} ({identity.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <input
                    id="to"
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter recipient email"
                    defaultValue={params.to}
                    onChange={changeValue}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">CC</label>
                  <input
                    id="cc"
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter CC emails"
                    defaultValue={params.cc}
                    onChange={changeValue}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    id="title"
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter subject"
                    defaultValue={params.title}
                    onChange={changeValue}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <ReactQuill
                    theme="snow"
                    value={params.description || ""}
                    onChange={(content, delta, source, editor) => {
                      setParams({
                        ...params,
                        description: content,
                        displayDescription: editor.getText(),
                      })
                    }}
                    style={{ minHeight: "200px" }}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={sendMail}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Mailbox
