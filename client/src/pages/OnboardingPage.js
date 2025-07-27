import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { companyService } from '../services/companyService';
import { menuItemService } from '../services/menuItemService';
import { Building2, Upload, QrCode, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
});

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  price: z.string().min(1, 'Price is required'),
});

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
  });

  const menuItemForm = useForm({
    resolver: zodResolver(menuItemSchema),
  });

  // Initialize companyId if user already has a company
  useEffect(() => {
    const initializeCompany = async () => {
      try {
        console.log('Initializing company...');
        const existingCompany = await companyService.getUserCompany();
        console.log('Initializing with existing company:', existingCompany);
        setCompanyId(existingCompany.company.id);
        setCompanyData({
          name: existingCompany.company.name,
          description: existingCompany.company.description
        });
        console.log('Company ID set to:', existingCompany.company.id);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error initializing company:', error);
        } else {
          console.log('No existing company found, will create new one');
        }
      }
    };

    initializeCompany();
  }, []); // Remove companyForm from dependencies

  // Reset form when company data changes
  useEffect(() => {
    console.log('Company data changed:', companyData);
    if (companyData.name) {
      companyForm.reset({
        name: companyData.name,
        description: companyData.description || ''
      });
      console.log('Form reset with company data');
    }
  }, [companyData, companyForm]);

  // Debug companyId changes
  useEffect(() => {
    console.log('Company ID changed to:', companyId);
  }, [companyId]);

  const steps = [
    { id: 1, title: 'Company Name', description: 'Enter your business name' },
    { id: 2, title: 'Description', description: 'Tell us about your business' },
    { id: 3, title: 'Logo', description: 'Upload your business logo' },
    { id: 4, title: 'First Menu Item', description: 'Add your first menu item' },
    { id: 5, title: 'Generate QR Code', description: 'Create your digital menu link' },
  ];

  const handleCompanySubmit = async (data) => {
    setLoading(true);
    try {
      if (companyId) {
        // We already have a company, just update it
        console.log('Updating existing company with ID:', companyId);
        const response = await companyService.updateCompany(companyId, {
          name: data.name,
          description: data.description || companyData.description
        });
        
        console.log('Company updated:', response);
        setCompanyData(data);
        setCurrentStep(2);
        toast.success('Company updated successfully!');
      } else {
        // Check if user already has a company
        try {
          const existingCompany = await companyService.getUserCompany();
          console.log('Existing company found:', existingCompany);
          
          // If user has a company, update it instead of creating new one
          const response = await companyService.updateCompany(existingCompany.company.id, {
            name: data.name,
            description: data.description || existingCompany.company.description
          });
          
          console.log('Company updated:', response);
          setCompanyData(data);
          setCompanyId(existingCompany.company.id);
          setCurrentStep(2);
          toast.success('Company updated successfully!');
        } catch (error) {
          if (error.response?.status === 404) {
            // User doesn't have a company, create new one
            const response = await companyService.createCompany({
              ...data,
              owner_id: user.id,
            });
            
            console.log('Company created:', response);
            setCompanyData(data);
            setCompanyId(response.company.id);
            setCurrentStep(2);
            toast.success('Company created successfully!');
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Company submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to create/update company');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Submitting description with companyId:', companyId);
      console.log('Current companyData:', companyData);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      if (data.description && data.description.trim()) {
        await companyService.updateCompany(companyId, { description: data.description });
        setCompanyData(prev => ({ ...prev, description: data.description }));
      }
      setCurrentStep(3);
      toast.success('Description updated!');
    } catch (error) {
      console.error('Description submission error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to update description');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    setLoading(true);
    try {
      console.log('Uploading logo with companyId:', companyId);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      if (logoFile) {
        await companyService.uploadLogo(companyId, logoFile);
        toast.success('Logo uploaded successfully!');
      }
      setCurrentStep(4);
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Submitting menu item with companyId:', companyId);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      const response = await menuItemService.createMenuItem({
        ...data,
        company_id: companyId,
        price: parseFloat(data.price),
      });
      
      setMenuItems([response.menu_item]);
      setCurrentStep(5);
      toast.success('Menu item added!');
    } catch (error) {
      console.error('Menu item submission error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = async () => {
    setLoading(true);
    try {
      console.log('Generating QR code with companyId:', companyId);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      await companyService.generateQRCode(companyId);
      
      // Update user to mark first login as complete
      updateUser({ ...user, is_first_login: false, company_id: companyId });
      
      toast.success('QR Code generated! Welcome to your dashboard!');
      navigate('/dashboard');
    } catch (error) {
      console.error('QR code generation error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipOnboarding = async () => {
    setLoading(true);
    try {
      // Update user to mark first login as complete
      updateUser({ ...user, is_first_login: false });
      toast.success('Welcome to your dashboard!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to skip onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                {...companyForm.register('name')}
                className="input-field"
                placeholder="Enter your company name"
              />
              {companyForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {companyForm.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSkipOnboarding}
                disabled={loading}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={companyForm.handleSubmit(handleDescriptionSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description (Optional)
              </label>
              <textarea
                {...companyForm.register('description')}
                className="input-field resize-none"
                rows={4}
                placeholder="Tell customers about your business..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                <p className="text-sm text-green-600 mt-2">
                  ✓ {logoFile.name} selected
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                Skip
              </button>
              <button
                onClick={handleLogoUpload}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <form onSubmit={menuItemForm.handleSubmit(handleMenuItemSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menu Item Name *
              </label>
              <input
                type="text"
                {...menuItemForm.register('name')}
                className="input-field"
                placeholder="e.g., Margherita Pizza"
              />
              {menuItemForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {menuItemForm.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...menuItemForm.register('price')}
                  className="input-field pl-8"
                  placeholder="0.00"
                />
              </div>
              {menuItemForm.formState.errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {menuItemForm.formState.errors.price.message}
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Add Item
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <QrCode className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generate Your QR Code
              </h3>
              <p className="text-gray-600">
                We'll create a unique QR code and menu link for your customers to scan and view your menu.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                onClick={handleGenerateQRCode}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Generate QR Code
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Let's set up your digital menu in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="font-medium text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage; 