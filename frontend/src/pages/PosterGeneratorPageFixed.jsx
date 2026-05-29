import { useState } from 'react';

const PosterGeneratorPage = () => {
  const [formData, setFormData] = useState({
    title: 'Sweet Deal',
    subtitle: 'Try our handcrafted desserts.',
    theme: 'Pink Glow',
    background: 'pink-glow'
  });

  const [previewData, setPreviewData] = useState({
    title: 'Sweet Deal',
    subtitle: 'Try our handcrafted desserts.',
    theme: 'Pink Glow',
    background: 'pink-glow'
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState('generator');

  const sectionTitles = {
    generator: 'Poster Generator',
    posters: 'My Posters',
    templates: 'Templates'
  };

  const sampleCards = {
    posters: [
      { id: 1, title: 'Festive Sweets', subtitle: 'Celebrate with bright offers', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop' },
      { id: 2, title: 'Sweet Bakery', subtitle: 'Fresh treats every day', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop' }
    ],
    templates: [
      { id: 1, title: 'Bold Sale', subtitle: 'High-impact promotional layout', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop' },
      { id: 2, title: 'Minimal Dessert', subtitle: 'Soft pastel template for desserts', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=400&fit=crop' }
    ]
  };

  const themes = {
    'Pink Glow': {
      gradient: 'from-pink-300 via-pink-200 to-orange-200',
      textColor: 'text-gray-900',
      isDark: false
    },
    'Choco Wave': {
      gradient: 'from-amber-900 via-amber-700 to-amber-600',
      textColor: 'text-amber-50',
      isDark: true
    },
    'Festive Sparkle': {
      gradient: 'from-blue-900 via-cyan-700 to-teal-600',
      textColor: 'text-cyan-50',
      isDark: true
    },
    'Minimal Cream': {
      gradient: 'from-amber-50 to-orange-100',
      textColor: 'text-gray-950',
      isDark: false
    }
  };

  const backgroundOptions = [
    { id: 'pink-glow', label: 'Pink Glow', color: 'bg-gradient-to-br from-pink-300 to-orange-200' },
    { id: 'choco-wave', label: 'Choco Wave', color: 'bg-gradient-to-br from-amber-900 to-amber-600' },
    { id: 'festive', label: 'Festive', color: 'bg-gradient-to-br from-blue-900 to-teal-600' },
    { id: 'cream', label: 'Cream', color: 'bg-gradient-to-br from-amber-50 to-orange-100' }
  ];

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePreview = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setPreviewData({ ...formData });
      setIsUpdating(false);
    }, 300);
  };

  const handleDownload = () => {
    alert('Download functionality coming soon! Your poster will be saved as PNG.');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  const activeTheme = themes[previewData.theme] || themes['Pink Glow'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-white via-pink-50 to-orange-50'}`}>
      <nav className={`backdrop-blur-xl border-b transition-all duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white/80 border-pink-100/30'}`}>
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  SweetPoster
                </h1>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-pink-600'}`}>
                  Create. Customize. Celebrate.
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['generator', 'posters', 'templates'].map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => handleSectionChange(section)}
                  className={`font-medium transition-colors ${activeSection === section ? 'text-pink-600 underline underline-offset-4 decoration-pink-400' : isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {section === 'generator' ? 'Poster Generator' : section === 'posters' ? 'My Posters' : 'Templates'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-pink-100 text-pink-600'} hover:scale-110`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleDownload}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300"
              >
                ⬇️ Download
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-xl">
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className={`mt-4 space-y-2 pb-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-pink-100'}`}>
              {['generator', 'posters', 'templates'].map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => handleSectionChange(section)}
                  className="w-full text-left block py-2 text-pink-600 font-medium"
                >
                  {section === 'generator' ? 'Poster Generator' : section === 'posters' ? 'My Posters' : 'Templates'}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="w-full px-6 py-10">
        {activeSection === 'generator' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className={`rounded-3xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-8 h-fit`}>
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Design Your Sweet Poster
                </h2>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Customize your poster with colors, text, and themes. See live preview on the right.
                </p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Poster Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value.slice(0, 60))}
                      maxLength={60}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-pink-500' : 'bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200 focus:border-pink-500'}`}
                      placeholder="Enter poster title..."
                    />
                    <span className={`absolute right-4 top-3 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formData.title.length}/60
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Subtitle
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.subtitle}
                      onChange={(e) => handleFormChange('subtitle', e.target.value.slice(0, 100))}
                      maxLength={100}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-105 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-pink-500' : 'bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200 focus:border-pink-500'}`}
                      placeholder="Enter subtitle..."
                    />
                    <span className={`absolute right-4 bottom-3 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formData.subtitle.length}/100
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Theme Style
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => handleFormChange('theme', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none font-medium ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-pink-500' : 'bg-white border-pink-200 focus:border-pink-500'}`}
                  >
                    {Object.keys(themes).map((theme) => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Quick Themes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(themes).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => handleFormChange('theme', theme)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${formData.theme === theme ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white scale-105 shadow-lg shadow-pink-500/50' : isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Background Style
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {backgroundOptions.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleFormChange('background', bg.id)}
                        title={bg.label}
                        className={`aspect-square rounded-lg border-3 transition-all duration-300 overflow-hidden ${formData.background === bg.id ? `border-pink-500 scale-105 shadow-lg shadow-pink-500/50 ${bg.color}` : `border-transparent ${bg.color}`}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleUpdatePreview}
                  disabled={isUpdating}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className={isUpdating ? 'animate-spin inline-block' : ''}>🔄</span>
                  {isUpdating ? 'Updating...' : 'Update Preview'}
                </button>
              </div>
            </div>
            <div className={`rounded-3xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-8 h-fit sticky top-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Live Preview</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${isUpdating ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{isUpdating ? 'Updating...' : 'Live'}</span>
                </div>
              </div>
              <div className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 bg-gradient-to-br ${themes[previewData.theme]?.gradient || 'from-pink-300 to-orange-200'} aspect-[9/12] flex flex-col`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10 flex flex-col h-full p-6">
                  <div className="inline-block self-start mb-4">
                    <span className={`px-4 py-2 rounded-full text-xs font-black backdrop-blur-md ${activeTheme.isDark ? 'bg-white/20 text-white border border-white/30' : 'bg-white/40 text-gray-900 border border-white/50'}`}>
                      ✨ SPECIAL OFFER
                    </span>
                  </div>
                  <div className="mb-3">
                    <h1 className="text-5xl font-black leading-tight bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                      {previewData.title}
                    </h1>
                  </div>
                  <p className={`text-lg font-semibold mb-6 ${activeTheme.textColor} opacity-90`}>
                    {previewData.subtitle}
                  </p>
                  <div className="flex-1 flex items-center justify-center my-4">
                    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 backdrop-blur-sm">
                      <img
                        src="https://images.unsplash.com/photo-1616203969510-95a5d63329db?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Indian Sweets - Laddu, Kaju Katli, Rasgulla"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <div className="absolute top-24 right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                    <div className="text-center">
                      <p className="text-xs font-black text-white">UP TO</p>
                      <p className="text-2xl font-black text-white">20%</p>
                      <p className="text-xs font-black text-white">OFF</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t-4 border-white/30">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-black text-white">✔</p>
                        <p className="text-xs font-bold text-white">Pure Ingredients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-white">✔</p>
                        <p className="text-xs font-bold text-white">Premium Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-white">✔</p>
                        <p className="text-xs font-bold text-white">Freshly Made</p>
                      </div>
                    </div>
                    <p className="text-center text-xs font-black text-white/90">
                      Sweetness in every bite. Happiness in every moment.
                    </p>
                  </div>
                </div>
              </div>
              <p className={`text-center text-xs mt-4 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Changes update automatically. Click "Update Preview" for manual refresh.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className={`rounded-3xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-8`}>
              <button
                type="button"
                onClick={() => handleSectionChange('generator')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
              >
                ← Back to Generator
              </button>
              <div className="mt-8 space-y-4">
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                    {sectionTitles[activeSection]}
                  </h2>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {activeSection === 'posters'
                      ? 'View your saved poster previews and select one to load into the editor.'
                      : 'Browse beautiful ready-made templates designed for quick campaigns.'}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {sampleCards[activeSection].map((card) => (
                    <div key={card.id} className={`rounded-3xl overflow-hidden border transition-shadow duration-300 ${isDarkMode ? 'border-slate-700 shadow-slate-800' : 'border-pink-100 shadow-pink-200'} shadow-lg`}>
                      <img src={card.image} alt={card.title} className="w-full h-56 object-cover" />
                      <div className={`p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{card.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{card.subtitle}</p>
                        <button
                          type="button"
                          onClick={() => handleSectionChange('generator')}
                          className="mt-6 inline-flex items-center justify-center w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white hover:opacity-95 transition-colors"
                        >
                          Use This {activeSection === 'templates' ? 'Template' : 'Poster'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterGeneratorPage;
