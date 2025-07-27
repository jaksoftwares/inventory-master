'use client';

import { useState } from 'react';
import { useInventory, Supplier } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';

export default function SuppliersView() {
  const { state, dispatch } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData = {
      id: editingSupplier?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      createdAt: editingSupplier?.createdAt || new Date(),
    };

    if (editingSupplier) {
      // Update supplier name in products if changed
      if (editingSupplier.name !== formData.name) {
        state.products.forEach(product => {
          if (product.supplier === editingSupplier.name) {
            dispatch({ 
              type: 'UPDATE_PRODUCT', 
              payload: { ...product, supplier: formData.name, updatedAt: new Date() }
            });
          }
        });
      }
    }
    
    // Add or update the supplier
    dispatch({ type: 'ADD_SUPPLIER', payload: supplierData });

    resetForm();
    setIsAddDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setEditingSupplier(supplier);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (supplierId: string, supplierName: string) => {
    const productsWithSupplier = state.products.filter(p => p.supplier === supplierName);
    
    if (productsWithSupplier.length > 0) {
      alert(`Cannot delete supplier "${supplierName}" because it's associated with ${productsWithSupplier.length} product(s). Please reassign these products first.`);
      return;
    }

    if (confirm('Are you sure you want to delete this supplier?')) {
      dispatch({ type: 'DELETE_SUPPLIER', payload: supplierId });
    }
  };

  const getSupplierProductCount = (supplierName: string) => {
    return state.products.filter(p => p.supplier === supplierName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-2">Manage your supplier relationships</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setEditingSupplier(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Supplier Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingSupplier(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.suppliers.map((supplier) => {
          const productCount = getSupplierProductCount(supplier.name);
          return (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {productCount} product{productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{supplier.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="flex-1">{supplier.address}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-2">
                    Added: {new Date(supplier.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.suppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
            <p className="text-gray-600">
              Add your first supplier to start managing your supply chain
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}