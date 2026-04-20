import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
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
  const { t } = useLanguage();
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
    { key: 'personal', label: t('stepPersonal'), icon: <UserIcon size={18} /> },
    { key: 'professional', label: t('stepProfessional'), icon: <BuildingIcon size={18} /> },
    { key: 'documents', label: t('stepDocuments'), icon: <UploadIcon size={18} /> },
    { key: 'review', label: t('stepReview'), icon: <CheckCircleIcon size={18} /> }
  ];

  const specializationOptions = [
    t('specLuxuryHomes'), t('specVillas'), t('specApartments'), t('specCommercial'),
    t('specLand'), t('specRentals'), t('specFamilyHomes'), t('specInvestment')
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
      if (!formData.full_name.trim()) newErrors.full_name = t('fullNameRequired');
      if (!formData.email.trim()) newErrors.email = t('emailRequired');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('invalidEmailFormat');
      if (!formData.phone.trim()) newErrors.phone = t('phoneRequired');
    }
 
    if (step === 'professional') {
      if (!formData.company_name.trim()) newErrors.company_name = t('companyNameRequired');
      if (!formData.license_number.trim()) {
        newErrors.license_number = t('tinRequired');
      } else if (!/^\d{9}$/.test(formData.license_number.trim())) {
        newErrors.license_number = t('tinInvalidLength');
      }
      if (!formData.years_experience) newErrors.years_experience = t('yearsExpRequired');
      if (formData.specializations.length === 0) newErrors.specializations = t('selectOneSpec');
    }
 
    if (step === 'documents') {
      // TODO: Re-enable document validation when uploads are re-activated
      // if (!formData.license_doc) newErrors.license_doc = 'License document is required';
      // if (!formData.id_doc) newErrors.id_doc = 'ID document is required';
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
 
const { data: agentId, error } = await supabase.rpc('register_agent', {
        p_user_id:          appUser?.id ?? null,
        p_full_name:        formData.full_name,
        p_phone:            formData.phone,
        p_company_name:     formData.company_name,
        p_bio:              formData.bio || null,
        p_years_experience: parseInt(formData.years_experience) || 0,
        p_specializations:  formData.specializations,
        p_verification_docs: uploadedDocs,
        p_avatar_url:       avatarUrl,
      });

      if (error) {
        console.error('Database error:', error);
        setSubmitError(error.message || 'Failed to submit application. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (agentId) {
        try {
          await supabase.from('admin_notifications').insert({
            type: 'agent_signup',
            title: 'New Agent Registration',
            message: `${formData.full_name} from ${formData.company_name} has submitted an agent application and is awaiting approval.`,
            agent_id: agentId,
            is_read: false
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      await refreshUser();
 
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
        <p className="text-sm text-gray-500 mt-2">{t('uploadProfilePhoto')}</p>
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')} *</label>
        <input type="text" value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'ring-2 ring-red-500' : ''}`} />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
        <input type="email" value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder={t('emailPlaceholder')}
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'ring-2 ring-red-500' : ''}`} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyName')} *</label>
        <input type="text" value={formData.company_name}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          placeholder={t('companyNamePlaceholder')}
          className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.company_name ? 'ring-2 ring-red-500' : ''}`} />
        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tinLabel')} *</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('yearsExpLabel')} *</label>
        <div className="relative">
          <select value={formData.years_experience}
            onChange={(e) => handleInputChange('years_experience', e.target.value)}
            className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.years_experience ? 'ring-2 ring-red-500' : ''}`}>
            <option value="">{t('selectYears')}</option>
            <option value="1">{t('lessThan1Year')}</option>
            <option value="2">{t('oneToTwoYears')}</option>
            <option value="3">{t('threeToFiveYears')}</option>
            <option value="6">{t('sixToTenYears')}</option>
            <option value="10">{t('tenPlusYears')}</option>
          </select>
          <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        {errors.years_experience && <p className="text-red-500 text-xs mt-1">{errors.years_experience}</p>}
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('bio')}</label>
        <textarea value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder={t('bioPlaceholder')}
          rows={3}
          className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('specializationsLabel')} *</label>
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">{t('docsComingSoonTitle')}</h4>
            <p className="text-sm text-amber-700 mt-1">
              {t('docsComingSoonMsg')}
            </p>
          </div>
        </div>
      </div>

      {/* TODO: Re-enable when document uploads are activated */}
      <div className="opacity-40 pointer-events-none select-none">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RDB Certificate</label>
          <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
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

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">National ID / Passport</label>
          <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
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
    </div>
  );
 
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">{t('reviewInfoTitle')}</h4>
            <p className="text-sm text-amber-700 mt-1">
              {t('reviewInfoMsg')}
            </p>
          </div>
        </div>
      </div>
 
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">{t('submissionError')}</h4>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">{t('stepPersonal')}</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('fullName')}</span>
            <span className="font-medium">{formData.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('email')}</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('phone')}</span>
            <span className="font-medium">{formData.phone}</span>
          </div>
        </div>
      </div>
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">{t('stepProfessional')}</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('companyName')}</span>
            <span className="font-medium">{formData.company_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('tinLabel')}</span>
            <span className="font-medium">{formData.license_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('yearsExpLabel')}</span>
            <span className="font-medium">{formData.years_experience} {t('yearsLabel')}</span>
          </div>
          <div className="pt-2">
            <span className="text-gray-500 block mb-2">{t('specializationsLabel')}</span>
            <div className="flex flex-wrap gap-1">
              {formData.specializations.map((spec) => (
                <span key={spec} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">{spec}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">{t('stepDocuments')}</h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t('rdbCertLabel')}</span>
            <span className="text-xs text-amber-600 font-medium">{t('comingSoon')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t('nationalIdLabel')}</span>
            <span className="text-xs text-amber-600 font-medium">{t('comingSoon')}</span>
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
            <h2 className="text-lg font-bold">{t('becomeVerifiedAgent')}</h2>
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
              {t('back')}
            </button>
          )}
          {currentStep !== 'review' ? (
            <button onClick={handleNext}
              className="flex-1 py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {t('continueBtn')}
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
              ) : t('submitApplication')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default AgentSignup;

