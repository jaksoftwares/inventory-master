'use client';

import { SupplierProvider } from '@/contexts/SupplierContext';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierSettingsView from '@/components/supplier/SupplierSettingsView';

export default function SupplierSettingsPage() {
  return (
    <SupplierProvider>
      <SupplierLayout>
        <SupplierSettingsView />
      </SupplierLayout>
    </SupplierProvider>
  );
}