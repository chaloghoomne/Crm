"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUtensils,
  FaBus,
  FaUser,
  FaBed,
  FaImage,
  FaArrowUp,
  FaArrowDown,
  FaFilePdf,
  FaEye,
  FaEdit,
  FaPlane,
  FaPassport,
  FaHotel,
  FaGlobe,
} from "react-icons/fa"
import { useSelector } from "react-redux"
import type { IRootState } from "../../store"
import type { Hotel } from "../../types/types"
import { useBunnyUpload } from "../../components/useBunny"

interface ItineraryProps {
  leadId: string
  setItineraryWindow: (value: string) => void
}

interface Traveler {
  id: string
  name: string
  passport: string
  age: number
}

interface HotelInfo {
  id: string
  name: string
  checkIn: string
  checkOut: string
  roomType: string
  notes: string
}

interface FlightInfo {
  id: string
  airline: string
  flightNumber: string
  departureDate: string
  departureTime: string
  departureAirport: string
  arrivalDate: string
  arrivalTime: string
  arrivalAirport: string
  notes: string
}

interface VisaInfo {
  id: string
  country: string
  type: string
  processingTime: string
  requirements: string
  status: string
  notes: string
}

interface ItineraryDay {
  id: string
  dayNumber: number
  title: string
  description: string
  location?: string
  date?: string
  activities: DayActivity[]
  includedServices: {
    meals: boolean
    transport: boolean
    guide: boolean
    accommodation: boolean
  }
  images: string[]
}

interface DayActivity {
  id: string
  time: string
  title: string
  description: string
  location?: string
}

interface PredefinedItinerary {
  _id: string
  title: string
  description?: string
  companyId: string
  operationId: string
  createdBy: string
  days: ItineraryDay[]
  travelers: Traveler[]
  hotels: HotelInfo[]
  flights: FlightInfo[]
  visas: VisaInfo[]
  status?: string
  shareableLink?: string
  createdAt?: string
  updatedAt?: string
}

