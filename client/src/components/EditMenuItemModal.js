import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, DollarSign } from 'lucide-react';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  price: z.string().min(1, 'Price is required'),
  description: z.string().optional(),
});

function EditMenuItemModal({ menuItem, onClose, onSubmit }) {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(menuItemSchema),
  });

  useEffect(() => {
    if (menuItem) {
      reset({
        name: menuItem.name,
        price: menuItem.price.toString(),
        description: menuItem.description || '',
      });
    }
  }, [menuItem, reset]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        price: parseFloat(data.price),
        image: imageFile,
      });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Menu Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="input-field"
              placeholder="e.g., Margherita Pizza"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price')}
                className="input-field pl-10"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={3}
              placeholder="Describe your menu item..."
            />
          </div>

          {/* Current Image */}
          {menuItem?.image_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Image
              </label>
              <img
                src={menuItem.image_url}
                alt={menuItem.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* New Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
            {imageFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {imageFile.name} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Update Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMenuItemModal; 