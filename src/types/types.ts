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
    _id?: string;
    packageId?: string;
    tourType?: string;
    visaName: string;
    price: string;
    visaType?: string;
    entryType?: string;
    validity?: string;
    visaCategory?: string;
    leadBy?: string;
    company_id?: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: string;
    ageGroup: string;
    dob: string;
    fathersName: string;
    mothersName: string;
    passport: string;
    passportIssueDate: Date;
    passportExpiryDate: Date;
    status: string;
    documents: Record<string, string>;
    createdAt: string;
  }
  
  export type {
    emp,
    company,
    Country,
    Tours,
    Package,
    documents,
    Lead,
  };
  