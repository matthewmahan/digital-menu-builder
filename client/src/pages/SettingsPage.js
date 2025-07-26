import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { companyService } from '../services/companyService';
import { 
  ArrowLeft, 
  Building2, 
  Upload, 
  Save, 
  LogOut,
  User,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
});

function SettingsPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (user?.company_id) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      const response = await companyService.getCompany(user.company_id);
      setCompany(response.company);
      reset({
        name: response.company.name,
        description: response.company.description || '',
      });
    } catch (error) {
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyUpdate = async (data) => {
    setSaving(true);
    try {
      const response = await companyService.updateCompany(user.company_id, data);
      setCompany(response.company);
      toast.success('Company settings updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setSaving(true);
    try {
      const response = await companyService.uploadLogo(user.company_id, logoFile);
      setCompany(response.company);
      setLogoFile(null);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Settings */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Settings</h2>
              </div>

              <form onSubmit={handleSubmit(handleCompanyUpdate)} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="input-field"
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Company Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Tell customers about your business..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center justify-center"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Logo Upload */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="h-6 w-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Logo</h2>
              </div>

              {company?.logo_url && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Logo
                  </label>
                  <img
                    src={company.logo_url}
                    alt="Company logo"
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                </div>
                {logoFile && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ {logoFile.name} selected
                    </p>
                    <button
                      onClick={handleLogoUpload}
                      disabled={saving}
                      className="btn-primary flex items-center justify-center"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Upload Logo'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">User Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{user?.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription</label>
                  <p className="text-gray-900">{user?.subscription_tier}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/upgrade')}
                  className="w-full btn-primary"
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full btn-danger flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage; 