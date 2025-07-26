import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { companyService } from '../services/companyService';
import { menuItemService } from '../services/menuItemService';
import { 
  QrCode, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Settings, 
  Crown,
  LogOut,
  Building2,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import AddMenuItemModal from '../components/AddMenuItemModal';
import EditMenuItemModal from '../components/EditMenuItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

function DashboardPage() {
  const [company, setCompany] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [menuLink, setMenuLink] = useState('');
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.company_id) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      const [companyData, menuItemsData] = await Promise.all([
        companyService.getCompany(user.company_id),
        menuItemService.getMenuItems(user.company_id)
      ]);
      
      setCompany(companyData.company);
      setMenuItems(menuItemsData.menu_items);
      setQrCodeUrl(companyData.company.qr_code_url);
      setMenuLink(companyData.company.menu_link);
    } catch (error) {
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (menuItemData) => {
    try {
      const response = await menuItemService.createMenuItem({
        ...menuItemData,
        company_id: user.company_id,
        price: parseFloat(menuItemData.price),
      });
      
      setMenuItems(prev => [...prev, response.menu_item]);
      setShowAddModal(false);
      toast.success('Menu item added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add menu item');
    }
  };

  const handleEditMenuItem = async (menuItemData) => {
    try {
      const response = await menuItemService.updateMenuItem(selectedMenuItem.id, {
        ...menuItemData,
        price: parseFloat(menuItemData.price),
      });
      
      setMenuItems(prev => 
        prev.map(item => 
          item.id === selectedMenuItem.id ? response.menu_item : item
        )
      );
      setShowEditModal(false);
      setSelectedMenuItem(null);
      toast.success('Menu item updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async () => {
    try {
      await menuItemService.deleteMenuItem(selectedMenuItem.id);
      setMenuItems(prev => prev.filter(item => item.id !== selectedMenuItem.id));
      setShowDeleteModal(false);
      setSelectedMenuItem(null);
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete menu item');
    }
  };

  const copyMenuLink = async () => {
    try {
      await navigator.clipboard.writeText(menuLink);
      toast.success('Menu link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${company?.name}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Found</h2>
          <p className="text-gray-600 mb-4">Please complete your company setup first.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {user?.first_name}!
                </h1>
                <p className="text-sm text-gray-600">{company.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.subscription_tier === 'Free' && (
                <button
                  onClick={() => navigate('/upgrade')}
                  className="flex items-center space-x-2 text-sm text-amber-600 hover:text-amber-700"
                >
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* QR Code Card */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <QrCode className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
            </div>
            {qrCodeUrl ? (
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto w-32 h-32 mb-4"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={downloadQRCode}
                    className="btn-secondary flex-1 flex items-center justify-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">QR Code not generated yet</p>
            )}
          </div>

          {/* Menu Link Card */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Menu className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Menu Link</h3>
            </div>
            {menuLink ? (
              <div>
                <p className="text-sm text-gray-600 mb-3 break-all">
                  {menuLink}
                </p>
                <button
                  onClick={copyMenuLink}
                  className="btn-primary w-full flex items-center justify-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Menu link not generated yet</p>
            )}
          </div>

          {/* Add Menu Item Card */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Add Item</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Add new items to your menu
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <span className="text-sm text-gray-500">
              {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <Menu className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first menu item
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="font-bold text-green-600">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setShowEditModal(true);
                      }}
                      className="btn-secondary flex-1 flex items-center justify-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setShowDeleteModal(true);
                      }}
                      className="btn-danger flex-1 flex items-center justify-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMenuItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMenuItem}
        />
      )}

      {showEditModal && selectedMenuItem && (
        <EditMenuItemModal
          menuItem={selectedMenuItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMenuItem(null);
          }}
          onSubmit={handleEditMenuItem}
        />
      )}

      {showDeleteModal && selectedMenuItem && (
        <DeleteConfirmModal
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${selectedMenuItem.name}"? This action cannot be undone.`}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMenuItem(null);
          }}
          onConfirm={handleDeleteMenuItem}
        />
      )}
    </div>
  );
}

export default DashboardPage; 