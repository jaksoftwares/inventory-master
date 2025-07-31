'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierCommunicationsView from '@/components/supplier/SupplierCommunicationsView';

export default function SupplierCommunicationsPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierCommunicationsView />
      </SupplierLayout>
    </SupplierProvider>
  );
}