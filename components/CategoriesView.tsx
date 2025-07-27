'use client';

import { useState } from 'react';
import { useInventory, Category } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';

export default function CategoriesView() {
  const { state, dispatch } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      createdAt: editingCategory?.createdAt || new Date(),
    };

    if (editingCategory) {
      // Update category name in products if changed
      if (editingCategory.name !== formData.name) {
        state.products.forEach(product => {
          if (product.category === editingCategory.name) {
            dispatch({ 
              type: 'UPDATE_PRODUCT', 
              payload: { ...product, category: formData.name, updatedAt: new Date() }
            });
          }
        });
      }
    }
    
    // Add or update the category
    dispatch({ type: 'ADD_CATEGORY', payload: categoryData });

    resetForm();
    setIsAddDialogOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
    });
    setEditingCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    const productsInCategory = state.products.filter(p => p.category === categoryName);
    
    if (productsInCategory.length > 0) {
      alert(`Cannot delete category "${categoryName}" because it contains ${productsInCategory.length} product(s). Please move or delete these products first.`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    }
  };

  const getCategoryProductCount = (categoryName: string) => {
    return state.products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Organize your products into categories</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setEditingCategory(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter category description..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.categories.map((category) => {
          const productCount = getCategoryProductCount(category.name);
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {productCount} product{productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 min-h-[60px]">
                    {category.description || 'No description provided'}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
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

      {state.categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600">
              Create your first category to organize your products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}