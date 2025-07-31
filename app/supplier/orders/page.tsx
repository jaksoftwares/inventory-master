'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierOrdersView from '@/components/supplier/SupplierOrdersView';

export default function SupplierOrdersPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierOrdersView />
      </SupplierLayout>
    </SupplierProvider>
  );
}