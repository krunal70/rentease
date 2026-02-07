// User Types
export type UserRole = 'tenant' | 'landlord' | 'property_manager';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
    createdAt: Date;
}

// Property Types
export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'studio';
export type PetPolicy = 'allowed' | 'not_allowed' | 'case_by_case';
export type PropertyStatus = 'available' | 'pending' | 'rented';

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    address: Address;
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    price: number;
    deposit: number;
    amenities: string[];
    images: string[];
    availableFrom: Date;
    petPolicy: PetPolicy;
    ownerId: string;
    status: PropertyStatus;
    createdAt: Date;
    owner?: {
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    } | null;
}

// Application Types
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface PersonalInfo {
    fullName: string;
    dateOfBirth: Date;
    ssn?: string;
    phoneNumber: string;
}

export interface Employment {
    employer: string;
    position: string;
    income: number;
    duration: string;
}

export interface RentalHistory {
    currentAddress: string;
    landlordName?: string;
    landlordPhone?: string;
    monthlyRent: number;
    duration: string;
}

export interface Application {
    id: string;
    propertyId: string;
    applicantId: string;
    status: ApplicationStatus;
    personalInfo: PersonalInfo;
    employment: Employment;
    rentalHistory: RentalHistory;
    documents: string[];
    submittedAt: Date;
    property?: any; // Using any to avoid circular dependency issues or complex type mapping for now
    applicant?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

// Message Types
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: string[];
    createdAt: Date;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    propertyId?: string;
    lastMessage?: Message;
    createdAt: Date;
}

// Search/Filter Types
export interface PropertyFilters {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: PropertyType[];
    petPolicy?: PetPolicy;
    city?: string;
    state?: string;
}
