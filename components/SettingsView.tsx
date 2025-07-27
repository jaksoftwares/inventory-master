'use client';

import { useState } from 'react';
import { useInventory, AppSettings } from '@/contexts/InventoryContext';
import { currencies, dateFormats, timezones } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  User,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';

export default function SettingsView() {
  const { state, dispatch } = useInventory();
  const [settings, setSettings] = useState<AppSettings>(state.settings);

  const handleSaveSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    alert('Settings saved successfully!');
  };

  const exportData = () => {
    const dataToExport = {
      products: state.products,
      categories: state.categories,
      suppliers: state.suppliers,
      stockMovements: state.stockMovements,
      purchaseOrders: state.purchaseOrders,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dovepeak-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.products) dispatch({ type: 'SET_PRODUCTS', payload: importedData.products });
        if (importedData.categories) dispatch({ type: 'SET_CATEGORIES', payload: importedData.categories });
        if (importedData.suppliers) dispatch({ type: 'SET_SUPPLIERS', payload: importedData.suppliers });
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.removeItem('dovepeak-inventory-data');
    localStorage.removeItem('dovepeak-inventory-settings');
    window.location.reload();
  };

  const resetToSampleData = () => {
    localStorage.removeItem('dovepeak-inventory-data');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application preferences and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Application Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.code} value={format.code}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.code} value={tz.code}>
                      {tz.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableNotifications">Enable Notifications</Label>
                <p className="text-sm text-gray-600">Receive in-app notifications</p>
              </div>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailAlerts">Email Alerts</Label>
                <p className="text-sm text-gray-600">Receive email notifications for low stock</p>
              </div>
              <Switch
                id="enableEmailAlerts"
                checked={settings.enableEmailAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, enableEmailAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Auto Backup</Label>
                <p className="text-sm text-gray-600">Automatically backup data daily</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={exportData} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <Button asChild className="w-full" variant="outline">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </label>
                </Button>
              </div>
              <Button onClick={resetToSampleData} className="w-full" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Sample Data
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Danger Zone</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your
                      inventory data including products, categories, suppliers, and purchase orders.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData} className="bg-red-600 hover:bg-red-700">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Total Products</p>
              <p className="font-medium">{state.products.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Categories</p>
              <p className="font-medium">{state.categories.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Suppliers</p>
              <p className="font-medium">{state.suppliers.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Stock Movements</p>
              <p className="font-medium">{state.stockMovements.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Purchase Orders</p>
              <p className="font-medium">{state.purchaseOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}