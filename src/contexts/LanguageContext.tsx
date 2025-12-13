import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'sw' | 'en';

interface Translations {
  [key: string]: {
    sw: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { sw: 'Nyumbani', en: 'Home' },
  channels: { sw: 'Vituo', en: 'Channels' },
  matches: { sw: 'Mechi', en: 'Matches' },
  profile: { sw: 'Wasifu', en: 'Profile' },
  
  // Auth
  login: { sw: 'Ingia', en: 'Login' },
  register: { sw: 'Jisajili', en: 'Register' },
  logout: { sw: 'Toka', en: 'Logout' },
  email: { sw: 'Barua pepe', en: 'Email' },
  password: { sw: 'Neno la siri', en: 'Password' },
  fullName: { sw: 'Jina kamili', en: 'Full Name' },
  phone: { sw: 'Nambari ya simu', en: 'Phone Number' },
  
  // Subscription
  subscription: { sw: 'Usajili', en: 'Subscription' },
  subscriptionStatus: { sw: 'Hali ya usajili', en: 'Subscription Status' },
  pending: { sw: 'Inasubiri', en: 'Pending' },
  active: { sw: 'Hai', en: 'Active' },
  expired: { sw: 'Imeisha', en: 'Expired' },
  expiresOn: { sw: 'Inaisha tarehe', en: 'Expires on' },
  subscribe: { sw: 'Jisajili', en: 'Subscribe' },
  subscriptionPrice: { sw: 'TSh 5,000 kwa siku 30', en: 'TSh 5,000 for 30 days' },
  
  // Payment
  payNow: { sw: 'Lipa Sasa', en: 'Pay Now' },
  paymentInstructions: { sw: 'Maelekezo ya malipo', en: 'Payment Instructions' },
  mpesaInstructions: { 
    sw: '1. Nenda M-Pesa\n2. Chagua Lipa kwa Namba\n3. Ingiza namba: 0123456789\n4. Kiasi: 5,000 TSh\n5. Thibitisha malipo\n6. Subiri uthibitisho', 
    en: '1. Go to M-Pesa\n2. Select Pay by Number\n3. Enter number: 0123456789\n4. Amount: 5,000 TSh\n5. Confirm payment\n6. Wait for approval' 
  },
  requestPayment: { sw: 'Omba Malipo', en: 'Request Payment' },
  paymentPending: { sw: 'Malipo yanasubiriwa', en: 'Payment Pending' },
  
  // Content
  liveNow: { sw: 'Sasa Moja kwa Moja', en: 'Live Now' },
  upcoming: { sw: 'Zinazokuja', en: 'Upcoming' },
  featured: { sw: 'Zilizoangaziwa', en: 'Featured' },
  allChannels: { sw: 'Vituo Vyote', en: 'All Channels' },
  categories: { sw: 'Makundi', en: 'Categories' },
  football: { sw: 'Mpira wa Miguu', en: 'Football' },
  sports: { sw: 'Michezo', en: 'Sports' },
  movies: { sw: 'Filamu', en: 'Movies' },
  entertainment: { sw: 'Burudani', en: 'Entertainment' },
  watchNow: { sw: 'Tazama Sasa', en: 'Watch Now' },
  
  // Trial
  freeTrialEnded: { 
    sw: 'Dakika zako za bure zimeisha. Tafadhali lipia ili kuendelea kutazama.', 
    en: 'Your free trial has ended. Please pay to continue watching.' 
  },
  trialTimeRemaining: { sw: 'Muda uliobaki', en: 'Time remaining' },
  upgradeNow: { sw: 'Boresha Sasa', en: 'Upgrade Now' },
  
  // Settings
  settings: { sw: 'Mipangilio', en: 'Settings' },
  language: { sw: 'Lugha', en: 'Language' },
  swahili: { sw: 'Kiswahili', en: 'Swahili' },
  english: { sw: 'Kiingereza', en: 'English' },
  
  // Admin
  admin: { sw: 'Msimamizi', en: 'Admin' },
  dashboard: { sw: 'Dashibodi', en: 'Dashboard' },
  users: { sw: 'Watumiaji', en: 'Users' },
  payments: { sw: 'Malipo', en: 'Payments' },
  manageChannels: { sw: 'Simamia Vituo', en: 'Manage Channels' },
  manageMatches: { sw: 'Simamia Mechi', en: 'Manage Matches' },
  manageSlideshow: { sw: 'Simamia Slideshow', en: 'Manage Slideshow' },
  approvePayment: { sw: 'Thibitisha Malipo', en: 'Approve Payment' },
  rejectPayment: { sw: 'Kataa Malipo', en: 'Reject Payment' },
  totalUsers: { sw: 'Watumiaji Wote', en: 'Total Users' },
  activeSubscriptions: { sw: 'Usajili Hai', en: 'Active Subscriptions' },
  pendingPayments: { sw: 'Malipo Yanasubiri', en: 'Pending Payments' },
  
  // Common
  loading: { sw: 'Inapakia...', en: 'Loading...' },
  error: { sw: 'Kosa limetokea', en: 'An error occurred' },
  success: { sw: 'Imefanikiwa', en: 'Success' },
  cancel: { sw: 'Ghairi', en: 'Cancel' },
  save: { sw: 'Hifadhi', en: 'Save' },
  delete: { sw: 'Futa', en: 'Delete' },
  edit: { sw: 'Hariri', en: 'Edit' },
  add: { sw: 'Ongeza', en: 'Add' },
  search: { sw: 'Tafuta', en: 'Search' },
  noResults: { sw: 'Hakuna matokeo', en: 'No results' },
  welcomeBack: { sw: 'Karibu tena', en: 'Welcome back' },
  getStarted: { sw: 'Anza', en: 'Get Started' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('sw');

  useEffect(() => {
    const saved = localStorage.getItem('prince_tv_language');
    if (saved === 'en' || saved === 'sw') {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('prince_tv_language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};