// PropSpera Type Definitions
 
export type UserRole = 'buyer' | 'agent' | 'admin' | 'homeowner';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'villa';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
 
export interface User {
  id: string;
  auth_id?: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}
 
export interface Agent {
  id: string;
  user_id: string;
  user?: User;
  company_name?: string;
  license_number?: string;
  bio?: string;
  years_experience: number;
  specializations: string[];
  verification_status: VerificationStatus;
  verification_documents: string[];
  total_listings: number;
  rating: number;
  created_at: string;
}
 
export interface Property {
  id: string;
  agent_id: string;
 // agent?: Agent; //DIsabled on Feb 17, 2026
 // Attempt to fix the Agent_id type - BKE Feb 17,2026
   agent?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
 // end of attempt 
  title: string;
  description?: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  location: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  featured: boolean;
  views: number;
  created_at: string;
}
 
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
}
 
export interface Conversation {
  id: string;
  buyer_id: string;
  agent_id: string;
  property_id?: string;
  last_message_at: string;
  created_at: string;
  buyer?: User;
  agent?: User;
  property?: Property;
  messages?: Message[];
  unread_count?: number;
}
 
export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}
 
export type InquiryStatus = 'new' | 'pending' | 'responded' | 'closed';
 
export interface Inquiry {
  id: string;
  property_id: string;
  agent_id: string;
  user_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  message: string;
  property_title?: string;
  status: InquiryStatus;
  created_at: string;
  responded_at?: string;
  updated_at?: string;
  email_notification_sent?: boolean;
  notification_sent_at?: string;
  property?: Property;
}
 
export type EmailNotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
 
export interface InquiryNotification {
  id: string;
  inquiry_id: string;
  agent_id: string;
  agent_email: string;
  agent_name?: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  property_title?: string;
  property_id?: string;
  message_preview?: string;
  email_subject?: string;
  email_status: EmailNotificationStatus;
  email_provider_response?: Record<string, unknown>;
  dashboard_link?: string;
  sent_at?: string;
  created_at: string;
  error_message?: string;
}
 
 
export interface SearchFilters {
  query?: string;
  property_type?: PropertyType | 'all';
  listing_type?: ListingType | 'all';
  min_price?: number;
  max_price?: number;
  bedrooms?: number | 'any';
  neighborhood?: string;
  verified_only?: boolean;
}
 
export interface AdminStats {
  total_agents: number;
  pending_agents: number;
  approved_agents: number;
  total_listings: number;
  pending_listings: number;
  approved_listings: number;
  total_buyers: number;
  total_messages: number;
}
 
 
export type NotificationType = 'agent_signup' | 'property_submission' | 'system';
 
export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  agent_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  read_by?: string;
  agent?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    company_name: string;
    avatar_url?: string;
    verification_status: VerificationStatus;
  };
}

