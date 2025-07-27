'use client';

import { useState, useMemo } from 'react';
import { useInventory, PurchaseOrder } from '@/contexts/InventoryContext';
import { generatePurchaseOrderPDF } from '@/lib/pdfGenerator';
import { sendEmail, generatePurchaseOrderEmail } from '@/lib/emailService';
import { formatCurrency, formatDate } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, ShoppingCart, Calendar, DollarSign, Package, Trash2, Mail, Download } from 'lucide-react';

export default function PurchaseOrdersView() {
  const { state, dispatch } = useInventory();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    supplierId: '',
    expectedDate: '',
    items: [] as Array<{ productId: string; quantity: number; unitCost: number; }>,
  });
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
  });

  const totalAmount = useMemo(() => {
    return orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  }, [orderData.items]);

  const getSupplierName = (supplierId: string) => {
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const getProductName = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addItemToOrder = () => {
    if (!currentItem.productId || !currentItem.quantity || !currentItem.unitCost) return;

    const newItem = {
      productId: currentItem.productId,
      quantity: parseInt(currentItem.quantity),
      unitCost: parseFloat(currentItem.unitCost),
    };

    setOrderData({
      ...orderData,
      items: [...orderData.items, newItem],
    });

    setCurrentItem({
      productId: '',
      quantity: '',
      unitCost: '',
    });
  };

  const removeItemFromOrder = (index: number) => {
    setOrderData({
      ...orderData,
      items: orderData.items.filter((_, i) => i !== index),
    });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData.supplierId || !orderData.expectedDate || orderData.items.length === 0) return;

    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      supplierId: orderData.supplierId,
      status: 'pending',
      items: orderData.items,
      totalAmount: totalAmount,
      orderDate: new Date(),
      expectedDate: new Date(orderData.expectedDate),
    };

    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: newOrder });

    // Reset form
    setOrderData({
      supplierId: '',
      expectedDate: '',
      items: [],
    });
    setCurrentItem({
      productId: '',
      quantity: '',
      unitCost: '',
    });
    setIsCreateDialogOpen(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    const order = state.purchaseOrders.find(o => o.id === orderId);
    if (!order) return;

    // If completing the order, update product quantities
    if (newStatus === 'completed' && order.status !== 'completed') {
      order.items.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
          dispatch({
            type: 'UPDATE_PRODUCT',
            payload: {
              ...product,
              quantity: product.quantity + item.quantity,
              cost: item.unitCost, // Update cost price
              updatedAt: new Date(),
            },
          });

          // Add stock movement
          dispatch({
            type: 'ADD_STOCK_MOVEMENT',
            payload: {
              id: Date.now().toString() + Math.random(),
              productId: item.productId,
              type: 'in',
              quantity: item.quantity,
              reason: 'Purchase Order',
              reference: `PO-${orderId}`,
              date: new Date(),
            },
          });
        }
      });
    }

    // Update the order status
    const updatedOrder = { ...order, status: newStatus };
    dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: updatedOrder });
  };

  const downloadPurchaseOrder = async (order: PurchaseOrder) => {
    const supplier = state.suppliers.find(s => s.id === order.supplierId);
    const items = order.items.map(item => {
      const product = state.products.find(p => p.id === item.productId);
      return {
        ...item,
        name: product?.name || 'Unknown Product',
      };
    });

    await generatePurchaseOrderPDF(order, supplier, items, state.settings);
  };

  const emailPurchaseOrder = async (order: PurchaseOrder) => {
    const supplier = state.suppliers.find(s => s.id === order.supplierId);
    if (!supplier) {
      alert('Supplier not found');
      return;
    }

    const emailData = generatePurchaseOrderEmail(order, supplier, state.settings);
    const success = await sendEmail(emailData);
    
    if (success) {
      alert('Email client opened with purchase order details');
    } else {
      alert('Failed to open email client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">Manage your purchase orders and supplier relationships</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select 
                    value={orderData.supplierId} 
                    onValueChange={(value) => setOrderData({ ...orderData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={orderData.expectedDate}
                    onChange={(e) => setOrderData({ ...orderData, expectedDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Add Items Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold">Add Items</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Product</Label>
                    <Select 
                      value={currentItem.productId} 
                      onValueChange={(value) => setCurrentItem({ ...currentItem, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                      placeholder="Qty"
                    />
                  </div>
                  <div>
                    <Label>Unit Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.unitCost}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItemToOrder} className="w-full">
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              {orderData.items.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-2">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{getProductName(item.productId)}</span>
                          <span className="text-gray-600 ml-2">
                            {item.quantity} × ${item.unitCost} = ${(item.quantity * item.unitCost).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromOrder(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={orderData.items.length === 0}
                >
                  Create Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchase Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {state.purchaseOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>PO-{order.id}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Supplier: {getSupplierName(order.supplierId)}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Expected Date</p>
                      <p className="font-medium">{new Date(order.expectedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">{formatCurrency(order.totalAmount, state.settings.currency)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{getProductName(item.productId)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.unitCost, state.settings.currency)} = {formatCurrency(item.quantity * item.unitCost, state.settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
                <div className="flex space-x-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadPurchaseOrder(order)}
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => emailPurchaseOrder(order)}
                    className="bg-green-50 hover:bg-green-100"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Supplier
                  </Button>
                </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {state.purchaseOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders yet</h3>
            <p className="text-gray-600">
              Create your first purchase order to start managing your inventory procurement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}