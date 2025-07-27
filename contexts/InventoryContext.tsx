'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { currencies, dateFormats, timezones } from '@/lib/currencyUtils';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  supplier: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference: string;
  date: Date;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  totalAmount: number;
  orderDate: Date;
  expectedDate: Date;
}

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  lowStockThreshold: number;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  autoBackup: boolean;
}

interface InventoryState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  settings: AppSettings;
}

type InventoryAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'SET_STOCK_MOVEMENTS'; payload: StockMovement[] }
  | { type: 'ADD_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'SET_PURCHASE_ORDERS'; payload: PurchaseOrder[] }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings };

const defaultSettings: AppSettings = {
  companyName: 'Dovepeak Inventory Manager',
  companyEmail: 'admin@dovepeak.com',
  companyPhone: '+1-555-0123',
  companyAddress: '123 Business Street, City, State 12345',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timezone: 'America/New_York',
  lowStockThreshold: 10,
  enableNotifications: true,
  enableEmailAlerts: false,
  autoBackup: true,
};

const initialState: InventoryState = {
  products: [],
  categories: [],
  suppliers: [],
  stockMovements: [],
  purchaseOrders: [],
  settings: defaultSettings,
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
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
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      const existingCategoryIndex = state.categories.findIndex(c => c.id === action.payload.id);
      if (existingCategoryIndex >= 0) {
        // Update existing category
        return {
          ...state,
          categories: state.categories.map(c => 
            c.id === action.payload.id ? action.payload : c
          ),
        };
      } else {
        // Add new category
        return { ...state, categories: [...state.categories, action.payload] };
      }
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'ADD_SUPPLIER':
      const existingSupplierIndex = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (existingSupplierIndex >= 0) {
        // Update existing supplier
        return {
          ...state,
          suppliers: state.suppliers.map(s => 
            s.id === action.payload.id ? action.payload : s
          ),
        };
      } else {
        // Add new supplier
        return { ...state, suppliers: [...state.suppliers, action.payload] };
      }
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.payload),
      };
    case 'SET_STOCK_MOVEMENTS':
      return { ...state, stockMovements: action.payload };
    case 'ADD_STOCK_MOVEMENT':
      return { ...state, stockMovements: [...state.stockMovements, action.payload] };
    case 'SET_PURCHASE_ORDERS':
      return { ...state, purchaseOrders: action.payload };
    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: [...state.purchaseOrders, action.payload] };
    case 'UPDATE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map(po => 
          po.id === action.payload.id ? action.payload : po
        ),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  saveToStorage: () => void;
} | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  useEffect(() => {
    // Load data from localStorage on mount
    const savedData = localStorage.getItem('dovepeak-inventory-data');
    const savedSettings = localStorage.getItem('dovepeak-inventory-settings');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Parse dates properly when loading from localStorage
        const products = (parsedData.products || []).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        
        const categories = (parsedData.categories || []).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        }));
        
        const suppliers = (parsedData.suppliers || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        }));
        
        const stockMovements = (parsedData.stockMovements || []).map((sm: any) => ({
          ...sm,
          date: new Date(sm.date),
        }));
        
        const purchaseOrders = (parsedData.purchaseOrders || []).map((po: any) => ({
          ...po,
          orderDate: new Date(po.orderDate),
          expectedDate: new Date(po.expectedDate),
        }));
        
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        dispatch({ type: 'SET_SUPPLIERS', payload: suppliers });
        dispatch({ type: 'SET_STOCK_MOVEMENTS', payload: stockMovements });
        dispatch({ type: 'SET_PURCHASE_ORDERS', payload: purchaseOrders });
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        // Initialize with sample data if loading fails
        initializeSampleData();
      }
    } else {
      // Initialize with sample data
      initializeSampleData();
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...defaultSettings, ...parsedSettings } });
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }
  }, []);

  const initializeSampleData = () => {
    const sampleCategories: Category[] = [
      { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', createdAt: new Date() },
      { id: '2', name: 'Clothing', description: 'Apparel and fashion items', createdAt: new Date() },
      { id: '3', name: 'Books', description: 'Books and publications', createdAt: new Date() },
    ];

    const sampleSuppliers: Supplier[] = [
      { id: '1', name: 'TechCorp Ltd', email: 'orders@techcorp.com', phone: '+1-555-0123', address: '123 Tech Street, Silicon Valley', createdAt: new Date() },
      { id: '2', name: 'Fashion Forward', email: 'supply@fashionforward.com', phone: '+1-555-0456', address: '456 Fashion Ave, New York', createdAt: new Date() },
    ];

    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Headphones',
        sku: 'WH-001',
        category: 'Electronics',
        price: 99.99,
        cost: 60.00,
        quantity: 45,
        minStock: 10,
        supplier: 'TechCorp Ltd',
        description: 'High-quality wireless Bluetooth headphones',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Cotton T-Shirt',
        sku: 'TS-001',
        category: 'Clothing',
        price: 24.99,
        cost: 12.00,
        quantity: 8,
        minStock: 15,
        supplier: 'Fashion Forward',
        description: '100% cotton comfortable t-shirt',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Programming Guide',
        sku: 'BK-001',
        category: 'Books',
        price: 39.99,
        cost: 20.00,
        quantity: 25,
        minStock: 5,
        supplier: 'TechCorp Ltd',
        description: 'Complete guide to modern programming',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    dispatch({ type: 'SET_CATEGORIES', payload: sampleCategories });
    dispatch({ type: 'SET_SUPPLIERS', payload: sampleSuppliers });
    dispatch({ type: 'SET_PRODUCTS', payload: sampleProducts });
  };

  const saveToStorage = () => {
    const dataToSave = {
      products: state.products,
      categories: state.categories,
      suppliers: state.suppliers,
      stockMovements: state.stockMovements,
      purchaseOrders: state.purchaseOrders,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('dovepeak-inventory-data', JSON.stringify(dataToSave));
    localStorage.setItem('dovepeak-inventory-settings', JSON.stringify(state.settings));
    console.log('Data saved to localStorage:', dataToSave);
  };

  useEffect(() => {
    // Save to storage whenever state changes
    saveToStorage();
  }, [state]);

  return (
    <InventoryContext.Provider value={{ state, dispatch, saveToStorage }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}