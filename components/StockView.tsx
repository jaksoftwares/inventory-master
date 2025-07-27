'use client';

import { useState, useMemo } from 'react';
import { useInventory, Product, StockMovement } from '@/contexts/InventoryContext';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown, Package, Search, History } from 'lucide-react';

export default function StockView() {
  const { state, dispatch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'in' as 'in' | 'out',
    quantity: '',
    reason: '',
    reference: '',
  });

  const filteredProducts = useMemo(() => {
    return state.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.products, searchTerm]);

  const recentMovements = useMemo(() => {
    return state.stockMovements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [state.stockMovements]);

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentData({
      type: 'in',
      quantity: '',
      reason: '',
      reference: '',
    });
    setIsAdjustDialogOpen(true);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const quantity = parseInt(adjustmentData.quantity);
    const newQuantity = adjustmentData.type === 'in' 
      ? selectedProduct.quantity + quantity
      : Math.max(0, selectedProduct.quantity - quantity);

    // Update product quantity
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: {
        ...selectedProduct,
        quantity: newQuantity,
        updatedAt: new Date(),
      },
    });

    // Add stock movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      type: adjustmentData.type,
      quantity: quantity,
      reason: adjustmentData.reason,
      reference: adjustmentData.reference,
      date: new Date(),
    };

    dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: movement });

    setIsAdjustDialogOpen(false);
    setSelectedProduct(null);
    setAdjustmentData({
      type: 'in',
      quantity: '',
      reason: '',
      reference: '',
    });
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' };
    } else if (product.quantity <= state.settings.lowStockThreshold) {
      return { label: 'Low Stock', variant: 'secondary' as const, color: 'text-yellow-600' };
    }
    return { label: 'In Stock', variant: 'default' as const, color: 'text-green-600' };
  };

  const getProductName = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-2">Monitor and adjust your inventory levels</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const stockPercentage = product.minStock > 0 ? (product.quantity / product.minStock) * 100 : 100;
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <Badge variant={stockStatus.variant}>
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className={`font-bold text-lg ${stockStatus.color}`}>
                      {product.quantity}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Minimum Stock:</span>
                    <span className="font-medium">{product.minStock}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stockPercentage <= 50 ? 'bg-red-500' :
                        stockPercentage <= 100 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Category: {product.category}</span>
                    <span>Value: {formatCurrency(product.price * product.quantity, state.settings.currency)}</span>
                  </div>

                  <Button
                    onClick={() => handleStockAdjustment(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Adjust Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent Stock Movements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length > 0 ? (
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      movement.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.type === 'in' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getProductName(movement.productId)}
                      </h4>
                      <p className="text-sm text-gray-600">{movement.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(new Date(movement.date), state.settings.dateFormat)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No stock movements recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adjust Stock - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div>
              <Label htmlFor="type">Adjustment Type</Label>
              <Select 
                value={adjustmentData.type} 
                onValueChange={(value: 'in' | 'out') => 
                  setAdjustmentData({ ...adjustmentData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (Add)</SelectItem>
                  <SelectItem value="out">Stock Out (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select 
                value={adjustmentData.reason} 
                onValueChange={(value) => 
                  setAdjustmentData({ ...adjustmentData, reason: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Return">Return</SelectItem>
                  <SelectItem value="Adjustment">Manual Adjustment</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={adjustmentData.reference}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reference: e.target.value })}
                placeholder="Invoice number, order ID, etc."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Apply Adjustment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'Add products to start managing stock'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}