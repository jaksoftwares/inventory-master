'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierProductsView from '@/components/supplier/SupplierProductsView';

export default function SupplierProductsPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierProductsView />
      </SupplierLayout>
    </SupplierProvider>
  );
}