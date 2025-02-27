// src/types/app.ts
export interface User {
    id: string;
    telegram_id: number;
    username: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    address: string;
    created_at: string;
    is_admin?: boolean;
  }
  
  export interface SavedLocation {
    id: number;
    name: string;
    short_name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface Ride {
    id: number;
    created_by: string;
    is_immediate: boolean;
    pickup_datetime: string;
    pickup_address: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    dropoff_address: string;
    client_phone: string;
    payment_method: 'commission' | 'direct';
    status: 'pending' | 'assigned' | 'completed' | 'cancelled';
    assigned_to: string | null;
    current_group_id: string | null;
    created_at: string;
    completed_at: string | null;
    pickup_location_id?: number;
    dropoff_location_id?: number;
    pickup_location?: SavedLocation;
    dropoff_location?: SavedLocation;
    assigned_driver?: User;
  }
  
  export interface RideInterest {
    id: number;
    ride_id: number;
    driver_id: string;
    latitude: number;
    longitude: number;
    created_at: string;
  }
  
  export interface CreateRideData {
    userId: string;
    isImmediate: boolean;
    pickupDate?: string;
    pickupTime: string;
    pickupLocation: {
      id?: number;
      address: string;
      latitude?: number;
      longitude?: number;
    };
    dropoffLocation: {
      id?: number;
      address: string;
      latitude?: number;
      longitude?: number;
    };
    clientPhone: string;
    paymentMethod: 'commission' | 'direct';
  }
  
  // Types de réponses API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }