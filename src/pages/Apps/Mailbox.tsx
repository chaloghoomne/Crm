"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import Dropdown from "../../components/Dropdown"
import Swal from "sweetalert2"
import PerfectScrollbar from "react-perfect-scrollbar"
import { Provider, useDispatch, useSelector } from "react-redux"
import type { IRootState } from "../../store"
import { setPageTitle } from "../../store/themeConfigSlice"
import IconStar from "../../components/Icon/IconStar"
import IconSend from "../../components/Icon/IconSend"
import IconCaretDown from "../../components/Icon/IconCaretDown"
import IconBookmark from "../../components/Icon/IconBookmark"
import IconRefresh from "../../components/Icon/IconRefresh"
import IconMenu from "../../components/Icon/IconMenu"
import IconSearch from "../../components/Icon/IconSearch"
import IconSettings from "../../components/Icon/IconSettings"
import IconHelpCircle from "../../components/Icon/IconHelpCircle"
import IconUser from "../../components/Icon/IconUser"
import IconPaperclip from "../../components/Icon/IconPaperclip"
import IconArrowLeft from "../../components/Icon/IconArrowLeft"
import IconPrinter from "../../components/Icon/IconPrinter"
import IconArrowBackward from "../../components/Icon/IconArrowBackward"
import IconArrowForward from "../../components/Icon/IconArrowForward"
import IconGallery from "../../components/Icon/IconGallery"
import IconFolder from "../../components/Icon/IconFolder"
import IconZipFile from "../../components/Icon/IconZipFile"
import IconDownload from "../../components/Icon/IconDownload"
import IconTxtFile from "../../components/Icon/IconTxtFile"
import html2pdf from "html2pdf.js"
import axios from "axios"

