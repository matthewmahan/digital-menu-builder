import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Phone, MapPin, Clock, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function MenuViewPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMenuData();
  }, [companyId]);

  const loadMenuData = async () => {
    try {
      // For now, we'll use a simple fetch since this is a public endpoint
      const [companyResponse, menuResponse] = await Promise.all([
        fetch(`/api/menu/${companyId}`),
        fetch(`/api/menu/${companyId}/items`)
      ]);

      if (!companyResponse.ok || !menuResponse.ok) {
        throw new Error('Menu not found');
      }

      const companyData = await companyResponse.json();
      const menuData = await menuResponse.json();

      setCompany(companyData.company);
      setMenuItems(menuData.menu_items);
    } catch (error) {
      setError('Menu not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-600">This menu is not available or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            {company?.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company?.name}</h1>
              {company?.description && (
                <p className="text-gray-600 mt-1">{company.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <Star className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items</h2>
            <p className="text-gray-600">This menu is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {item.image_url && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-xl font-bold text-green-600">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                  {item.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by Digital Menu Builder</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MenuViewPage; 