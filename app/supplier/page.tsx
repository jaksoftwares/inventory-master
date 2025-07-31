'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierDashboard from '@/components/supplier/SupplierDashboard';

export default function SupplierPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierDashboard />
      </SupplierLayout>
    </SupplierProvider>
  );
}