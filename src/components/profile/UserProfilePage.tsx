import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import {
  XIcon, UserIcon, LockIcon, ActivityIcon, LinkIcon, AlertTriangleIcon,
  CameraIcon, CheckCircleIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon,
  ClockIcon, LogOutIcon, GlobeIcon, ArrowLeftIcon, EditIcon
} from '@/components/icons/Icons';
 
type ProfileTab = 'personal' | 'password' | 'activity' | 'connected' | 'danger';
 
interface ActivityLog {
  id: string; action: string; description: string;
  metadata: Record<string, unknown>; created_at: string;
}
interface ConnectedAccount {
  id: string; provider: string; provider_email: string; connected_at: string;
}
interface UserProfilePageProps { onClose: () => void; onLogout: () => void; }
 
const UserProfilePage: React.FC<UserProfilePageProps> = ({ onClose, onLogout }) => {
  const { appUser, user, updatePassword, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [fullName, setFullName] = useState(appUser?.full_name || '');
  const [email] = useState(appUser?.email || '');
  const [phone, setPhone] = useState(appUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(appUser?.avatar_url || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [personalError, setPersonalError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [connectedLoading, setConnectedLoading] = useState(false);
 
  useEffect(() => { if (personalSuccess) { const t2 = setTimeout(() => setPersonalSuccess(false), 3000); return () => clearTimeout(t2); } }, [personalSuccess]);
  useEffect(() => { if (passwordSuccess) { const t2 = setTimeout(() => setPasswordSuccess(false), 3000); return () => clearTimeout(t2); } }, [passwordSuccess]);
 
  const loadActivities = useCallback(async () => {
    if (!appUser) return;
    setActivitiesLoading(true);
    try {
      const { data, error } = await supabase.from('user_activity_log').select('*').eq('user_id', appUser.id).order('created_at', { ascending: false }).limit(50);
      if (!error && data) setActivities(data);
    } catch (err) { console.error(err); }
    setActivitiesLoading(false);
  }, [appUser]);
 
  const loadConnectedAccounts = useCallback(async () => {
    if (!appUser) return;
    setConnectedLoading(true);
    try {
      const { data, error } = await supabase.from('connected_accounts').select('*').eq('user_id', appUser.id).order('connected_at', { ascending: false });
      if (!error && data) setConnectedAccounts(data);
    } catch (err) { console.error(err); }
    setConnectedLoading(false);
  }, [appUser]);
 
  const logActivity = async (action: string, description: string) => {
    if (!appUser) return;
    try { await supabase.from('user_activity_log').insert({ user_id: appUser.id, action, description, metadata: {} }); } catch (err) { console.error(err); }
  };
 
  useEffect(() => {
    if (activeTab === 'activity') loadActivities();
    if (activeTab === 'connected') loadConnectedAccounts();
  }, [activeTab, loadActivities, loadConnectedAccounts]);
 
  useEffect(() => { logActivity('profile_viewed', 'Viewed account settings page'); }, []);
 
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser) return;
    if (file.size > 5 * 1024 * 1024) { setPersonalError('Image must be less than 5MB'); return; }
    setAvatarUploading(true); setPersonalError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${appUser.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
      const newUrl = urlData.publicUrl;
      setAvatarUrl(newUrl);
      const { error: updateError } = await supabase.from('users').update({ avatar_url: newUrl }).eq('id', appUser.id);
      if (updateError) throw updateError;
      await refreshUser(); await logActivity('avatar_updated', 'Updated profile photo'); setPersonalSuccess(true);
    } catch (err: any) { setPersonalError(err.message || 'Failed to upload avatar'); }
    setAvatarUploading(false);
  };
 
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault(); if (!appUser) return;
    setPersonalSaving(true); setPersonalError(''); setPersonalSuccess(false);
    try {
      const { error } = await supabase.from('users').update({ full_name: fullName.trim(), phone: phone.trim() || null }).eq('id', appUser.id);
      if (error) throw error;
      await refreshUser(); await logActivity('profile_updated', 'Updated personal information'); setPersonalSuccess(true);
    } catch (err: any) { setPersonalError(err.message || 'Failed to save changes'); }
    setPersonalSaving(false);
  };
 
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError(''); setPasswordSuccess(false);
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setPasswordSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (signInError) { setPasswordError('Current password is incorrect'); setPasswordSaving(false); return; }
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      await logActivity('password_changed', 'Changed account password');
      setPasswordSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { setPasswordError(err.message || 'Failed to change password'); }
    setPasswordSaving(false);
  };
 
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
 
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'profile_updated': case 'avatar_updated': return <UserIcon size={16} className="text-blue-500" />;
      case 'password_changed': return <LockIcon size={16} className="text-amber-500" />;
      case 'account_connected': case 'account_disconnected': return <LinkIcon size={16} className="text-purple-500" />;
      case 'profile_viewed': return <EyeIcon size={16} className="text-gray-400" />;
      case 'login': return <LogOutIcon size={16} className="text-green-500" />;
      default: return <ActivityIcon size={16} className="text-gray-400" />;
    }
  };
 
  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: t('weakPw'), color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: t('fairPw'), color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: t('goodPw'), color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: t('strongPw'), color: 'bg-green-500' };
    return { score: 5, label: t('veryStrongPw'), color: 'bg-emerald-500' };
  };
 
  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: t('personalInfo'), icon: <UserIcon size={18} /> },
    { id: 'password', label: t('changePassword'), icon: <LockIcon size={18} /> },
    { id: 'activity', label: t('activity'), icon: <ActivityIcon size={18} /> },
    { id: 'connected', label: t('connected'), icon: <LinkIcon size={18} /> },
    { id: 'danger', label: t('dangerZone'), icon: <AlertTriangleIcon size={18} /> },
  ];
 
  const socialProviders = [
    { id: 'google', name: 'Google', color: 'bg-red-50 text-red-600 border-red-200', icon: <GlobeIcon size={20} className="text-red-500" /> },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <GlobeIcon size={20} className="text-blue-600" /> },
    { id: 'twitter', name: 'Twitter / X', color: 'bg-gray-50 text-gray-800 border-gray-200', icon: <GlobeIcon size={20} className="text-gray-700" /> },
    { id: 'github', name: 'GitHub', color: 'bg-gray-50 text-gray-800 border-gray-200', icon: <GlobeIcon size={20} className="text-gray-800" /> },
  ];
 
  const pwStrength = passwordStrength(newPassword);
  const displayAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=2563eb&color=fff&size=200`;
 
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-4xl bg-white min-h-screen lg:min-h-0 lg:my-8 lg:rounded-2xl lg:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-6 lg:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <ArrowLeftIcon size={18} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{t('accountSettings')}</h1>
                <p className="text-blue-200 text-sm">{t('manageProfile')}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="relative group">
              <img src={displayAvatarUrl} alt={fullName} className="w-16 h-16 rounded-full object-cover border-3 border-white/30" />
              {avatarUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/></div>}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{appUser?.full_name}</h2>
              <p className="text-blue-200 text-sm">{appUser?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                appUser?.role === 'admin' ? 'bg-purple-400/30 text-purple-100' :
                appUser?.role === 'agent' ? 'bg-emerald-400/30 text-emerald-100' :
                appUser?.role === 'homeowner' ? 'bg-teal-400/30 text-teal-100' :
                'bg-blue-400/30 text-blue-100'
              }`}>{appUser?.role === 'homeowner' ? t('homeownerBadge') : appUser?.role}</span>
            </div>
          </div>
        </div>
 
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tab.id === 'danger' ? 'text-red-500 hover:text-red-600' : ''}`}>
                {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
 
        <div className="p-6">
          {/* PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('personalInfo')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('personalInfoDesc')}</p>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('profilePhoto')}</label>
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <img src={displayAvatarUrl} alt={fullName} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <CameraIcon size={24} className="text-white"/>
                    </button>
                    {avatarUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"/></div>}
                  </div>
                  <div>
                    <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                      {avatarUploading ? t('uploading') : t('changePhoto')}
                    </button>
                    <p className="text-xs text-gray-400 mt-1.5">{t('profilePhotoHint')}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden"/>
                </div>
              </div>
              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fullName')}</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Your full name"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
                  <div className="relative">
                    <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="email" value={email} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('emailCannotChange')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('phone')}</label>
                  <div className="relative">
                    <PhoneIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="+250 7XX XXX XXX"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('accountRole')}</label>
                  <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 capitalize">{appUser?.role || 'buyer'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('memberSince')}</label>
                  <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">{appUser?.created_at ? formatDate(appUser.created_at) : 'N/A'}</div>
                </div>
                {personalError && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertTriangleIcon size={16} className="text-red-500 flex-shrink-0"/>{personalError}</div>}
                {personalSuccess && <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircleIcon size={16} className="text-green-500 flex-shrink-0"/>{t('profileUpdated')}</div>}
                <button type="submit" disabled={personalSaving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {personalSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t('saving')}</> : <><CheckCircleIcon size={16}/>{t('save')}</>}
                </button>
              </form>
            </div>
          )}
 
          {/* PASSWORD */}
          {activeTab === 'password' && (
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('changePassword')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('passwordDesc')}</p>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('currentPassword')}</label>
                  <div className="relative">
                    <LockIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter current password"/>
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPw ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newPassword')}</label>
                  <div className="relative">
                    <LockIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter new password"/>
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPw ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pwStrength.color}`} style={{width:`${(pwStrength.score/5)*100}%`}}/>
                        </div>
                        <span className={`text-xs font-medium ${pwStrength.score<=1?'text-red-500':pwStrength.score<=2?'text-orange-500':pwStrength.score<=3?'text-yellow-600':'text-green-600'}`}>{pwStrength.label}</span>
                      </div>
                      <ul className="text-xs text-gray-400 space-y-0.5 mt-1">
                        <li className={newPassword.length>=6?'text-green-500':''}>{newPassword.length>=6?'+ ':'- '}{t('atLeast6')}</li>
                        <li className={/[A-Z]/.test(newPassword)?'text-green-500':''}>{/[A-Z]/.test(newPassword)?'+ ':'- '}{t('oneUppercase')}</li>
                        <li className={/[0-9]/.test(newPassword)?'text-green-500':''}>{/[0-9]/.test(newPassword)?'+ ':'- '}{t('oneNumber')}</li>
                        <li className={/[^A-Za-z0-9]/.test(newPassword)?'text-green-500':''}>{/[^A-Za-z0-9]/.test(newPassword)?'+ ':'- '}{t('oneSpecial')}</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmNewPassword')}</label>
                  <div className="relative">
                    <LockIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type={showConfirmPw?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${confirmPassword&&confirmPassword!==newPassword?'border-red-300 bg-red-50':confirmPassword&&confirmPassword===newPassword?'border-green-300 bg-green-50':'border-gray-300'}`}
                      placeholder="Confirm new password"/>
                    <button type="button" onClick={()=>setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPw?<EyeOffIcon size={18}/>:<EyeIcon size={18}/>}
                    </button>
                  </div>
                  {confirmPassword&&confirmPassword!==newPassword&&<p className="text-xs text-red-500 mt-1">{t('passwordsMismatch')}</p>}
                  {confirmPassword&&confirmPassword===newPassword&&<p className="text-xs text-green-500 mt-1">{t('passwordsMatch')}</p>}
                </div>
                {passwordError&&<div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertTriangleIcon size={16} className="text-red-500 flex-shrink-0"/>{passwordError}</div>}
                {passwordSuccess&&<div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircleIcon size={16} className="text-green-500 flex-shrink-0"/>{t('passwordUpdated')}</div>}
                <button type="submit" disabled={passwordSaving||!currentPassword||!newPassword||!confirmPassword||newPassword!==confirmPassword}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {passwordSaving?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t('updating')}</>:<><LockIcon size={16}/>{t('updatePassword')}</>}
                </button>
              </form>
            </div>
          )}
 
          {/* ACTIVITY */}
          {activeTab==='activity'&&(
            <div>
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="text-lg font-semibold text-gray-900">{t('activity')}</h3><p className="text-sm text-gray-500">{t('activityDesc')}</p></div>
                <button onClick={loadActivities} className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">{t('refresh')}</button>
              </div>
              {activitiesLoading?<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
              :activities.length>0?(
                <div className="space-y-1">
                  {activities.map((activity,idx)=>(
                    <div key={activity.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 ${idx===0?'bg-blue-50/50':''}`}>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">{getActivityIcon(activity.action)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-0.5"><ClockIcon size={12} className="text-gray-400"/><span className="text-xs text-gray-400">{formatDate(activity.created_at)}</span></div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap capitalize">{activity.action.replace(/_/g,' ')}</span>
                    </div>
                  ))}
                </div>
              ):(
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><ActivityIcon size={28} className="text-gray-400"/></div>
                  <h4 className="text-gray-900 font-medium mb-1">{t('noActivity')}</h4>
                  <p className="text-sm text-gray-500">{t('noActivityHint')}</p>
                </div>
              )}
            </div>
          )}
 
          {/* CONNECTED */}
          {activeTab==='connected'&&(
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('connected')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('connectedDesc')}</p>
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><LinkIcon size={20} className="text-blue-600"/></div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{t('comingSoonSocial')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('comingSoonSocialDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {socialProviders.map(provider=>(
                  <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white opacity-60">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.color} border`}>{provider.icon}</div>
                      <div><p className="text-sm font-medium text-gray-900">{provider.name}</p><p className="text-xs text-gray-400">{t('comingSoon')}</p></div>
                    </div>
                    <span className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg border border-gray-200 cursor-not-allowed">{t('notAvailableYet')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon size={18} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t('currentSignInMethod')}</p>
                    <p className="text-xs text-gray-500 mt-1">You are currently signing in with your email address <span className="font-medium text-gray-700">{email}</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {/* DANGER ZONE */}
          {activeTab==='danger'&&(
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold text-red-600 mb-1">{t('dangerZone')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('dangerZoneDesc')}</p>
              <div className="border border-gray-200 rounded-xl p-5 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div><h4 className="text-sm font-semibold text-gray-900">{t('exportData')}</h4><p className="text-xs text-gray-500 mt-1">{t('exportDataDesc')}</p></div>
                  <button onClick={async()=>{await logActivity('data_export_requested','Requested data export');alert('Your data export will be prepared and sent to your email address.');}}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">{t('exportData')}</button>
                </div>
              </div>
              <div className="border border-orange-200 rounded-xl p-5 bg-orange-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div><h4 className="text-sm font-semibold text-orange-800">{t('signOutAll')}</h4><p className="text-xs text-orange-600 mt-1">{t('signOutAllDesc')}</p></div>
                  <button onClick={async()=>{await logActivity('signout_all','Signed out of all sessions');onLogout();}}
                    className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors whitespace-nowrap border border-orange-300">
                    <div className="flex items-center gap-1.5"><LogOutIcon size={14}/>{t('signOutAllBtn')}</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default UserProfilePage;