const Mailbox = ({ to }: { to: String}) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(setPageTitle("Mailbox"))
  })
  const [mailList, setMailList] = useState<any[]>([])

  const defaultParams = {
    from: "",
    to: to || "",
    cc: "",
    title: "",
    file: null,
    description: "",
    displayDescription: "",
  }

  const [isShowMailMenu, setIsShowMailMenu] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedTab, setSelectedTab] = useState("sent_mail")
  const [filteredMailList, setFilteredMailList] = useState<any>(mailList)
  const [ids, setIds] = useState<any>([])
  const [searchText, setSearchText] = useState<any>("")
  const [selectedMail, setSelectedMail] = useState<any>(null)
  const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)))
  const [pagedMails, setPagedMails] = useState<any>([])
  const [emailIdentities, setEmailIdentities] = useState<any>([])

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl" ? true : false
  const company_id = useSelector((state: IRootState) => state.auth.company_id)
  const emp_id = useSelector((state:IRootState)=>state.auth.id)

  const [pager] = useState<any>({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    startIndex: 0,
    endIndex: 0,
  })

  useEffect(() => {
    const fetchData = async () => {

      const res = await axios.get(import.meta.env.VITE_BASE_URL + `api/getcompanydetails/${company_id}`)
      console.log(res.data.emailAccounts)
      setEmailIdentities(res.data.emailAccounts)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchEmails = async () => {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "api/getallmails")
      setMailList(res.data)
      setFilteredMailList(res.data)
      updatePagedMails(res.data)
    }
    fetchEmails()
  }, [])
  console.log(filteredMailList)

  const updatePagedMails = (mails:any) => {
    if (mails.length) {
      pager.totalPages = pager.pageSize < 1 ? 1 : Math.ceil(mails.length / pager.pageSize)
      if (pager.currentPage > pager.totalPages) {
        pager.currentPage = 1
      }
      pager.startIndex = (pager.currentPage - 1) * pager.pageSize
      pager.endIndex = Math.min(pager.startIndex + pager.pageSize - 1, mails.length - 1)
      setPagedMails([...mails.slice(pager.startIndex, pager.endIndex + 1)])
    } else {
      setPagedMails([])
      pager.startIndex = -1
      pager.endIndex = -1
    }
  }

  const refreshMails = () => {
    setSearchText("")
    updatePagedMails(filteredMailList)
  }

  const selectMail = (item: any) => {
    if (item) {
      if (item.type !== "draft") {
        if (item && item.isUnread) {
          item.isUnread = false
        }
        setSelectedMail(item)
      } else {
        openMail("draft", item)
      }
    } else {
      setSelectedMail("")
    }
  }

  const setImportant = (mailId: number) => {
    if (mailId) {
      const item = filteredMailList.find((d: any) => d.id === mailId)
      item.isImportant = !item.isImportant
    }
  }

  const showTime = (item: any) => {
    const displayDt = new Date(item.sentAt);
    const currentDt = new Date();
  
    const isToday = displayDt.toDateString() === currentDt.toDateString();
  
    if (isToday) {
      // Extract HH:MM from the sentAt datetime
      return displayDt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (displayDt.getFullYear() === currentDt.getFullYear()) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[displayDt.getMonth()]} ${String(displayDt.getDate()).padStart(2, "0")}`;
    } else {
      return `${String(displayDt.getMonth() + 1).padStart(2, "0")}/${String(displayDt.getDate()).padStart(2, "0")}/${displayDt.getFullYear()}`;
    }
  };
  

  const openMail = (type: string, item: any) => {
    if (type === "add") {
      setIsShowMailMenu(false)
      setParams(JSON.parse(JSON.stringify(defaultParams)))
    } else if (type === "draft") {
      const data = JSON.parse(JSON.stringify(item))
      setParams({ ...data, from: data.from, to: data.email, displayDescription: data.email })
    } else if (type === "reply") {
      const data = JSON.parse(JSON.stringify(item))
      setParams({
        ...data,
        from: data.from,
        to: data.email,
        title: "Re: " + data.title,
        displayDescription: "Re: " + data.title,
      })
    } else if (type === "forward") {
      const data = JSON.parse(JSON.stringify(item))
      setParams({
        ...data,
        from: data.from,
        to: data.email,
        title: "Fwd: " + data.title,
        displayDescription: "Fwd: " + data.title,
      })
    }
    setIsEdit(true)
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
        to: params.to,
        cc: params.cc || "",
        subject: params.title,
        companyId:company_id,
        sentBy:emp_id,
        body: params.description,
        displayText: params.displayDescription || "",
        attachments: [],
      }

      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}api/sendmail`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.data.success) {
        showMessage("Mail has been sent successfully.", "success")
        closeMsgPopUp()
        setSelectedMail(null)
        setIsEdit(false)
      } else {
        showMessage(res.data.message || "Failed to send email.", "error")
      }
    } catch (error) {
      console.error("Send mail error:", error)
      showMessage("An unexpected error occurred while sending email.", "error")
    }
  }

  const getFileSize = (file_type: any) => {
    let type = "file"
    if (file_type.includes("image/")) {
      type = "image"
    } else if (file_type.includes("application/x-zip")) {
      type = "zip"
    }
    return type
  }

  const getFileType = (total_bytes: number) => {
    let size = ""
    if (total_bytes < 1000000) {
      size = Math.floor(total_bytes / 1000) + "KB"
    } else {
      size = Math.floor(total_bytes / 1000000) + "MB"
    }
    return size
  }

  const clearSelection = () => {
    setIds([])
  }

  const tabChanged = (tabType: any) => {
    setIsEdit(false)
    setIsShowMailMenu(false)
    setSelectedMail(null)
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "fromIndex") {
      setParams((prev: any) => ({
        ...prev,
        from: JSON.parse(value),
      }))
    } else {
      setParams((prev: any) => ({
        ...prev,
        [e.target.id]: value,
      }))
    }
  }

  const handleCheckboxChange = (id: any) => {
    if (ids.includes(id)) {
      setIds((value: any) => value.filter((d: any) => d !== id))
    } else {
      setIds([...ids, id])
    }
  }

  const checkAllCheckbox = () => {
    if (filteredMailList.length && ids.length === filteredMailList.length) {
      return true
    } else {
      return false
    }
  }

  const handlePrintPDF = ()=>{
    const pdf = document.getElementById("printPdf");
    if(pdf){
        html2pdf().from(pdf).save(`${selectedMail.subject || "mail"}.pdf`);
    }
  }

  const closeMsgPopUp = () => {
    setIsEdit(false)
    setSelectedTab("sent_mail")
  }

  const showMessage = (msg = "", type = "success") => {
    const toast: any = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: "toast" },
    })
    toast.fire({
      icon: type,
      title: msg,
      padding: "10px 20px",
    })
  }

  return (
    <div>
      <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
        {/* <button onClick={onClose}>Close</button> */}
        <div
          className={`overlay bg-black/60 z-[5] w-full h-full rounded-md absolute hidden ${isShowMailMenu ? "!block xl:!hidden" : ""}`}
          onClick={() => setIsShowMailMenu(!isShowMailMenu)}
        ></div>
        <div
          className={`panel xl:block p-4 dark:gray-50 w-[250px] max-w-full flex-none space-y-3 xl:relative absolute z-10 xl:h-auto h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden ${
            isShowMailMenu ? "!block" : ""
          }`}
        >
          <div className="flex flex-col h-full pb-16">
            <div className="pb-5">
              <button className="btn btn-primary w-full" type="button" onClick={() => openMail("add", null)}>
                New Message
              </button>
            </div>
            <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
              <div className="space-y-1">
                <button
                  type="button"
                  className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                    !isEdit && selectedTab === "sent_mail"
                      ? "bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedTab("sent_mail")
                    tabChanged("sent_mail")
                  }}
                >
                  <div className="flex items-center">
                    <IconSend className="shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">Sent</div>
                  </div>
                </button>
              </div>
            </PerfectScrollbar>
          </div>
        </div>

        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
          {!selectedMail && !isEdit && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center flex-wrap-reverse gap-4 p-4">
                {/* <div className="flex items-center w-full sm:w-auto">
                  <div className="ltr:mr-4 rtl:ml-4">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={checkAllCheckbox()}
                      value={ids}
                      onChange={() => {
                        if (ids.length === filteredMailList.length) {
                          setIds([])
                        } else {
                          const checkedIds = filteredMailList.map((d: any) => {
                            return d.id
                          })
                          setIds([...checkedIds])
                        }
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </div>

                  <div className="ltr:mr-4 rtl:ml-4">
                    <Tippy content="Refresh">
                      <button
                        type="button"
                        className="hover:text-primary flex items-center"
                        onClick={() => refreshMails()}
                      >
                        <IconRefresh />
                      </button>
                    </Tippy>
                  </div>
                </div> */}

                <div className="flex justify-between items-center sm:w-auto w-full">
                  <div className="flex items-center ltr:mr-4 rtl:ml-4">
                    <button
                      type="button"
                      className="xl:hidden hover:text-primary block ltr:mr-3 rtl:ml-3"
                      onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                    >
                      <IconMenu />
                    </button>
                    {/* <div className="relative group">
                      <input
                        type="text"
                        className="form-input ltr:pr-8 rtl:pl-8 peer"
                        placeholder="Search Mail"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <div className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                        <IconSearch />
                      </div>
                    </div> */}
                  </div>
                  {/* <div className="flex items-center">
                    <div className="ltr:mr-4 rtl:ml-4">
                      <Tippy content="Settings">
                        <button type="button" className="hover:text-primary">
                          <IconSettings />
                        </button>
                      </Tippy>
                    </div>
                    <div>
                      <Tippy content="Help">
                        <button type="button" className="hover:text-primary">
                          <IconHelpCircle className="w-6 h-6" />
                        </button>
                      </Tippy>
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

              <div className="flex flex-wrap flex-col md:flex-row xl:w-auto justify-between items-center px-4 pb-4">
                <div className="mt-4 md:flex-auto flex-1">
                  <div className="flex items-center md:justify-end justify-center">
                    <div className="ltr:mr-3 rtl:ml-3">
                      {pager.startIndex + 1 + "-" + (pager.endIndex + 1) + " of " + filteredMailList.length}
                    </div>
                    <button
                      type="button"
                      disabled={pager.currentPage === 1}
                      className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => {
                        pager.currentPage--
                        updatePagedMails(filteredMailList)
                      }}
                    >
                      <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                    </button>
                    <button
                      type="button"
                      disabled={pager.currentPage === pager.totalPages}
                      className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => {
                        pager.currentPage++
                        updatePagedMails(filteredMailList)
                      }}
                    >
                      <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

              {pagedMails.length ? (
                <div className="table-responsive grow overflow-y-auto sm:min-h-[300px] min-h-[400px]">
                  <table className="table-hover">
                    <tbody>
                      {pagedMails.map((mail: any) => {
                        return (
                          <tr key={mail._id} className="cursor-pointer" onClick={() => selectMail(mail)}>
                            <td>
                              <div className="flex items-center whitespace-nowrap">
                                {/* <div className="ltr:mr-3 rtl:ml-3">
                                  {ids.includes(mail.id)}
                                  <input
                                    type="checkbox"
                                    id={`chk-${mail.id}`}
                                    value={mail.id}
                                    checked={ids.length ? ids.includes(mail.id) : false}
                                    onChange={() => handleCheckboxChange(mail.id)}
                                    onClick={(event) => event.stopPropagation()}
                                    className="form-checkbox"
                                  />
                                </div>
                                <div className="ltr:mr-3 rtl:ml-3">
                                  <Tippy content="Star">
                                    <button
                                      type="button"
                                      className={`enabled:hover:text-warning disabled:opacity-60 flex items-center ${mail.isStar ? "text-warning" : ""}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                      }}
                                      disabled={selectedTab === "trash"}
                                    >
                                      <IconStar className={mail.isStar ? "fill-warning" : ""} />
                                    </button>
                                  </Tippy>
                                </div>
                                <div className="ltr:mr-3 rtl:ml-3">
                                  <Tippy content="Important">
                                    <button
                                      type="button"
                                      className={`enabled:hover:text-primary disabled:opacity-60 rotate-90 flex items-center ${
                                        mail.isImportant ? "text-primary" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setImportant(mail.id)
                                      }}
                                      disabled={selectedTab === "trash"}
                                    >
                                      <IconBookmark
                                        bookmark={false}
                                        className={`w-4.5 h-4.5 ${mail.isImportant && "fill-primary"}`}
                                      />
                                    </button>
                                  </Tippy>
                                </div> */}
                                <div
                                  className={`dark:text-gray-300 whitespace-nowrap font-semibold ${
                                    !mail.isUnread ? "text-gray-500 dark:text-gray-500 font-normal" : ""
                                  }`}
                                >
                                  sent to :{mail.to}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="font-medium text-white-dark overflow-hidden min-w-[300px] line-clamp-1">
                                <span
                                  className={`${mail.isUnread ? "text-gray-800 dark:text-gray-300 font-semibold" : ""}`}
                                >
                                  {/* <span>{mail.body}</span> &minus; */}
                                  <span> {mail.displayText}</span>
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center">
                                
                                {mail.attachments && (
                                  <div className="ltr:ml-4 rtl:mr-4">
                                    <IconPaperclip />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap font-medium ltr:text-right rtl:text-left">
                              {showTime(mail)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid place-content-center min-h-[300px] font-semibold text-lg h-full">
                  No data available
                </div>
              )}
            </div>
          )}

          {selectedMail && !isEdit && (
            <div>
              <div className="flex items-center justify-between flex-wrap p-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="ltr:mr-2 rtl:ml-2 hover:text-primary"
                    onClick={() => setSelectedMail(null)}
                  >
                    <IconArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                  <h4 className="text-base md:text-lg font-medium ltr:mr-2 rtl:ml-2">{selectedMail.title}</h4>
                  <div className="badge bg-info hover:top-0">{selectedMail.type}</div>
                </div>
                <div>
                  <Tippy content="Print">
                    <button type="button" onClick={handlePrintPDF}>
                      <IconPrinter />
                    </button>
                  </Tippy>
                </div>
              </div>
              <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
              <div className="p-4 relative">
                <div className="flex flex-wrap">
                  <div className="flex-shrink-0 ltr:mr-2 rtl:ml-2">
                    {selectedMail.path ? (
                      <img
                        src={`/assets/images/${selectedMail.path}`}
                        className="h-12 w-12 rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-800 rounded-full p-3">
                        <IconUser className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="ltr:mr-2 rtl:ml-2 flex-1">
                    <div className="flex items-center">
                      <div className="text-lg ltr:mr-4 rtl:ml-4 whitespace-nowrap">
                        {selectedMail.to}
                      </div>
                      {selectedMail.group && (
                        <div className="ltr:mr-4 rtl:ml-4">
                        </div>
                      )}
                      <div className="text-white-dark whitespace-nowrap">{showTime(selectedMail)}</div>
                    </div>
                    <div  className="text-white-dark flex items-center">
                      <div className="ltr:mr-1 rtl:ml-1">
                        {selectedMail.type === "sent_mail" ? selectedMail.email : "to me"}
                      </div>
                      <div className="dropdown">
                        <Dropdown
                          offset={[10]}
                          placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                          btnClassName="hover:text-primary flex items-center"
                          button={<IconCaretDown className="w-5 h-5" />}
                        >
                          <ul className="min-w-[250px] max-w-[90vw]">

                            <li>
                              <div className="flex items-center px-4 py-2">
                                <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">From:</div>
                                <div className="flex-1">
                                  {selectedMail.type === "sent_mail" ? "vristo@gmail.com" : selectedMail.to}
                                </div>
                              </div>
                            </li>
                            <li>
                              <div className="flex items-center px-4 py-2">
                                <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">To:</div>
                                <div className="flex-1">
                                  {selectedMail.from}
                                </div>
                              </div>
                            </li>
                            <li>
                              <div className="flex items-center px-4 py-2">
                                <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">Date:</div>
                                <div className="flex-1">{showTime(selectedMail)}</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex items-center px-4 py-2">
                                <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">Subject:</div>
                                <div className="flex-1">{selectedMail.subject}</div>
                              </div>
                            </li>
                          </ul>
                        </Dropdown>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                      <Tippy content="Reply">
                        <button
                          type="button"
                          className="hover:text-info"
                          onClick={() => openMail("reply", selectedMail)}
                        >
                          <IconArrowBackward className="rtl:hidden" />
                          <IconArrowForward className="ltr:hidden" />
                        </button>
                      </Tippy>
                      <Tippy content="Forward">
                        <button
                          type="button"
                          className="hover:text-info"
                          onClick={() => openMail("forward", selectedMail)}
                        >
                          <IconArrowBackward className="ltr:hidden" />
                          <IconArrowForward className="rtl:hidden" />
                        </button>
                      </Tippy>
                    </div>
                  </div>
                </div>

                <div id="printPdf"
                  className="mt-8 prose dark:prose-p:text-white prose-p:text-sm md:prose-p:text-sm max-w-full prose-img:inline-block prose-img:m-0"
                  dangerouslySetInnerHTML={{ __html: selectedMail.body }}
                ></div>
                <p className="mt-4">Best Regards,</p>
                <p>{selectedMail.from}</p>

                {selectedMail.attachments && (
                  <div className="mt-8">
                    <div className="text-base mb-4">Attachments</div>
                    <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                    <div className="flex items-center flex-wrap mt-6">
                      {selectedMail.attachments.map((attachment: any, i: number) => {
                        return (
                          <button
                            key={i}
                            type="button"
                            className="flex items-center ltr:mr-4 rtl:ml-4 mb-4 border border-white-light dark:border-[#1b2e4b] rounded-md hover:text-primary hover:border-primary transition-all duration-300 px-4 py-2.5 relative group"
                          >
                            {attachment.type === "image" && <IconGallery />}
                            {attachment.type === "folder" && <IconFolder />}
                            {attachment.type === "zip" && <IconZipFile />}
                            {attachment.type !== "zip" &&
                              attachment.type !== "image" &&
                              attachment.type !== "folder" && <IconTxtFile className="w-5 h-5" />}

                            <div className="ltr:ml-3 rtl:mr-3">
                              <p className="text-xs text-primary font-semibold">{attachment.name}</p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-600">{attachment.size}</p>
                            </div>
                            <div className="bg-dark-light/40 z-[5] w-full h-full absolute ltr:left-0 rtl:right-0 top-0 rounded-md hidden group-hover:block"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1 btn btn-primary hidden group-hover:block z-10">
                              <IconDownload className="w-4.5 h-4.5" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isEdit && (
            <div className="relative">
              <div className="py-4 px-6 flex items-center">
                <button
                  type="button"
                  className="xl:hidden hover:text-primary block ltr:mr-3 rtl:ml-3"
                  onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                >
                  <IconMenu />
                </button>
                <h4 className="text-lg text-gray-600 dark:text-gray-400 font-medium">Message</h4>
              </div>
              <div className="h-px bg-gradient-to-l from-indigo-900/20 via-black dark:via-white to-indigo-900/20 opacity-[0.1]"></div>
              <form className="p-6 grid gap-6">
                <div>
                  <select
                    name="fromIndex"
                    onChange={(e) => {
                      changeValue(e)
                    }}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select sender email</option>
                    {emailIdentities.map((identity: any) => (
                      <option
                        key={identity._id}
                        value={JSON.stringify({
                          fromEmail: identity.email,
                          pass: identity.password,
                          host: identity.host,
                          provider: identity.provider,
                        })}
                      >
                        {identity.name} ({identity.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    id="to"
                    type="text"
                    className="form-input"
                    placeholder="Enter To"
                    defaultValue={params.to}
                    onChange={(e) => {
                      changeValue(e)
                    }}
                  />
                </div>

                <div>
                  <input
                    id="cc"
                    type="text"
                    className="form-input"
                    placeholder="Enter Cc"
                    defaultValue={params.cc}
                    onChange={(e) => changeValue(e)}
                  />
                </div>

                <div>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="Enter Subject"
                    defaultValue={params.title}
                    onChange={(e) => changeValue(e)}
                  />
                </div>

                <div className="h-fit">
                  <ReactQuill
                    theme="snow"
                    value={params.description || ""}
                    defaultValue={params.description || ""}
                    onChange={(content, delta, source, editor) => {
                      params.description = content
                      params.displayDescription = editor.getText()
                      setParams({
                        ...params,
                      })
                    }}
                    style={{ minHeight: "200px" }}
                  />
                </div>

                <div>
                  <input
                    type="file"
                    className="form-input file:py-2 file:px-4 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file:ml-5 file:text-white file:hover:bg-primary"
                    multiple
                    accept="image/*,.zip,.pdf,.xls,.xlsx,.txt.doc,.docx"
                    required
                  />
                </div>
                <div className="flex items-center ltr:ml-auto rtl:mr-auto mt-8">
                  <button type="button" className="btn btn-outline-danger ltr:mr-3 rtl:ml-3" onClick={closeMsgPopUp}>
                    Close
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => sendMail()}>
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Mailbox
