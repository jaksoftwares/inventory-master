'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierCustomersView from '@/components/supplier/SupplierCustomersView';

export default function SupplierCustomersPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierCustomersView />
      </SupplierLayout>
    </SupplierProvider>
  );
}