import { User, Property, Application, Conversation, Message } from "@/types";

// Sample Users
export const mockUsers: User[] = [
    {
        id: "user-1",
        email: "john.tenant@email.com",
        name: "John Smith",
        role: "tenant",
        phone: "(555) 123-4567",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "user-2",
        email: "sarah.landlord@email.com",
        name: "Sarah Johnson",
        role: "landlord",
        phone: "(555) 987-6543",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        createdAt: new Date("2023-06-20"),
    },
    {
        id: "user-3",
        email: "mike.manager@email.com",
        name: "Mike Williams",
        role: "property_manager",
        phone: "(555) 456-7890",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        createdAt: new Date("2023-03-10"),
    },
];

// Sample Properties
export const mockProperties: Property[] = [
    {
        id: "prop-1",
        title: "Modern Downtown Apartment",
        description:
            "Stunning 2-bedroom apartment in the heart of downtown. Features floor-to-ceiling windows, modern appliances, and breathtaking city views. Walking distance to restaurants, shops, and public transit.",
        address: {
            street: "123 Main Street, Apt 4B",
            city: "San Francisco",
            state: "CA",
            zipCode: "94102",
            latitude: 37.7749,
            longitude: -122.4194,
        },
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        price: 3500,
        deposit: 7000,
        amenities: [
            "In-unit Washer/Dryer",
            "Central AC",
            "Gym",
            "Rooftop Deck",
            "Parking",
            "Concierge",
        ],
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        ],
        availableFrom: new Date("2026-02-01"),
        petPolicy: "case_by_case",
        ownerId: "user-2",
        status: "available",
        createdAt: new Date("2025-12-01"),
    },
    {
        id: "prop-2",
        title: "Cozy Suburban House",
        description:
            "Charming 3-bedroom family home in quiet suburban neighborhood. Features a large backyard, updated kitchen, and two-car garage. Near top-rated schools and parks.",
        address: {
            street: "456 Oak Lane",
            city: "Palo Alto",
            state: "CA",
            zipCode: "94301",
            latitude: 37.4419,
            longitude: -122.143,
        },
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 2100,
        price: 4800,
        deposit: 9600,
        amenities: [
            "Backyard",
            "Garage",
            "Central Heat",
            "Hardwood Floors",
            "Fireplace",
            "Storage Shed",
        ],
        images: [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        ],
        availableFrom: new Date("2026-01-15"),
        petPolicy: "allowed",
        ownerId: "user-2",
        status: "available",
        createdAt: new Date("2025-11-15"),
    },
    {
        id: "prop-3",
        title: "Luxury Condo with Bay View",
        description:
            "Exquisite 1-bedroom luxury condo overlooking the bay. Premium finishes throughout including marble countertops, hardwood floors, and designer fixtures. Building amenities include pool, spa, and 24/7 security.",
        address: {
            street: "789 Waterfront Blvd, Unit 1201",
            city: "Oakland",
            state: "CA",
            zipCode: "94607",
            latitude: 37.7955,
            longitude: -122.2789,
        },
        propertyType: "condo",
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 850,
        price: 2800,
        deposit: 5600,
        amenities: [
            "Pool",
            "Spa",
            "Gym",
            "Doorman",
            "Bay View",
            "Balcony",
            "In-unit Laundry",
        ],
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        ],
        availableFrom: new Date("2026-01-01"),
        petPolicy: "not_allowed",
        ownerId: "user-3",
        status: "available",
        createdAt: new Date("2025-12-10"),
    },
    {
        id: "prop-4",
        title: "Urban Studio Loft",
        description:
            "Trendy studio loft in converted warehouse. Exposed brick, high ceilings, and industrial-chic design. Perfect for young professionals seeking a hip urban lifestyle.",
        address: {
            street: "321 Art District Way, #5",
            city: "Berkeley",
            state: "CA",
            zipCode: "94704",
            latitude: 37.8716,
            longitude: -122.2727,
        },
        propertyType: "studio",
        bedrooms: 0,
        bathrooms: 1,
        squareFeet: 550,
        price: 1800,
        deposit: 3600,
        amenities: [
            "High Ceilings",
            "Exposed Brick",
            "Shared Rooftop",
            "Bike Storage",
            "Pet Wash Station",
        ],
        images: [
            "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
        ],
        availableFrom: new Date("2026-02-15"),
        petPolicy: "allowed",
        ownerId: "user-3",
        status: "available",
        createdAt: new Date("2025-12-20"),
    },
    {
        id: "prop-5",
        title: "Elegant Townhouse",
        description:
            "Beautiful 3-story townhouse with private entrance and attached garage. Open-concept living area, gourmet kitchen, and rooftop terrace. Located in vibrant neighborhood with shops and cafes.",
        address: {
            street: "555 Victorian Row",
            city: "San Francisco",
            state: "CA",
            zipCode: "94114",
            latitude: 37.7599,
            longitude: -122.4332,
        },
        propertyType: "townhouse",
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 1800,
        price: 5200,
        deposit: 10400,
        amenities: [
            "Private Garage",
            "Rooftop Terrace",
            "Central AC/Heat",
            "Smart Home",
            "Wine Cellar",
        ],
        images: [
            "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800",
        ],
        availableFrom: new Date("2026-03-01"),
        petPolicy: "case_by_case",
        ownerId: "user-2",
        status: "available",
        createdAt: new Date("2025-12-25"),
    },
    {
        id: "prop-6",
        title: "Budget-Friendly 1BR",
        description:
            "Clean and comfortable 1-bedroom apartment in safe neighborhood. Recently updated with new paint and flooring. Great for students or first-time renters.",
        address: {
            street: "888 College Ave, Apt 2A",
            city: "San Jose",
            state: "CA",
            zipCode: "95112",
            latitude: 37.3382,
            longitude: -121.8863,
        },
        propertyType: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 650,
        price: 1500,
        deposit: 1500,
        amenities: ["Laundry Facility", "Street Parking", "New Appliances"],
        images: [
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        ],
        availableFrom: new Date("2026-01-20"),
        petPolicy: "not_allowed",
        ownerId: "user-3",
        status: "available",
        createdAt: new Date("2025-12-28"),
    },
];

