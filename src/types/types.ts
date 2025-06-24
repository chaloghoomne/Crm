interface emp {
    name: string;
    email: string;
    password: string;
    role?: string;
    _id: string;
  }
  
  interface EmailAccount {
    name: string;
    email: string;
    password: string;
    host: string;
    secure: boolean;
    provider: string;
  }

  interface Hotel {
    _id?: string;
    name: string;
    location: string;
    email: string;
    phoneNumber: string;
    hotelType: string;
  }

  
  interface company {
    companyName?: string;
    address?: string;
    accountNumber?:string;
    ifscCode?:string;
    upi?:string;
    bankName?:string;
    adminEmail?: string;
    subscription?: {
      plan: string;
      status: string;
      expiresAt: string;
    };
    emailAccounts?: EmailAccount[];
    password?: string;
    imgurl?:string;
    _id?: string;
  }
  
  interface Country {
    _id?: string;
    country: string;
    image: string;
  }
  
  interface Tours {
    _id?: string;
    name: string;
    image: string;
  }
  
  interface Package {
    _id?: string;
    visaTypeHeading: string;
    processingTime: string;
    period: string;
    price: string;
    validity: string;
    image: string;
    entryType: string;
    documents: documents[];
  }
  
  interface documents {
    name: string;
    icon: string;
    description: [];
    show: string;
  }
  
  interface Lead {
    _id:string;
    leadBy: string;
    companyId: string;
    agent?: string;
    serviceType: string;
    name: string;
    email: string;
    phoneNumber: string;
    leadType?: string;
    requirements?: string;
    fromDate?: Date;
    toDate?: Date;
    agentName: string;
    assignedEmp:string;
    assignedEmpName:string;
    assignedEmpId:string;
    followUp:[];
    price?: string;
    destination?: string;
  
    country?: string;
    tourType?: string;
    visaCategory?: string;
    visaName?: string;
    validity?: string;
  
    // departureDest?: string;
    // arrivalDest?: string;
    adult?: number;
    child?: number;
    infant?: number;
  

    // insuranceAmount?: string;

    hotelCategory?: string;
  
    flightType?: string;

  
    leadSource?: string;
    priority?: string;
  
    passport?: string;
    status: string;
    documents: Record<string, string>;
    createdAt: Date;
  }

  interface Operations{
    _id:string;
    leadId:Lead;
    companyId:string;
    assignedEmpName:string;
    assignedEmpId:string;
    supplierId:string;
    supplierName:string;
    supplierPrice:string;
    operationStatus:string;
  }

  interface followUp{
    status:string;
    reminder:string;
    remarks:string;
    nextDate:Date;
    date:Date;
    price:number;
  }

  interface Agent{
    _id?:string;
    type:string;
    name:string;
    email:string;
    mobile:string;
  }

  interface Supplier{
    _id?:string;
     company: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  gstNumber: string;
  serviceType: string[];  // Array of strings
  city: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upi: string;
  description: string;
  }

  interface InvoiceItem{
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

  interface Receipt{
    _id?:string
    receiptNumber:string
    date:Date
    amountPaid:number
    total:number
    currency:string
    paymentMode:number
    buyerName:string
    account:string
    note:string
  }

  interface Invoice{
    
_id?:string;
companyId:string;
invoiceNumber:string;
invoiceDate:Date;
dueDate:Date;
receiverName:string;
receiverEmail:string;
receiverPhone:string;
receiverAddress:string;
accountNumber:string;
totalAmount:number;
ifscCode:string;
upiId:string;
bankName:string;
country:string;
currency:string;
tax:string;
discount:string;
shippingCharges:string;
paymentMethod:string;
notes:string;
status:string;
amountPaid:number;
items:InvoiceItem[];

  }
  
  export type {
    emp,
    company,
    Country,
    Tours,
    Package,
    documents,
    Lead,
    Agent,
    followUp,
    Operations,
    Supplier,
    Hotel,
    Invoice,
    InvoiceItem,
    Receipt
  };


  