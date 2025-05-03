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
  
  interface company {
    name: string;
    adminEmail: string;
    subscription?: {
      plan: string;
      status: string;
      expiresAt: string;
    };
    emailAccounts: EmailAccount[];
    password: string;
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
    assignedEmpId:string;
    followUp:[]
  
  
    country?: string;
    tourType?: string;
    visaCategory?: string;
    visaName?: string;
    validity?: string;
  
    departureDest?: string;
    arrivalDest?: string;
    adult?: number;
    child?: number;
    infant?: number;
  

    insuranceAmount?: string;

    hotelCategory?: string;
  
    flightType?: string;

  
    leadSource?: string;
    priority?: string;
  
    passport?: string;
    status: string;
    documents: Record<string, string>;
    createdAt: Date;
  }

  interface followUp{
    status:string;
    reminder:string;
    remarks:string;
    nextDate:Date;
    date:Date;
  }

  interface Agent{
    _id?:string;
    type:string;
    name:string;
    email:string;
    mobile:string;
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
    followUp
  };


  