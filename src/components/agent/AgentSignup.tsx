import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  XIcon, UploadIcon, CheckCircleIcon, ChevronDownIcon, 
  ImageIcon, UserIcon, BuildingIcon, AlertCircleIcon 
} from '@/components/icons/Icons';
 
interface AgentSignupProps {
  onClose: () => void;
  onSuccess: () => void;
}
 
type Step = 'personal' | 'professional' | 'documents' | 'review';
 
const AgentSignup: React.FC<AgentSignupProps> = ({ onClose, onSuccess }) => {
  const { appUser, user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: appUser?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    email: appUser?.email || user?.email || '',
    phone: appUser?.phone || '',
    company_name: '',
    license_number: '',
    years_experience: '',
    bio: '',
    specializations: [] as string[],
    avatar: null as File | null,
    license_doc: null as File | null,
    id_doc: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
 
  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal', icon: <UserIcon size={18} /> },
    { key: 'professional', label: 'Professional', icon: <BuildingIcon size={18} /> },
    { key: 'documents', label: 'Documents', icon: <UploadIcon size={18} /> },
    { key: 'review', label: 'Review', icon: <CheckCircleIcon size={18} /> }
  ];
 
  const specializationOptions = [
    'Luxury Homes', 'Villas', 'Apartments', 'Commercial', 
    'Land', 'Rentals', 'Family Homes', 'Investment'
  ];
 
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
 
  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };
 
  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};
 
    if (step === 'personal') {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
 
    if (step === 'professional') {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
      if (!formData.license_number.trim()) {
        newErrors.license_number = 'Tax Identification Number is required';
      } else if (!/^\d{9}$/.test(formData.license_number.trim())) {
        newErrors.license_number = 'Tax Identification Number must be exactly 9 digits';
      }
      if (!formData.years_experience) newErrors.years_experience = 'Years of experience is required';
      if (formData.specializations.length === 0) newErrors.specializations = 'Select at least one specialization';
    }
 
    if (step === 'documents') {
      if (!formData.license_doc) newErrors.license_doc = 'License document is required';
      if (!formData.id_doc) newErrors.id_doc = 'ID document is required';
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const stepOrder: Step[] = ['personal', 'professional', 'documents', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };
 
  const handleBack = () => {
    const stepOrder: Step[] = ['personal', 'professional', 'documents', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };
 
  const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('agent-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) { console.error('Upload error:', error); return null; }
      return data.path;
    } catch (error) {
      console.error('Upload exception:', error);
      return null;
    }
  };
 
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
 
    try {
      const uploadedDocs: string[] = [];
 
      if (formData.license_doc) {
        const licensePath = await uploadDocument(formData.license_doc, 'licenses');
        if (licensePath) uploadedDocs.push(licensePath);
      }
      if (formData.id_doc) {
        const idPath = await uploadDocument(formData.id_doc, 'ids');
        if (idPath) uploadedDocs.push(idPath);
      }
 
      let avatarUrl = null;
      if (formData.avatar) {
        const avatarPath = await uploadDocument(formData.avatar, 'avatars');
        if (avatarPath) {
          const { data } = supabase.storage.from('agent-documents').getPublicUrl(avatarPath);
          avatarUrl = data.publicUrl;
        }
      }
 
      const agentData = {
        user_id: appUser?.id || null,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        license_number: formData.license_number,
        bio: formData.bio || null,
        years_experience: parseInt(formData.years_experience) || 0,
        specializations: formData.specializations,
        verification_status: 'pending',
        verification_documents: uploadedDocs,
        avatar_url: avatarUrl,
        total_listings: 0,
        rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
 
      const { data, error } = await supabase
        .from('agents').insert([agentData]).select().single();
 
      if (error) {
        console.error('Database error:', error);
        setSubmitError(error.message || 'Failed to submit application. Please try again.');
        setIsSubmitting(false);
        return;
      }
 
      if (data) {
        try {
          await supabase.from('admin_notifications').insert({
            type: 'agent_signup',
            title: 'New Agent Registration',
            message: `${formData.full_name} from ${formData.company_name} has submitted an agent application and is awaiting approval.`,
            agent_id: data.id,
            is_read: false
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }
 
      if (appUser?.id) {
        await supabase.from('users').update({ role: 'agent' }).eq('id', appUser.id);
        await refreshUser();
      }
 
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
 
  const renderPersonalStep = () => (
    <div className="space-y-4">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {formData.avatar ? (
              <img src={URL.createObjectURL(formData.avatar)} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={32} className="text-gray-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
            <ImageIcon size={16} className="text-white" />
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => handleInputChange('avatar', e.target.files?.[0] || null)} />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">Upload profile photo</p>
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input type="text" value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          placeholder="Enter your full name"
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'ring-2 ring-red-500' : ''}`} />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input type="email" value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your@email.com"
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'ring-2 ring-red-500' : ''}`} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input type="tel" value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+250 787 397 658"
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'ring-2 ring-red-500' : ''}`} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
    </div>
  );
 
  const renderProfessionalStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company/Agency Name *</label>
        <input type="text" value={formData.company_name}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          placeholder="Your company name"
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.company_name ? 'ring-2 ring-red-500' : ''}`} />
        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number (TIN) *</label>
        <input
          type="text"
          value={formData.license_number}
          onChange={(e) => {
            // Only allow digits, enforce max 9
            const val = e.target.value.replace(/\D/g, '').slice(0, 9);
            handleInputChange('license_number', val);
          }}
          placeholder="9-digit TIN (e.g. 123456789)"
          maxLength={9}
          inputMode="numeric"
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.license_number ? 'ring-2 ring-red-500' : ''}`}
        />
        {/* Live digit counter */}
        {formData.license_number.length > 0 && !errors.license_number && (
          <p className={`text-xs mt-1 ${formData.license_number.length === 9 ? 'text-green-600' : 'text-gray-400'}`}>
            {formData.license_number.length}/9 digits{formData.license_number.length === 9 ? ' ✓' : ''}
          </p>
        )}
        {errors.license_number && <p className="text-red-500 text-xs mt-1">{errors.license_number}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
        <div className="relative">
          <select value={formData.years_experience}
            onChange={(e) => handleInputChange('years_experience', e.target.value)}
            className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.years_experience ? 'ring-2 ring-red-500' : ''}`}>
            <option value="">Select years</option>
            <option value="1">Less than 1 year</option>
            <option value="2">1-2 years</option>
            <option value="3">3-5 years</option>
            <option value="6">6-10 years</option>
            <option value="10">10+ years</option>
          </select>
          <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        {errors.years_experience && <p className="text-red-500 text-xs mt-1">{errors.years_experience}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell potential clients about yourself..."
          rows={3}
          className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specializations *</label>
        <div className="flex flex-wrap gap-2">
          {specializationOptions.map((spec) => (
            <button key={spec} type="button" onClick={() => toggleSpecialization(spec)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.specializations.includes(spec) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {spec}
            </button>
          ))}
        </div>
        {errors.specializations && <p className="text-red-500 text-xs mt-1">{errors.specializations}</p>}
      </div>
    </div>
  );
 
  const renderDocumentsStep = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Document Requirements</h4>
            <p className="text-sm text-blue-700 mt-1">
              Please upload clear copies of your documents. Accepted formats: PDF, JPG, PNG (max 5MB each).
            </p>
          </div>
        </div>
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">RDB Certificate *</label>
        <label className={`flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${errors.license_doc ? 'border-red-500' : 'border-gray-300'}`}>
          {formData.license_doc ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon size={24} />
              <span className="font-medium">{formData.license_doc.name}</span>
            </div>
          ) : (
            <>
              <UploadIcon size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload license</span>
            </>
          )}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={(e) => handleInputChange('license_doc', e.target.files?.[0] || null)} />
        </label>
        {errors.license_doc && <p className="text-red-500 text-xs mt-1">{errors.license_doc}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">National ID / Passport *</label>
        <label className={`flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${errors.id_doc ? 'border-red-500' : 'border-gray-300'}`}>
          {formData.id_doc ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon size={24} />
              <span className="font-medium">{formData.id_doc.name}</span>
            </div>
          ) : (
            <>
              <UploadIcon size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload ID</span>
            </>
          )}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={(e) => handleInputChange('id_doc', e.target.files?.[0] || null)} />
        </label>
        {errors.id_doc && <p className="text-red-500 text-xs mt-1">{errors.id_doc}</p>}
      </div>
    </div>
  );
 
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Review Your Information</h4>
            <p className="text-sm text-amber-700 mt-1">
              Please verify all details before submitting. Your application will be reviewed within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
 
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Submission Error</h4>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{formData.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium">{formData.phone}</span>
          </div>
        </div>
      </div>
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Company</span>
            <span className="font-medium">{formData.company_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">TIN</span>
            <span className="font-medium">{formData.license_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Experience</span>
            <span className="font-medium">{formData.years_experience} years</span>
          </div>
          <div className="pt-2">
            <span className="text-gray-500 block mb-2">Specializations</span>
            <div className="flex flex-wrap gap-1">
              {formData.specializations.map((spec) => (
                <span key={spec} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">{spec}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">RDB Certificate</span>
            <span className="flex items-center gap-1 text-green-600"><CheckCircleIcon size={16} />Uploaded</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">ID Document</span>
            <span className="flex items-center gap-1 text-green-600"><CheckCircleIcon size={16} />Uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Become a Verified Agent</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <XIcon size={20} />
            </button>
          </div>
 
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepOrder: Step[] = ['personal', 'professional', 'documents', 'review'];
              const currentIndex = stepOrder.indexOf(currentStep);
              const stepIndex = stepOrder.indexOf(step.key);
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = step.key === currentStep;
 
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isCurrent ? 'bg-blue-600 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircleIcon size={20} /> : step.icon}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${stepIndex < currentIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
 
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {currentStep === 'personal' && renderPersonalStep()}
          {currentStep === 'professional' && renderProfessionalStep()}
          {currentStep === 'documents' && renderDocumentsStep()}
          {currentStep === 'review' && renderReviewStep()}
        </div>
 
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          {currentStep !== 'personal' && (
            <button onClick={handleBack} disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Back
            </button>
          )}
          {currentStep !== 'review' ? (
            <button onClick={handleNext}
              className="flex-1 py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default AgentSignup;