// Sample Applications
export const mockApplications: Application[] = [
    {
        id: "app-1",
        propertyId: "prop-1",
        applicantId: "user-1",
        status: "under_review",
        personalInfo: {
            fullName: "John Smith",
            dateOfBirth: new Date("1990-05-15"),
            phoneNumber: "(555) 123-4567",
        },
        employment: {
            employer: "Tech Corp Inc.",
            position: "Software Engineer",
            income: 120000,
            duration: "3 years",
        },
        rentalHistory: {
            currentAddress: "987 Previous St, San Francisco, CA",
            landlordName: "Previous Landlord",
            landlordPhone: "(555) 999-8888",
            monthlyRent: 2800,
            duration: "2 years",
        },
        documents: ["id_document.pdf", "pay_stubs.pdf", "bank_statements.pdf"],
        submittedAt: new Date("2025-12-30"),
    },
];

// Sample Conversations
export const mockConversations: Conversation[] = [
    {
        id: "conv-1",
        participants: ["user-1", "user-2"],
        propertyId: "prop-1",
        lastMessage: {
            id: "msg-3",
            conversationId: "conv-1",
            senderId: "user-2",
            content: "Yes, we can schedule a viewing for this weekend. Does Saturday at 2pm work?",
            createdAt: new Date("2025-12-31T14:30:00"),
            read: false,
        },
        createdAt: new Date("2025-12-29"),
    },
];

// Sample Messages
export const mockMessages: Message[] = [
    {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "user-1",
        content: "Hi, I'm interested in the Modern Downtown Apartment. Is it still available?",
        createdAt: new Date("2025-12-29T10:00:00"),
        read: true,
    },
    {
        id: "msg-2",
        conversationId: "conv-1",
        senderId: "user-2",
        content: "Hello John! Yes, the apartment is still available. Would you like to schedule a viewing?",
        createdAt: new Date("2025-12-30T09:15:00"),
        read: true,
    },
    {
        id: "msg-3",
        conversationId: "conv-1",
        senderId: "user-1",
        content: "That would be great! When are you available?",
        createdAt: new Date("2025-12-31T11:00:00"),
        read: true,
    },
    {
        id: "msg-4",
        conversationId: "conv-1",
        senderId: "user-2",
        content: "Yes, we can schedule a viewing for this weekend. Does Saturday at 2pm work?",
        createdAt: new Date("2025-12-31T14:30:00"),
        read: false,
    },
];

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
    return mockUsers.find((user) => user.id === id);
}

// Helper function to get property by ID
export function getPropertyById(id: string): Property | undefined {
    return mockProperties.find((property) => property.id === id);
}

// Helper function to get applications by property ID
export function getApplicationsByPropertyId(propertyId: string): Application[] {
    return mockApplications.filter((app) => app.propertyId === propertyId);
}

// Helper function to get applications by applicant ID
export function getApplicationsByApplicantId(applicantId: string): Application[] {
    return mockApplications.filter((app) => app.applicantId === applicantId);
}

// Helper function to get conversations by user ID
export function getConversationsByUserId(userId: string): Conversation[] {
    return mockConversations.filter((conv) => conv.participants.includes(userId));
}

// Helper function to get messages by conversation ID
export function getMessagesByConversationId(conversationId: string): Message[] {
    return mockMessages.filter((msg) => msg.conversationId === conversationId);
}
