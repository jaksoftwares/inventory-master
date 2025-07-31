'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface SupplierProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  description: string;
  images: string[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastOrderDate?: Date;
}

export interface SupplierOrder {
  id: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  orderDate: Date;
  expectedDelivery?: Date;
  shippingAddress: string;
  notes?: string;
  trackingNumber?: string;
}

export interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: 'inquiry' | 'order_update' | 'complaint' | 'general';
  subject: string;
  message: string;
  response?: string;
  status: 'unread' | 'read' | 'responded' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  respondedAt?: Date;
}

export interface SupplierSettings {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  shippingPolicy: string;
  returnPolicy: string;
  taxRate: number;
  currency: string;
  autoConfirmOrders: boolean;
  emailNotifications: boolean;
}

interface SupplierState {
  products: SupplierProduct[];
  customers: Customer[];
  orders: SupplierOrder[];
  communications: Communication[];
  settings: SupplierSettings;
  currentSupplier: string | null;
}

type SupplierAction =
  | { type: 'SET_CURRENT_SUPPLIER'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: SupplierProduct[] }
  | { type: 'ADD_PRODUCT'; payload: SupplierProduct }
  | { type: 'UPDATE_PRODUCT'; payload: SupplierProduct }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'SET_ORDERS'; payload: SupplierOrder[] }
  | { type: 'ADD_ORDER'; payload: SupplierOrder }
  | { type: 'UPDATE_ORDER'; payload: SupplierOrder }
  | { type: 'SET_COMMUNICATIONS'; payload: Communication[] }
  | { type: 'ADD_COMMUNICATION'; payload: Communication }
  | { type: 'UPDATE_COMMUNICATION'; payload: Communication }
  | { type: 'UPDATE_SETTINGS'; payload: SupplierSettings };

const defaultSettings: SupplierSettings = {
  companyName: 'My Supply Company',
  contactEmail: 'contact@mysupply.com',
  contactPhone: '+1-555-0123',
  address: '123 Supply Street, Business City, BC 12345',
  businessHours: 'Mon-Fri 9AM-6PM',
  shippingPolicy: 'Standard shipping 3-5 business days',
  returnPolicy: '30-day return policy',
  taxRate: 8.5,
  currency: 'USD',
  autoConfirmOrders: false,
  emailNotifications: true,
};

const initialState: SupplierState = {
  products: [],
  customers: [],
  orders: [],
  communications: [],
  settings: defaultSettings,
  currentSupplier: null,
};

function supplierReducer(state: SupplierState, action: SupplierAction): SupplierState {
  switch (action.type) {
    case 'SET_CURRENT_SUPPLIER':
      return { ...state, currentSupplier: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      const existingCustomerIndex = state.customers.findIndex(c => c.id === action.payload.id);
      if (existingCustomerIndex >= 0) {
        return {
          ...state,
          customers: state.customers.map(c => 
            c.id === action.payload.id ? action.payload : c
          ),
        };
      } else {
        return { ...state, customers: [...state.customers, action.payload] };
      }
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => 
          o.id === action.payload.id ? action.payload : o
        ),
      };
    case 'SET_COMMUNICATIONS':
      return { ...state, communications: action.payload };
    case 'ADD_COMMUNICATION':
      return { ...state, communications: [...state.communications, action.payload] };
    case 'UPDATE_COMMUNICATION':
      return {
        ...state,
        communications: state.communications.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

const SupplierContext = createContext<{
  state: SupplierState;
  dispatch: React.Dispatch<SupplierAction>;
  saveToStorage: () => void;
} | null>(null);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(supplierReducer, initialState);

  useEffect(() => {
    // Load supplier data from localStorage
    const savedData = localStorage.getItem('dovepeak-supplier-data');
    const savedSettings = localStorage.getItem('dovepeak-supplier-settings');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        const products = (parsedData.products || []).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        
        const customers = (parsedData.customers || []).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate) : undefined,
        }));
        
        const orders = (parsedData.orders || []).map((o: any) => ({
          ...o,
          orderDate: new Date(o.orderDate),
          expectedDelivery: o.expectedDelivery ? new Date(o.expectedDelivery) : undefined,
        }));
        
        const communications = (parsedData.communications || []).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          respondedAt: c.respondedAt ? new Date(c.respondedAt) : undefined,
        }));
        
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_CUSTOMERS', payload: customers });
        dispatch({ type: 'SET_ORDERS', payload: orders });
        dispatch({ type: 'SET_COMMUNICATIONS', payload: communications });
      } catch (error) {
        console.error('Failed to load supplier data:', error);
        initializeSampleData();
      }
    } else {
      initializeSampleData();
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...defaultSettings, ...parsedSettings } });
      } catch (error) {
        console.error('Failed to load supplier settings:', error);
      }
    }
  }, []);

  const initializeSampleData = () => {
    const sampleProducts: SupplierProduct[] = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        sku: 'PWH-001',
        category: 'Electronics',
        price: 99.99,
        cost: 60.00,
        quantity: 150,
        minStock: 20,
        description: 'High-quality wireless Bluetooth headphones with noise cancellation',
        images: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Organic Cotton T-Shirt',
        sku: 'OCT-001',
        category: 'Clothing',
        price: 24.99,
        cost: 12.00,
        quantity: 200,
        minStock: 30,
        description: '100% organic cotton comfortable t-shirt',
        images: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        company: 'ABC Electronics',
        totalOrders: 5,
        totalSpent: 1250.00,
        status: 'active',
        createdAt: new Date(),
        lastOrderDate: new Date(),
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@fashionstore.com',
        phone: '+1-555-0456',
        address: '456 Fashion Ave, City, State 67890',
        company: 'Fashion Forward Store',
        totalOrders: 3,
        totalSpent: 750.00,
        status: 'active',
        createdAt: new Date(),
        lastOrderDate: new Date(),
      },
    ];

    const sampleOrders: SupplierOrder[] = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Smith',
        status: 'processing',
        items: [
          {
            productId: '1',
            productName: 'Premium Wireless Headphones',
            quantity: 2,
            unitPrice: 99.99,
            totalPrice: 199.98,
          },
        ],
        subtotal: 199.98,
        tax: 16.00,
        shipping: 15.00,
        totalAmount: 230.98,
        orderDate: new Date(),
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        shippingAddress: '123 Main St, City, State 12345',
        notes: 'Please handle with care',
      },
    ];

    const sampleCommunications: Communication[] = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Smith',
        type: 'inquiry',
        subject: 'Product Availability',
        message: 'Do you have the wireless headphones in stock?',
        status: 'unread',
        priority: 'medium',
        createdAt: new Date(),
      },
    ];

    dispatch({ type: 'SET_PRODUCTS', payload: sampleProducts });
    dispatch({ type: 'SET_CUSTOMERS', payload: sampleCustomers });
    dispatch({ type: 'SET_ORDERS', payload: sampleOrders });
    dispatch({ type: 'SET_COMMUNICATIONS', payload: sampleCommunications });
  };

  const saveToStorage = () => {
    const dataToSave = {
      products: state.products,
      customers: state.customers,
      orders: state.orders,
      communications: state.communications,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('dovepeak-supplier-data', JSON.stringify(dataToSave));
    localStorage.setItem('dovepeak-supplier-settings', JSON.stringify(state.settings));
  };

  useEffect(() => {
    saveToStorage();
  }, [state]);

  return (
    <SupplierContext.Provider value={{ state, dispatch, saveToStorage }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
}