const ItineraryComponent: React.FC<ItineraryProps> = ({ leadId, setItineraryWindow }) => {
  const [lead, setLead] = useState<any>(null)
  const [loadingFile, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [itineraryTitle, setItineraryTitle] = useState<string>("")
  const [itineraryDescription, setItineraryDescription] = useState<string>("")
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>([])
  const [hotels, setHotels] = useState<HotelInfo[]>([])
  const [flights, setFlights] = useState<FlightInfo[]>([])
  const [visas, setVisas] = useState<VisaInfo[]>([])
  const [activeTab, setActiveTab] = useState<string>("itinerary")
  const [viewMode, setViewMode] = useState<"create" | "template" | "preview">("create")
  const [transportTab, setTransportTab] = useState<"flights" | "visas">("flights")
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false)
  const [pdfProgress, setPdfProgress] = useState<number>(0)
  const [pdfTheme, setPdfTheme] = useState<"light" | "dark" | "colorful">("light")
  const [pdfIncludeImages, setPdfIncludeImages] = useState<boolean>(true)
  const [pdfIncludeDetails, setPdfIncludeDetails] = useState<boolean>(true)
  const [predefinedItineraries, setPredefinedItineraries] = useState<PredefinedItinerary[]>([])
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})

  const createdBy = useSelector((state: IRootState) => state.auth.id)
  const companyId = useSelector((state: IRootState) => state.auth.company_id)
  const { uploadFiles, loading: bunnyLoading } = useBunnyUpload()

  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getItenaryLead = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getPredefinedItenaryLead/${companyId}`)
        console.log(res.data)
        setPredefinedItineraries(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    getItenaryLead()
  }, [viewMode])

  useEffect(() => {
    const getHotel = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getHotel/${companyId}`)
        setAvailableHotels(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    getHotel()
  }, [leadId])

  // Fetch lead data
  useEffect(() => {
    const getLead = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getItenaryLead/${leadId}`)
        setLead(res.data[0])
        console.log(res)
        // Check if there's existing itinerary data
        if (res.data[0]) {
          try {
            const itineraryData = res.data[0]
            if (itineraryData.days) {
              setItineraryDays(itineraryData.days)
            }
            if (itineraryData.title) {
              setItineraryTitle(itineraryData.title)
            }
            if (itineraryData.description) {
              setItineraryDescription(itineraryData.description)
            }
            if (itineraryData.travelers) {
              setTravelers(itineraryData.travelers)
            }
            if (itineraryData.hotels) {
              setHotels(itineraryData.hotels)
            }
            if (itineraryData.flights) {
              setFlights(itineraryData.flights)
            }
            if (itineraryData.visas) {
              setVisas(itineraryData.visas)
            }
          } catch (e) {
            console.error("Error parsing itinerary data:", e)
          }
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch lead data.")
      } finally {
        setLoading(false)
      }
    }

    getLead()
  }, [leadId])

  // Add a new day to the itinerary
  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      id: `day-${Date.now()}`,
      dayNumber: itineraryDays.length + 1,
      title: `Day ${itineraryDays.length + 1}`,
      description: "",
      activities: [],
      includedServices: {
        meals: false,
        transport: false,
        guide: false,
        accommodation: false,
      },
      images: [],
    }

    setItineraryDays([...itineraryDays, newDay])
    setActiveDay(newDay.id)
  }

  // Improved image upload function
  const handleImageUpload = async (dayId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Set uploading state for this specific day
    setUploadingImages((prev) => ({ ...prev, [dayId]: true }))

    try {
      // Convert FileList to Array and upload using Bunny
      const fileArray = Array.from(files)
      const result = await uploadFiles(fileArray, "itinerary-images")

      if (result.error) {
        alert(`Upload failed: ${result.error}`)
        return
      }

      if (result.imageUrls && result.imageUrls.length > 0) {
        // Add the uploaded image URLs to the day's images
        const updatedDays = itineraryDays.map((day) => {
          if (day.id === dayId) {
            return {
              ...day,
              images: [...day.images, ...result.imageUrls],
            }
          }
          return day
        })

        setItineraryDays(updatedDays)

        // Show success message
        const uploadCount = result.imageUrls.length
        alert(`Successfully uploaded ${uploadCount} image${uploadCount > 1 ? "s" : ""}!`)
      }
    } catch (err) {
      console.error("Error uploading images:", err)
      alert("Failed to upload images. Please try again.")
    } finally {
      // Clear uploading state
      setUploadingImages((prev) => ({ ...prev, [dayId]: false }))
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = ""
    }
  }

  // Remove a day from the itinerary
  const handleRemoveDay = (dayId: string) => {
    const updatedDays = itineraryDays.filter((day) => day.id !== dayId)

    // Renumber the days
    const renumberedDays = updatedDays.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
      title: day.title.startsWith("Day ") ? `Day ${index + 1}` : day.title,
    }))

    setItineraryDays(renumberedDays)

    // If the active day was removed, set the active day to null
    if (activeDay === dayId) {
      setActiveDay(renumberedDays.length > 0 ? renumberedDays[0].id : null)
    }
  }

  // Move a day up in the order
  const handleMoveUp = (index: number) => {
    if (index === 0) return // Already at the top

    const updatedDays = [...itineraryDays]
    const temp = updatedDays[index]
    updatedDays[index] = updatedDays[index - 1]
    updatedDays[index - 1] = temp

    // Renumber the days
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      dayNumber: idx + 1,
      title: day.title.startsWith("Day ") ? `Day ${idx + 1}` : day.title,
    }))

    setItineraryDays(renumberedDays)
  }

  // Move a day down in the order
  const handleMoveDown = (index: number) => {
    if (index === itineraryDays.length - 1) return // Already at the bottom

    const updatedDays = [...itineraryDays]
    const temp = updatedDays[index]
    updatedDays[index] = updatedDays[index + 1]
    updatedDays[index + 1] = temp

    // Renumber the days
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      dayNumber: idx + 1,
      title: day.title.startsWith("Day ") ? `Day ${idx + 1}` : day.title,
    }))

    setItineraryDays(renumberedDays)
  }

  // Update a day's details
  const handleUpdateDay = (dayId: string, field: keyof ItineraryDay, value: any) => {
    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        return { ...day, [field]: value }
      }
      return day
    })
    setItineraryDays(updatedDays)
  }

  // Add a new activity to a day
  const handleAddActivity = (dayId: string) => {
    const newActivity: DayActivity = {
      id: `activity-${Date.now()}`,
      time: "morning",
      title: "New Activity",
      description: "",
    }

    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        return { ...day, activities: [...day.activities, newActivity] }
      }
      return day
    })

    setItineraryDays(updatedDays)
  }

  // Remove an activity from a day
  const handleRemoveActivity = (dayId: string, activityId: string) => {
    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.filter((activity) => activity.id !== activityId),
        }
      }
      return day
    })

    setItineraryDays(updatedDays)
  }

  // Update an activity's details
  const handleUpdateActivity = (dayId: string, activityId: string, field: keyof DayActivity, value: any) => {
    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        const updatedActivities = day.activities.map((activity) => {
          if (activity.id === activityId) {
            return { ...activity, [field]: value }
          }
          return activity
        })
        return { ...day, activities: updatedActivities }
      }
      return day
    })

    setItineraryDays(updatedDays)
  }

  // Toggle included service
  const handleToggleService = (dayId: string, service: keyof ItineraryDay["includedServices"]) => {
    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          includedServices: {
            ...day.includedServices,
            [service]: !day.includedServices[service],
          },
        }
      }
      return day
    })

    setItineraryDays(updatedDays)
  }

  // Remove an image from a day
  const handleRemoveImage = (dayId: string, imageUrl: string) => {
    const updatedDays = itineraryDays.map((day) => {
      if (day.id === dayId) {
        return { ...day, images: day.images.filter((img) => img !== imageUrl) }
      }
      return day
    })

    setItineraryDays(updatedDays)
  }

  // Add a new traveler
  const handleAddTraveler = () => {
    const newTraveler: Traveler = {
      id: `traveler-${Date.now()}`,
      name: "",
      passport: "",
      age: 0,
    }

    setTravelers([...travelers, newTraveler])
  }

  // Remove a traveler
  const handleRemoveTraveler = (travelerId: string) => {
    setTravelers(travelers.filter((traveler) => traveler.id !== travelerId))
  }

  // Update traveler information
  const handleUpdateTraveler = (travelerId: string, field: keyof Traveler, value: any) => {
    const updatedTravelers = travelers.map((traveler) => {
      if (traveler.id === travelerId) {
        return { ...traveler, [field]: value }
      }
      return traveler
    })

    setTravelers(updatedTravelers)
  }

  // Hotel handlers
  const handleAddHotel = () => {
    const newHotel: HotelInfo = {
      id: `hotel-${Date.now()}`,
      name: "",
      checkIn: "",
      checkOut: "",
      roomType: "",
      notes: "",
    }
    setHotels([...hotels, newHotel])
  }

  const handleRemoveHotel = (hotelId: string) => {
    setHotels(hotels.filter((hotel) => hotel.id !== hotelId))
  }

  const handleUpdateHotel = (hotelId: string, field: keyof HotelInfo, value: any) => {
    const updatedHotels = hotels.map((hotel) => {
      if (hotel.id === hotelId) {
        return { ...hotel, [field]: value }
      }
      return hotel
    })
    setHotels(updatedHotels)
  }

  // Flight handlers
  const handleAddFlight = () => {
    const newFlight: FlightInfo = {
      id: `flight-${Date.now()}`,
      airline: "",
      flightNumber: "",
      departureDate: "",
      departureTime: "",
      departureAirport: "",
      arrivalDate: "",
      arrivalTime: "",
      arrivalAirport: "",
      notes: "",
    }
    setFlights([...flights, newFlight])
  }

  const handleRemoveFlight = (flightId: string) => {
    setFlights(flights.filter((flight) => flight.id !== flightId))
  }

  const handleUpdateFlight = (flightId: string, field: keyof FlightInfo, value: any) => {
    const updatedFlights = flights.map((flight) => {
      if (flight.id === flightId) {
        return { ...flight, [field]: value }
      }
      return flight
    })
    setFlights(updatedFlights)
  }

  // Visa handlers
  const handleAddVisa = () => {
    const newVisa: VisaInfo = {
      id: `visa-${Date.now()}`,
      country: "",
      type: "",
      processingTime: "",
      requirements: "",
      status: "pending",
      notes: "",
    }
    setVisas([...visas, newVisa])
  }

  const handleRemoveVisa = (visaId: string) => {
    setVisas(visas.filter((visa) => visa.id !== visaId))
  }

  const handleUpdateVisa = (visaId: string, field: keyof VisaInfo, value: any) => {
    const updatedVisas = visas.map((visa) => {
      if (visa.id === visaId) {
        return { ...visa, [field]: value }
      }
      return visa
    })
    setVisas(updatedVisas)
  }

  // Function to format and insert information into the text editor
  const formatAndInsertIntoEditor = () => {
    let formattedContent = "<div class='inserted-content'>"

    // Format travelers information
    if (travelers.length > 0) {
      formattedContent +=
        "<h3 style='color: #2563eb; margin-top: 15px; margin-bottom: 10px;'>Travelers Information</h3><ul style='list-style-type: disc; padding-left: 20px;'>"
      travelers.forEach((traveler) => {
        formattedContent += `<li><strong>${traveler.name}</strong> - Passport: ${traveler.passport}, Age: ${traveler.age}</li>`
      })
      formattedContent += "</ul>"
    }

    // Format hotel information
    if (hotels.length > 0) {
      formattedContent +=
        "<h3 style='color: #2563eb; margin-top: 15px; margin-bottom: 10px;'>Hotel Accommodations</h3><ul style='list-style-type: disc; padding-left: 20px;'>"
      hotels.forEach((hotel) => {
        formattedContent += `<li><strong>${hotel.name}</strong> - Check-in: ${hotel.checkIn}, Check-out: ${hotel.checkOut}, Room Type: ${hotel.roomType}`
        if (hotel.notes) formattedContent += `<br/><em>Notes: ${hotel.notes}</em>`
        formattedContent += "</li>"
      })
      formattedContent += "</ul>"
    }

    // Format flight information
    if (flights.length > 0) {
      formattedContent +=
        "<h3 style='color: #2563eb; margin-top: 15px; margin-bottom: 10px;'>Flight Details</h3><ul style='list-style-type: disc; padding-left: 20px;'>"
      flights.forEach((flight) => {
        formattedContent += `<li><strong>${flight.airline} ${flight.flightNumber}</strong><br/>
          Departure: ${flight.departureAirport} on ${flight.departureDate} at ${flight.departureTime}<br/>
          Arrival: ${flight.arrivalAirport} on ${flight.arrivalDate} at ${flight.arrivalTime}`
        if (flight.notes) formattedContent += `<br/><em>Notes: ${flight.notes}</em>`
        formattedContent += "</li>"
      })
      formattedContent += "</ul>"
    }

    // Format visa information
    if (visas.length > 0) {
      formattedContent +=
        "<h3 style='color: #2563eb; margin-top: 15px; margin-bottom: 10px;'>Visa Information</h3><ul style='list-style-type: disc; padding-left: 20px;'>"
      visas.forEach((visa) => {
        formattedContent += `<li><strong>${visa.country} - ${visa.type} Visa</strong><br/>
          Processing Time: ${visa.processingTime}, Status: ${visa.status}<br/>
          Requirements: ${visa.requirements}`
        if (visa.notes) formattedContent += `<br/><em>Notes: ${visa.notes}</em>`
        formattedContent += "</li>"
      })
      formattedContent += "</ul>"
    }

    formattedContent += "</div>"

    // Append to existing description
    setItineraryDescription((prevDescription) => prevDescription + formattedContent)
  }

  // Save the itinerary
  const handleSaveItinerary = async () => {
    setSaving(true)
    try {
      const itineraryData = {
        operationId: leadId,
        createdBy,
        companyId,
        title: itineraryTitle,
        description: itineraryDescription,
        days: itineraryDays,
        travelers: travelers,
        hotels: hotels,
        flights: flights,
        visas: visas,
      }
      console.log(itineraryData)
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/saveItineray`, {
        ...itineraryData,
      })

      alert("Itinerary saved successfully!")
      setItineraryWindow("")
    } catch (err) {
      console.error(err)
      alert("Failed to save itinerary. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // New function to handle selecting a predefined itinerary
  const handleSelectPredefinedItinerary = (itineraryId: string) => {
    const selectedItinerary = predefinedItineraries.find((itinerary) => itinerary._id === itineraryId)

    if (!selectedItinerary) return

    // Set basic itinerary details
    setItineraryTitle(selectedItinerary.title)
    setItineraryDescription(selectedItinerary?.description || "")

    // Create placeholder days based on the predefined itinerary
    const newDays: ItineraryDay[] = []

    for (let i = 0; i < selectedItinerary.days.length; i++) {
      newDays.push({
        id: `day-${Date.now()}-${i}`,
        dayNumber: i + 1,
        title: `Day ${i + 1}`,
        description: "",
        location: selectedItinerary.title,
        activities: [],
        includedServices: {
          meals: false,
          transport: false,
          guide: false,
          accommodation: false,
        },
        images: [],
      })
    }

    setItineraryDays(newDays)
    setActiveDay(newDays[0].id)

    // Switch to create mode after selecting a template
    setViewMode("create")
    setActiveTab("itinerary")
  }

  // Generate PDF from the itinerary
  const generatePDF = async () => {
    if (!previewRef.current) return

    setPdfGenerating(true)
    setPdfProgress(0)

    try {
      const element = previewRef.current
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10

      // Add title page
      pdf.setFontSize(24)
      pdf.setTextColor(0, 0, 0)
      pdf.text(itineraryTitle, pageWidth / 2, 40, { align: "center" })

      if (lead?.leadId?.name) {
        pdf.setFontSize(16)
        pdf.text(`Prepared for: ${lead.leadId.name}`, pageWidth / 2, 60, { align: "center" })
      }

      if (lead?.leadId?.fromDate && lead?.leadId?.toDate) {
        const fromDate = new Date(lead.leadId.fromDate).toLocaleDateString()
        const toDate = new Date(lead.leadId.toDate).toLocaleDateString()
        pdf.setFontSize(12)
        pdf.text(`Travel Dates: ${fromDate} - ${toDate}`, pageWidth / 2, 70, { align: "center" })
      }

      if (lead?.leadId?.destination) {
        pdf.setFontSize(14)
        pdf.text(`Destination: ${lead.leadId.destination}`, pageWidth / 2, 80, { align: "center" })
      }

      // Add company info at bottom
      pdf.setFontSize(10)
      pdf.text("ChaloGhoomne.com", pageWidth / 2, pageHeight - 20, { align: "center" })
      pdf.text("Contact: info@chaloghoomne.com | +1 (555) 123-4567", pageWidth / 2, pageHeight - 15, {
        align: "center",
      })

      pdf.addPage()

      // Add overview
      pdf.setFontSize(18)
      pdf.text("Trip Overview", margin, 20)

      // Create a temporary div to render HTML content
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = itineraryDescription
      tempDiv.style.width = `${pageWidth - 2 * margin}mm`
      tempDiv.style.padding = "10px"
      document.body.appendChild(tempDiv)

      const overviewCanvas = await html2canvas(tempDiv)
      const overviewImgData = overviewCanvas.toDataURL("image/png")

      // Calculate height to maintain aspect ratio
      const overviewImgWidth = pageWidth - 2 * margin
      const overviewImgHeight = (overviewCanvas.height * overviewImgWidth) / overviewCanvas.width

      pdf.addImage(overviewImgData, "PNG", margin, 25, overviewImgWidth, overviewImgHeight)

      document.body.removeChild(tempDiv)

      let currentY = 25 + overviewImgHeight + 10

      // Check if we need a new page
      if (currentY > pageHeight - 20) {
        pdf.addPage()
        currentY = 20
      }

      // Add itinerary days
      for (let i = 0; i < itineraryDays.length; i++) {
        const day = itineraryDays[i]
        setPdfProgress(Math.floor((i / itineraryDays.length) * 100))

        // Add new page for each day
        if (i > 0) {
          pdf.addPage()
          currentY = 20
        }

        // Day title
        pdf.setFontSize(16)
        pdf.setTextColor(41, 98, 255) // Blue color
        pdf.text(`Day ${day.dayNumber}: ${day.title}`, margin, currentY)
        currentY += 10

        // Date and location
        if (day.date || day.location) {
          pdf.setFontSize(12)
          pdf.setTextColor(100, 100, 100) // Gray color
          let dateLocationText = ""
          if (day.date) {
            dateLocationText += `Date: ${new Date(day.date).toLocaleDateString()}`
          }
          if (day.location) {
            dateLocationText += dateLocationText ? ` | Location: ${day.location}` : `Location: ${day.location}`
          }
          pdf.text(dateLocationText, margin, currentY)
          currentY += 8
        }

        // Included services
        const services = []
        if (day.includedServices.meals) services.push("Meals")
        if (day.includedServices.transport) services.push("Transport")
        if (day.includedServices.guide) services.push("Guide")
        if (day.includedServices.accommodation) services.push("Accommodation")

        if (services.length > 0) {
          pdf.setFontSize(12)
          pdf.setTextColor(0, 150, 0) // Green color
          pdf.text(`Included: ${services.join(", ")}`, margin, currentY)
          currentY += 8
        }

        // Description
        if (day.description) {
          const descDiv = document.createElement("div")
          descDiv.innerHTML = day.description
          descDiv.style.width = `${pageWidth - 2 * margin}mm`
          descDiv.style.padding = "10px"
          document.body.appendChild(descDiv)

          const descCanvas = await html2canvas(descDiv)
          const descImgData = descCanvas.toDataURL("image/png")

          // Calculate height to maintain aspect ratio
          const descImgWidth = pageWidth - 2 * margin
          const descImgHeight = (descCanvas.height * descImgWidth) / descCanvas.width

          // Check if we need a new page
          if (currentY + descImgHeight > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.addImage(descImgData, "PNG", margin, currentY, descImgWidth, descImgHeight)
          currentY += descImgHeight + 5

          document.body.removeChild(descDiv)
        }

        // Activities
        if (day.activities.length > 0) {
          // Check if we need a new page
          if (currentY + 10 + day.activities.length * 15 > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.setFontSize(14)
          pdf.setTextColor(0, 0, 0)
          pdf.text("Activities:", margin, currentY)
          currentY += 8

          for (const activity of day.activities) {
            pdf.setFontSize(12)
            pdf.setTextColor(0, 0, 0)

            // Capitalize first letter of time
            const timeCapitalized = activity.time.charAt(0).toUpperCase() + activity.time.slice(1)

            pdf.text(`${timeCapitalized}: ${activity.title}`, margin + 5, currentY)
            currentY += 6

            if (activity.description) {
              pdf.setFontSize(10)
              pdf.setTextColor(100, 100, 100)

              // Split long descriptions into multiple lines
              const descriptionLines = pdf.splitTextToSize(activity.description, pageWidth - 2 * margin - 10)

              // Check if we need a new page
              if (currentY + descriptionLines.length * 5 > pageHeight - 20) {
                pdf.addPage()
                currentY = 20
              }

              pdf.text(descriptionLines, margin + 10, currentY)
              currentY += descriptionLines.length * 5 + 3
            }

            if (activity.location) {
              // Check if we need a new page
              if (currentY + 5 > pageHeight - 20) {
                pdf.addPage()
                currentY = 20
              }

              pdf.setFontSize(10)
              pdf.setTextColor(100, 100, 100)
              pdf.text(`Location: ${activity.location}`, margin + 10, currentY)
              currentY += 8
            }
          }
        }

        // Images
        if (pdfIncludeImages && day.images.length > 0) {
          // We'll add just the first image for simplicity
          // In a real implementation, you might want to add all images or create a collage

          // Check if we need a new page
          if (currentY + 60 > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.setFontSize(14)
          pdf.setTextColor(0, 0, 0)
          pdf.text("Images:", margin, currentY)
          currentY += 8

          try {
            // This is a simplified approach - in a real implementation,
            // you'd need to handle CORS issues and possibly use a server-side approach
            // or ensure all images are from your domain
            const imgWidth = pageWidth - 2 * margin
            const imgHeight = 50

            pdf.addImage(day.images[0], "JPEG", margin, currentY, imgWidth, imgHeight)
            currentY += imgHeight + 10
          } catch (err) {
            console.error("Error adding image to PDF:", err)
            pdf.text("(Image could not be added)", margin + 5, currentY)
            currentY += 10
          }
        }
      }

      // Add additional details if requested
      if (pdfIncludeDetails) {
        pdf.addPage()
        currentY = 20

        pdf.setFontSize(18)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Additional Details", margin, currentY)
        currentY += 15

        // Travelers
        if (travelers.length > 0) {
          pdf.setFontSize(14)
          pdf.setTextColor(41, 98, 255)
          pdf.text("Travelers", margin, currentY)
          currentY += 8

          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)

          for (const traveler of travelers) {
            pdf.text(`• ${traveler.name} - Passport: ${traveler.passport}, Age: ${traveler.age}`, margin + 5, currentY)
            currentY += 7
          }

          currentY += 5
        }

        // Hotels
        if (hotels.length > 0) {
          // Check if we need a new page
          if (currentY + 10 + hotels.length * 15 > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.setFontSize(14)
          pdf.setTextColor(41, 98, 255)
          pdf.text("Hotel Accommodations", margin, currentY)
          currentY += 8

          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)

          for (const hotel of hotels) {
            pdf.text(`• ${hotel.name} - ${hotel.roomType}`, margin + 5, currentY)
            currentY += 6
            pdf.text(`  Check-in: ${hotel.checkIn}, Check-out: ${hotel.checkOut}`, margin + 5, currentY)
            currentY += 6

            if (hotel.notes) {
              pdf.setFontSize(10)
              pdf.setTextColor(100, 100, 100)
              pdf.text(`  Notes: ${hotel.notes}`, margin + 5, currentY)
              currentY += 6
            }

            currentY += 2
          }

          currentY += 5
        }

        // Flights
        if (flights.length > 0) {
          // Check if we need a new page
          if (currentY + 10 + flights.length * 20 > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.setFontSize(14)
          pdf.setTextColor(41, 98, 255)
          pdf.text("Flight Details", margin, currentY)
          currentY += 8

          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)

          for (const flight of flights) {
            pdf.text(`• ${flight.airline} ${flight.flightNumber}`, margin + 5, currentY)
            currentY += 6
            pdf.text(
              `  Departure: ${flight.departureAirport} on ${flight.departureDate} at ${flight.departureTime}`,
              margin + 5,
              currentY,
            )
            currentY += 6
            pdf.text(
              `  Arrival: ${flight.arrivalAirport} on ${flight.arrivalDate} at ${flight.arrivalTime}`,
              margin + 5,
              currentY,
            )
            currentY += 6

            if (flight.notes) {
              pdf.setFontSize(10)
              pdf.setTextColor(100, 100, 100)
              pdf.text(`  Notes: ${flight.notes}`, margin + 5, currentY)
              currentY += 6
            }

            currentY += 2
          }

          currentY += 5
        }

        // Visas
        if (visas.length > 0) {
          // Check if we need a new page
          if (currentY + 10 + visas.length * 20 > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
          }

          pdf.setFontSize(14)
          pdf.setTextColor(41, 98, 255)
          pdf.text("Visa Information", margin, currentY)
          currentY += 8

          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)

          for (const visa of visas) {
            pdf.text(`• ${visa.country} - ${visa.type} Visa (${visa.status})`, margin + 5, currentY)
            currentY += 6
            pdf.text(`  Processing Time: ${visa.processingTime}`, margin + 5, currentY)
            currentY += 6

            if (visa.requirements) {
              pdf.text(`  Requirements: ${visa.requirements}`, margin + 5, currentY)
              currentY += 6
            }

            if (visa.notes) {
              pdf.setFontSize(10)
              pdf.setTextColor(100, 100, 100)
              pdf.text(`  Notes: ${visa.notes}`, margin + 5, currentY)
              currentY += 6
            }

            currentY += 2
          }
        }
      }

      // Final page with contact information
      pdf.addPage()
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Contact Information", pageWidth / 2, 40, { align: "center" })

      pdf.setFontSize(14)
      pdf.text("Your Travel Agency", pageWidth / 2, 60, { align: "center" })

      pdf.setFontSize(12)
      pdf.text("123 Travel Street, City, Country", pageWidth / 2, 70, { align: "center" })
      pdf.text("Phone: +91 9555535252", pageWidth / 2, 80, { align: "center" })
      pdf.text("Email: b2b@chaloghoomne.com", pageWidth / 2, 90, { align: "center" })
      pdf.text("Website: www.chaloghoomne.com", pageWidth / 2, 100, { align: "center" })

      pdf.setFontSize(10)
      pdf.text("This itinerary is subject to change based on local conditions and availability.", pageWidth / 2, 120, {
        align: "center",
      })
      pdf.text("Please refer to your travel documents for final details.", pageWidth / 2, 130, { align: "center" })

      // Save the PDF
      pdf.save(`${itineraryTitle.replace(/\s+/g, "_")}_Itinerary.pdf`)

      setPdfProgress(100)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setPdfGenerating(false)
    }
  }

  // Preview mode renderer
  const renderPreview = () => {
    return (
      <div
        ref={previewRef}
        className={`p-8 ${
          pdfTheme === "light"
            ? "bg-white text-gray-800"
            : pdfTheme === "dark"
              ? "bg-gray-900 text-white"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
              {itineraryTitle}
            </h1>
            {lead?.leadId?.name && <p className="text-lg mb-1">Prepared for: {lead.leadId.name}</p>}
            {lead?.leadId?.fromDate && lead?.leadId?.toDate && (
              <p className="mb-1">
                Travel Dates: {new Date(lead.leadId.fromDate).toLocaleDateString()} -{" "}
                {new Date(lead.leadId.toDate).toLocaleDateString()}
              </p>
            )}
            {lead?.leadId?.destination && <p className="text-lg">Destination: {lead.leadId.destination}</p>}
          </div>

          {/* Overview */}
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
              Trip Overview
            </h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: itineraryDescription }}></div>
          </div>

          {/* Itinerary Days */}
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
              Day-by-Day Itinerary
            </h2>

            {itineraryDays.map((day) => (
              <div
                key={day.id}
                className={`mb-8 p-6 rounded-lg ${
                  pdfTheme === "light" ? "bg-gray-50" : pdfTheme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                }`}
              >
                <h3 className={`text-xl font-semibold mb-2 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
                  Day {day.dayNumber}: {day.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {day.date && (
                    <span
                      className={`inline-flex items-center text-sm ${
                        pdfTheme === "colorful" ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      <FaCalendarAlt className="mr-1" /> {new Date(day.date).toLocaleDateString()}
                    </span>
                  )}

                  {day.location && (
                    <span
                      className={`inline-flex items-center text-sm ${
                        pdfTheme === "colorful" ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      <FaMapMarkerAlt className="mr-1" /> {day.location}
                    </span>
                  )}
                </div>

                {/* Included Services */}
                {(day.includedServices.meals ||
                  day.includedServices.transport ||
                  day.includedServices.guide ||
                  day.includedServices.accommodation) && (
                  <div className="mb-3">
                    <p className="font-medium mb-1">Included Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {day.includedServices.meals && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            pdfTheme === "colorful"
                              ? "bg-green-100 text-green-800"
                              : pdfTheme === "dark"
                                ? "bg-green-900 text-green-100"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          <FaUtensils className="mr-1" /> Meals
                        </span>
                      )}
                      {day.includedServices.transport && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            pdfTheme === "colorful"
                              ? "bg-blue-100 text-blue-800"
                              : pdfTheme === "dark"
                                ? "bg-blue-900 text-blue-100"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <FaBus className="mr-1" /> Transport
                        </span>
                      )}
                      {day.includedServices.guide && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            pdfTheme === "colorful"
                              ? "bg-yellow-100 text-yellow-800"
                              : pdfTheme === "dark"
                                ? "bg-yellow-900 text-yellow-100"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <FaUser className="mr-1" /> Guide
                        </span>
                      )}
                      {day.includedServices.accommodation && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            pdfTheme === "colorful"
                              ? "bg-purple-100 text-purple-800"
                              : pdfTheme === "dark"
                                ? "bg-purple-900 text-purple-100"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          <FaBed className="mr-1" /> Accommodation
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {day.description && (
                  <div className="mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: day.description }}></div>
                )}

                {/* Activities */}
                {day.activities.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-medium mb-2 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
                      Activities:
                    </h4>
                    <div className="space-y-3">
                      {day.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className={`p-3 rounded ${
                            pdfTheme === "light" ? "bg-white" : pdfTheme === "dark" ? "bg-gray-700" : "bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <FaClock className={`mr-2 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`} />
                            <span className="font-medium">
                              {activity.time.charAt(0).toUpperCase() + activity.time.slice(1)}: {activity.title}
                            </span>
                          </div>

                          {activity.description && <p className="ml-6 text-sm mb-1">{activity.description}</p>}

                          {activity.location && (
                            <div className="ml-6 text-sm flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-gray-500" />
                              <span className="text-gray-500">{activity.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {pdfIncludeImages && day.images.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-2 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>Images:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {day.images.slice(0, 2).map((img, idx) => (
                        <img
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt={`Day ${day.dayNumber} - Image ${idx + 1}`}
                          className="w-full h-40 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Details */}
          {pdfIncludeDetails && (
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}>
                Additional Details
              </h2>

              {/* Travelers */}
              {travelers.length > 0 && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    pdfTheme === "light" ? "bg-gray-50" : pdfTheme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 flex items-center ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}
                  >
                    <FaPassport className="mr-2" /> Travelers
                  </h3>
                  <ul className="space-y-2">
                    {travelers.map((traveler) => (
                      <li key={traveler.id} className="flex flex-col">
                        <span className="font-medium">{traveler.name}</span>
                        <span className="text-sm">
                          Passport: {traveler.passport}, Age: {traveler.age}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hotels */}
              {hotels.length > 0 && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    pdfTheme === "light" ? "bg-gray-50" : pdfTheme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 flex items-center ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}
                  >
                    <FaHotel className="mr-2" /> Hotel Accommodations
                  </h3>
                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="font-medium">
                          {hotel.name} - {hotel.roomType}
                        </div>
                        <div className="text-sm">
                          Check-in: {hotel.checkIn}, Check-out: {hotel.checkOut}
                        </div>
                        {hotel.notes && <div className="text-sm italic mt-1">{hotel.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights */}
              {flights.length > 0 && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    pdfTheme === "light" ? "bg-gray-50" : pdfTheme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 flex items-center ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}
                  >
                    <FaPlane className="mr-2" /> Flight Details
                  </h3>
                  <div className="space-y-4">
                    {flights.map((flight) => (
                      <div key={flight.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="font-medium">
                          {flight.airline} {flight.flightNumber}
                        </div>
                        <div className="text-sm">
                          Departure: {flight.departureAirport} on {flight.departureDate} at {flight.departureTime}
                        </div>
                        <div className="text-sm">
                          Arrival: {flight.arrivalAirport} on {flight.arrivalDate} at {flight.arrivalTime}
                        </div>
                        {flight.notes && <div className="text-sm italic mt-1">{flight.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visas */}
              {visas.length > 0 && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    pdfTheme === "light" ? "bg-gray-50" : pdfTheme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 flex items-center ${pdfTheme === "colorful" ? "text-blue-600" : ""}`}
                  >
                    <FaGlobe className="mr-2" /> Visa Information
                  </h3>
                  <div className="space-y-4">
                    {visas.map((visa) => (
                      <div key={visa.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="font-medium">
                          {visa.country} - {visa.type} Visa
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              visa.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : visa.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : visa.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {visa.status.charAt(0).toUpperCase() + visa.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm">Processing Time: {visa.processingTime}</div>
                        {visa.requirements && <div className="text-sm">Requirements: {visa.requirements}</div>}
                        {visa.notes && <div className="text-sm italic mt-1">{visa.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm mt-12 pt-4 border-t">
            <p>This itinerary is subject to change based on local conditions and availability.</p>
            <p className="mt-1">Please refer to your travel documents for final details.</p>
            <p className="mt-4">Your Travel Agency</p>
            <p>Contact: info@yourtravelagency.com | +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    )
  }

  if (loadingFile) {
    return (
      <div className="bg-white p-6 rounded shadow-md z-50 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow-md z-50 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded shadow-md z-50 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Create Day-by-Day Itinerary</h1>
        <div className="flex gap-2">
          {viewMode !== "preview" && (
            <>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                onClick={() => setViewMode("preview")}
              >
                <FaEye className="mr-2 h-4 w-4" />
                Preview
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setItineraryWindow("")}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                onClick={handleSaveItinerary}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Itinerary"}
                <FaSave className="ml-2 h-4 w-4" />
              </button>
            </>
          )}

          {viewMode === "preview" && (
            <>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                onClick={() => setViewMode("create")}
              >
                <FaEdit className="mr-2 h-4 w-4" />
                Edit
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                onClick={generatePDF}
                disabled={pdfGenerating}
              >
                {pdfGenerating ? (
                  <>
                    <span>Generating... {pdfProgress}%</span>
                  </>
                ) : (
                  <>
                    <FaFilePdf className="mr-2 h-4 w-4" />
                    Export PDF
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lead Details */}
      {lead && viewMode !== "preview" && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <p>
              <strong>Name:</strong> {lead?.leadId?.name}
            </p>
            <p>
              <strong>Email:</strong> {lead?.leadId?.email}
            </p>
            <p>
              <strong>Phone:</strong> {lead?.leadId?.phoneNumber}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <p>
              <strong>Travel Dates:</strong> {lead?.leadId?.fromDate && new Date(lead.leadId.fromDate).toDateString()} -{" "}
              {lead?.leadId?.toDate && new Date(lead.leadId.toDate).toDateString()}
            </p>
            <p>
              <strong>Service Type:</strong> {lead?.leadId?.serviceType}
            </p>
            <p>
              <strong>Destination:</strong> {lead?.leadId?.destination}
            </p>
          </div>
        </div>
      )}

      {viewMode === "preview" ? (
        <div>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3">PDF Export Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={pdfTheme}
                  onChange={(e) => setPdfTheme(e.target.value as "light" | "dark" | "colorful")}
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="colorful">Colorful Theme</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={pdfIncludeImages}
                    onChange={(e) => setPdfIncludeImages(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Include Images</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={pdfIncludeDetails}
                    onChange={(e) => setPdfIncludeDetails(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Include Additional Details</span>
                </label>
              </div>
            </div>
          </div>

          {renderPreview()}
        </div>
      ) : viewMode === "template" ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Select a Predefined Itinerary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predefinedItineraries.map((itinerary) => (
              <div
                key={itinerary._id}
                className="border rounded-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectPredefinedItinerary(itinerary._id)}
              >
                <div className="relative h-40">
                  <img src={"/placeholder.svg"} alt={itinerary.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {itinerary.days.length} days
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{itinerary.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{itinerary.title}</p>
                  <p className="text-sm">{itinerary.description}</p>
                  <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    Select This Itinerary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Mode Selection */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                className={`px-4 py-2 rounded-l-md ${
                  viewMode === "create"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setViewMode("create")}
              >
                Create Custom Itinerary
              </button>
              <button
                className={`px-4 py-2 rounded-r-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                onClick={() => setViewMode("template")}
              >
                Use Template
              </button>
            </div>
          </div>

          {/* Itinerary Title and Description */}
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="itineraryTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Itinerary Title
              </label>
              <input
                id="itineraryTitle"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={itineraryTitle}
                onChange={(e) => setItineraryTitle(e.target.value)}
                placeholder="Enter itinerary title"
              />
            </div>

            <div>
              <label htmlFor="itineraryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Itinerary Overview
              </label>
              <ReactQuill
                theme="snow"
                value={itineraryDescription}
                onChange={setItineraryDescription}
                placeholder="Provide an overview of the entire itinerary"
              />
            </div>
            <button
              onClick={formatAndInsertIntoEditor}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center"
            >
              <FaPlus className="mr-1 h-3 w-3" />
              Insert Details into Overview
            </button>
          </div>

          {/* Main Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === "itinerary"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("itinerary")}
                >
                  Itinerary
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === "travelers"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("travelers")}
                >
                  Travelers
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === "accommodations"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("accommodations")}
                >
                  Accommodations
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === "transport"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("transport")}
                >
                  Transport
                </button>
              </nav>
            </div>

            {/* Itinerary Tab */}
            {activeTab === "itinerary" && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Days List */}
                  <div className="md:col-span-1 border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Days</h2>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                        onClick={handleAddDay}
                      >
                        <FaPlus className="h-3 w-3 mr-1" />
                        Add Day
                      </button>
                    </div>

                    <div className="h-[400px] overflow-y-auto pr-3">
                      <div className="space-y-2">
                        {itineraryDays.map((day, index) => (
                          <div
                            key={day.id}
                            className={`p-3 border rounded-md ${
                              activeDay === day.id ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div
                                className="font-medium cursor-pointer flex-grow"
                                onClick={() => setActiveDay(day.id)}
                              >
                                Day {day.dayNumber}: {day.title}
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  className="text-gray-500 hover:text-blue-500 p-1"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                  title="Move Up"
                                >
                                  <FaArrowUp className={`h-3 w-3 ${index === 0 ? "opacity-30" : ""}`} />
                                </button>
                                <button
                                  className="text-gray-500 hover:text-blue-500 p-1"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === itineraryDays.length - 1}
                                  title="Move Down"
                                >
                                  <FaArrowDown
                                    className={`h-3 w-3 ${index === itineraryDays.length - 1 ? "opacity-30" : ""}`}
                                  />
                                </button>
                                <button
                                  className="text-gray-500 hover:text-red-500 p-1"
                                  onClick={() => handleRemoveDay(day.id)}
                                  title="Remove Day"
                                >
                                  <FaTrashAlt className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            {day.date && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <FaCalendarAlt className="h-3 w-3 mr-1" />
                                {new Date(day.date).toLocaleDateString()}
                              </div>
                            )}
                            {day.location && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                                {day.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {itineraryDays.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No days added yet.</p>
                        <p className="text-sm mt-2">Click "Add Day" to start creating your itinerary.</p>
                      </div>
                    )}
                  </div>

                  {/* Day Details */}
                  <div className="md:col-span-2 border rounded-md p-4">
                    {activeDay ? (
                      (() => {
                        const day = itineraryDays.find((d) => d.id === activeDay)
                        if (!day) return null

                        return (
                          <div className="space-y-6">
                            <h2 className="text-lg font-medium">Day {day.dayNumber} Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="dayTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                  Title
                                </label>
                                <input
                                  id="dayTitle"
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={day.title}
                                  onChange={(e) => handleUpdateDay(day.id, "title", e.target.value)}
                                  placeholder="Day title (e.g., Arrival in Paris)"
                                />
                              </div>

                              <div>
                                <label htmlFor="dayDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Date (Optional)
                                </label>
                                <input
                                  id="dayDate"
                                  type="date"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={day.date || ""}
                                  onChange={(e) => handleUpdateDay(day.id, "date", e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="dayLocation" className="block text-sm font-medium text-gray-700 mb-1">
                                Location (Optional)
                              </label>
                              <input
                                id="dayLocation"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={day.location || ""}
                                onChange={(e) => handleUpdateDay(day.id, "location", e.target.value)}
                                placeholder="Location (e.g., Paris, France)"
                              />
                            </div>

                            <div>
                              <label htmlFor="dayDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <ReactQuill
                                theme="snow"
                                value={day.description}
                                onChange={(value) => handleUpdateDay(day.id, "description", value)}
                                placeholder="Describe the day's activities and highlights"
                              />
                            </div>

                            {/* Included Services */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Included Services</label>
                              <div className="flex flex-wrap gap-3">
                                <div
                                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                                    day.includedServices.meals ? "bg-green-50 border-green-300" : "bg-white"
                                  }`}
                                  onClick={() => handleToggleService(day.id, "meals")}
                                >
                                  <FaUtensils className="h-4 w-4 mr-2" />
                                  <span>Meals</span>
                                </div>
                                <div
                                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                                    day.includedServices.transport ? "bg-green-50 border-green-300" : "bg-white"
                                  }`}
                                  onClick={() => handleToggleService(day.id, "transport")}
                                >
                                  <FaBus className="h-4 w-4 mr-2" />
                                  <span>Transport</span>
                                </div>
                                <div
                                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                                    day.includedServices.guide ? "bg-green-50 border-green-300" : "bg-white"
                                  }`}
                                  onClick={() => handleToggleService(day.id, "guide")}
                                >
                                  <FaUser className="h-4 w-4 mr-2" />
                                  <span>Guide</span>
                                </div>
                                <div
                                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                                    day.includedServices.accommodation ? "bg-green-50 border-green-300" : "bg-white"
                                  }`}
                                  onClick={() => handleToggleService(day.id, "accommodation")}
                                >
                                  <FaBed className="h-4 w-4 mr-2" />
                                  <span>Accommodation</span>
                                </div>
                              </div>
                            </div>

                            {/* Time-based Activities */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Time-based Activities</label>
                                <button
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                                  onClick={() => handleAddActivity(day.id)}
                                >
                                  <FaPlus className="h-3 w-3 mr-1" />
                                  Add Activity
                                </button>
                              </div>

                              {day.activities.length > 0 ? (
                                <div className="space-y-4">
                                  {day.activities.map((activity) => (
                                    <div key={activity.id} className="border rounded-md p-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                          <FaClock className="h-4 w-4 mr-2 text-gray-500" />
                                          <select
                                            className="p-1 border border-gray-300 rounded-md text-sm"
                                            value={activity.time}
                                            onChange={(e) =>
                                              handleUpdateActivity(day.id, activity.id, "time", e.target.value)
                                            }
                                          >
                                            <option value="morning">Morning</option>
                                            <option value="afternoon">Afternoon</option>
                                            <option value="evening">Evening</option>
                                          </select>
                                        </div>
                                        <button
                                          className="text-gray-500 hover:text-red-500"
                                          onClick={() => handleRemoveActivity(day.id, activity.id)}
                                        >
                                          <FaTrashAlt className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="space-y-2">
                                        <input
                                          type="text"
                                          className="w-full p-2 border border-gray-300 rounded-md"
                                          value={activity.title}
                                          onChange={(e) =>
                                            handleUpdateActivity(day.id, activity.id, "title", e.target.value)
                                          }
                                          placeholder="Activity title"
                                        />

                                        <textarea
                                          className="w-full p-2 border border-gray-300 rounded-md"
                                          value={activity.description}
                                          onChange={(e) =>
                                            handleUpdateActivity(day.id, activity.id, "description", e.target.value)
                                          }
                                          placeholder="Activity description"
                                          rows={2}
                                        />

                                        <div className="flex items-center">
                                          <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-500" />
                                          <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={activity.location || ""}
                                            onChange={(e) =>
                                              handleUpdateActivity(day.id, activity.id, "location", e.target.value)
                                            }
                                            placeholder="Activity location (optional)"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 border rounded-md text-gray-500">
                                  <p>No activities added yet.</p>
                                  <p className="text-sm mt-1">Click "Add Activity" to add time-based activities.</p>
                                </div>
                              )}
                            </div>

                            {/* Images */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Images</label>
                                <label className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm cursor-pointer">
                                  <FaImage className="h-3 w-3 mr-1" />
                                  <span>{uploadingImages[day.id] ? "Uploading..." : "Upload Images"}</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(day.id, e)}
                                    disabled={uploadingImages[day.id] || bunnyLoading}
                                  />
                                </label>
                              </div>

                              {day.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {day.images.map((imageUrl, index) => (
                                    <div key={index} className="relative group">
                                      <img
                                        src={imageUrl || "/placeholder.svg"}
                                        alt={`Day ${day.dayNumber} - Image ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md"
                                      />
                                      <button
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(day.id, imageUrl)}
                                      >
                                        <FaTrashAlt className="h-4 w-4 text-red-500" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 border rounded-md text-gray-500">
                                  <p>No images added yet.</p>
                                  <p className="text-sm mt-1">Click "Upload Images" to add images for this day.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Select a day from the list or add a new day to edit details.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Travelers Tab */}
            {activeTab === "travelers" && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Travelers Information</h2>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                    onClick={handleAddTraveler}
                  >
                    <FaPlus className="h-3 w-3 mr-1" />
                    Add Traveler
                  </button>
                </div>

                {travelers.length > 0 ? (
                  <div className="space-y-4">
                    {travelers.map((traveler) => (
                      <div key={traveler.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Traveler Details</h3>
                          <button
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => handleRemoveTraveler(traveler.id)}
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={traveler.name}
                              onChange={(e) => handleUpdateTraveler(traveler.id, "name", e.target.value)}
                              placeholder="Full Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={traveler.passport}
                              onChange={(e) => handleUpdateTraveler(traveler.id, "passport", e.target.value)}
                              placeholder="Passport Number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={traveler.age || ""}
                              onChange={(e) =>
                                handleUpdateTraveler(traveler.id, "age", Number.parseInt(e.target.value) || 0)
                              }
                              placeholder="Age"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-md text-gray-500">
                    <p>No travelers added yet.</p>
                    <p className="text-sm mt-1">Click "Add Traveler" to add traveler information.</p>
                  </div>
                )}
              </div>
            )}

            {/* Accommodations Tab */}
            {activeTab === "accommodations" && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Hotel Accommodations</h2>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                      onClick={handleAddHotel}
                    >
                      <FaPlus className="h-3 w-3 mr-1" />
                      Add Hotel
                    </button>
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                      onClick={formatAndInsertIntoEditor}
                    >
                      Insert to Description
                    </button>
                  </div>
                </div>

                {hotels.length > 0 ? (
                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Hotel Details</h3>
                          <button
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => handleRemoveHotel(hotel.id)}
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={hotel.name}
                              onChange={(e) => handleUpdateHotel(hotel.id, "name", e.target.value)}
                            >
                              <option value="">Select a hotel</option>
                              {availableHotels.map((hotelName) => (
                                <option key={hotelName._id} value={hotelName.name}>
                                  {hotelName.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={hotel.roomType}
                              onChange={(e) => handleUpdateHotel(hotel.id, "roomType", e.target.value)}
                            >
                              <option value="">Select room type</option>
                              <option value="Standard">Standard</option>
                              <option value="Deluxe">Deluxe</option>
                              <option value="Suite">Suite</option>
                              <option value="Executive">Executive</option>
                              <option value="Family">Family</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                            <input
                              type="date"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={hotel.checkIn}
                              onChange={(e) => handleUpdateHotel(hotel.id, "checkIn", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                            <input
                              type="date"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={hotel.checkOut}
                              onChange={(e) => handleUpdateHotel(hotel.id, "checkOut", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={hotel.notes}
                              onChange={(e) => handleUpdateHotel(hotel.id, "notes", e.target.value)}
                              placeholder="Additional notes about the hotel accommodation"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-md text-gray-500">
                    <p>No hotels added yet.</p>
                    <p className="text-sm mt-1">Click "Add Hotel" to add hotel accommodations.</p>
                  </div>
                )}
              </div>
            )}

            {/* Transport Tab */}
            {activeTab === "transport" && (
              <div className="mt-4 space-y-4">
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex">
                    <button
                      className={`py-2 px-4 font-medium ${
                        transportTab === "flights"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setTransportTab("flights")}
                    >
                      Flights
                    </button>
                    <button
                      className={`py-2 px-4 font-medium ${
                        transportTab === "visas"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setTransportTab("visas")}
                    >
                      Visas
                    </button>
                  </nav>
                </div>

                {transportTab === "flights" && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Flight Details</h2>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                          onClick={handleAddFlight}
                        >
                          <FaPlus className="h-3 w-3 mr-1" />
                          Add Flight
                        </button>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                          onClick={formatAndInsertIntoEditor}
                        >
                          Insert to Description
                        </button>
                      </div>
                    </div>

                    {flights.length > 0 ? (
                      <div className="space-y-4">
                        {flights.map((flight) => (
                          <div key={flight.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Flight Details</h3>
                              <button
                                className="text-red-500 hover:text-red-700 p-1"
                                onClick={() => handleRemoveFlight(flight.id)}
                              >
                                <FaTrashAlt className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.airline}
                                  onChange={(e) => handleUpdateFlight(flight.id, "airline", e.target.value)}
                                  placeholder="Airline Name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.flightNumber}
                                  onChange={(e) => handleUpdateFlight(flight.id, "flightNumber", e.target.value)}
                                  placeholder="e.g., AA123"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                                <input
                                  type="date"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.departureDate}
                                  onChange={(e) => handleUpdateFlight(flight.id, "departureDate", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                                <input
                                  type="time"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.departureTime}
                                  onChange={(e) => handleUpdateFlight(flight.id, "departureTime", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Departure Airport
                                </label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.departureAirport}
                                  onChange={(e) => handleUpdateFlight(flight.id, "departureAirport", e.target.value)}
                                  placeholder="e.g., JFK"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                                <input
                                  type="date"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.arrivalDate}
                                  onChange={(e) => handleUpdateFlight(flight.id, "arrivalDate", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                                <input
                                  type="time"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.arrivalTime}
                                  onChange={(e) => handleUpdateFlight(flight.id, "arrivalTime", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.arrivalAirport}
                                  onChange={(e) => handleUpdateFlight(flight.id, "arrivalAirport", e.target.value)}
                                  placeholder="e.g., LAX"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={flight.notes}
                                  onChange={(e) => handleUpdateFlight(flight.id, "notes", e.target.value)}
                                  placeholder="Additional notes about the flight"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md text-gray-500">
                        <p>No flights added yet.</p>
                        <p className="text-sm mt-1">Click "Add Flight" to add flight details.</p>
                      </div>
                    )}
                  </>
                )}

                {transportTab === "visas" && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Visa Information</h2>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                          onClick={handleAddVisa}
                        >
                          <FaPlus className="h-3 w-3 mr-1" />
                          Add Visa
                        </button>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                          onClick={formatAndInsertIntoEditor}
                        >
                          Insert to Description
                        </button>
                      </div>
                    </div>

                    {visas.length > 0 ? (
                      <div className="space-y-4">
                        {visas.map((visa) => (
                          <div key={visa.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Visa Details</h3>
                              <button
                                className="text-red-500 hover:text-red-700 p-1"
                                onClick={() => handleRemoveVisa(visa.id)}
                              >
                                <FaTrashAlt className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.country}
                                  onChange={(e) => handleUpdateVisa(visa.id, "country", e.target.value)}
                                  placeholder="Country requiring visa"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.type}
                                  onChange={(e) => handleUpdateVisa(visa.id, "type", e.target.value)}
                                >
                                  <option value="">Select visa type</option>
                                  <option value="Tourist">Tourist</option>
                                  <option value="Business">Business</option>
                                  <option value="Transit">Transit</option>
                                  <option value="Student">Student</option>
                                  <option value="Work">Work</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.processingTime}
                                  onChange={(e) => handleUpdateVisa(visa.id, "processingTime", e.target.value)}
                                  placeholder="e.g., 2-3 weeks"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.status}
                                  onChange={(e) => handleUpdateVisa(visa.id, "status", e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-process">In Process</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="not-required">Not Required</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.requirements}
                                  onChange={(e) => handleUpdateVisa(visa.id, "requirements", e.target.value)}
                                  placeholder="List of required documents"
                                  rows={2}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={visa.notes}
                                  onChange={(e) => handleUpdateVisa(visa.id, "notes", e.target.value)}
                                  placeholder="Additional notes about the visa"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md text-gray-500">
                        <p>No visa information added yet.</p>
                        <p className="text-sm mt-1">Click "Add Visa" to add visa details.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ItineraryComponent
