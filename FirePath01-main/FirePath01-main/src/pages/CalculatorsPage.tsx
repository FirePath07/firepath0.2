import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { FIRECalculator } from '../components/FIRECalculator';
import { SIPCalculator } from '../components/SIPCalculator';

type CalculatorTab = 'fire' | 'sip';

export const CalculatorsPage = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('fire');

  const renderActiveCalculator = () => {
    switch (activeTab) {
      case 'fire':
        return <FIRECalculator />;
      case 'sip':
        return <SIPCalculator />;
      default:
        return <FIRECalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation showFullNav={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex gap-6 px-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('fire')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'fire'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                FIRE Calculator
              </button>
              <button
                onClick={() => setActiveTab('sip')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'sip'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                SIP Calculator
              </button>
            </nav>
          </div>

          <div className="p-8">
            {renderActiveCalculator()}
          </div>
        </div>
      </main>
    </div>
  );
};
