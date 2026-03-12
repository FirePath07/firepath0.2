import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  PieChart, 
  Target, 
  Zap, 
  Coins, 
  Landmark
} from 'lucide-react';

interface FundIconProps {
  fundName: string;
  category?: string;
  className?: string;
}

export const FundIcon: React.FC<FundIconProps> = ({ fundName, category = '', className = '' }) => {
  const name = fundName.toLowerCase();
  const cat = category.toLowerCase();

  // 1. Check for AMC Logos (Official Option)
  const amcLogos: Record<string, string> = {
    'hdfc': 'https://logo.clearbit.com/hdfcfund.com',
    'icici': 'https://logo.clearbit.com/icicipruamc.com',
    'kotak': 'https://logo.clearbit.com/kotakmf.com',
    'sbi': 'https://logo.clearbit.com/sbimf.com',
    'axis': 'https://logo.clearbit.com/axismf.com',
    'uti': 'https://logo.clearbit.com/utimf.com',
    'parag parikh': 'https://logo.clearbit.com/amc.ppfas.com',
    'nippon': 'https://logo.clearbit.com/nipponindiamf.com',
    'dsp': 'https://logo.clearbit.com/dspim.com',
    'mirae': 'https://logo.clearbit.com/miraeassetmf.co.in',
    'tata': 'https://logo.clearbit.com/tatamutualfund.com',
    'quant': 'https://logo.clearbit.com/quantmutual.com',
    'motilal': 'https://logo.clearbit.com/motilaloswalmf.com',
  };

  let logoUrl = '';
  for (const [key, value] of Object.entries(amcLogos)) {
    if (name.includes(key)) {
      logoUrl = value;
      break;
    }
  }

  const [imageError, setImageError] = React.useState(false);

  // 1. Specialized Check for Gold
  if (name.includes('gold') || name.includes('bees')) {
    return (
      <div className={`flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full ${className}`}>
        <Coins size="60%" />
      </div>
    );
  }

  // 2. Category Fallbacks (Visual Option)
  const renderCategoryIcon = () => {
    if (cat.includes('debt') || cat.includes('bond') || cat.includes('liquid') || cat.includes('stable')) {
      return <Shield className="text-emerald-600 dark:text-emerald-400" size="60%" />;
    }
    if (cat.includes('index') || cat.includes('nifty') || cat.includes('sensex')) {
      return <TrendingUp className="text-blue-600 dark:text-blue-400" size="60%" />;
    }
    if (cat.includes('flexi') || cat.includes('multi') || cat.includes('diversified')) {
      return <PieChart className="text-purple-600 dark:text-purple-400" size="60%" />;
    }
    if (cat.includes('focused') || cat.includes('concentrated') || cat.includes('target')) {
      return <Target className="text-rose-600 dark:text-rose-400" size="60%" />;
    }
    if (cat.includes('small') || cat.includes('mid') || cat.includes('growth')) {
      return <Zap className="text-amber-600 dark:text-amber-400" size="60%" />;
    }
    
    // Default Generic
    return <Landmark className="text-slate-600 dark:text-slate-400" size="60%" />;
  };

  // 3. Render Logo if found AND no error occurred
  if (logoUrl && !imageError) {
    return (
      <div className={`flex items-center justify-center bg-white rounded-full overflow-hidden p-1 shadow-sm ${className}`}>
        <img 
          src={logoUrl} 
          alt={fundName} 
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // 4. Default Fallback
  return (
    <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full ${className}`}>
      {renderCategoryIcon()}
    </div>
  );
};
