import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBackNav from '../components/PageBackNav';

const PosterGeneratorPage = () => {
  const [formData, setFormData] = useState({
    title: 'Sweet Deal food',
    subtitle: 'Try our handcrafted desserts.',
    theme: 'Choco Wave',
    background: 'pink-glow'
  });

  const [previewData, setPreviewData] = useState({
    title: 'Sweet Deal food',
    subtitle: 'Try our handcrafted desserts.',
    theme: 'Choco Wave',
    background: 'pink-glow'
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const activeTheme = themes[previewData.theme] || themes['Pink Glow'];
  const previewBackground = backgroundOptions.find(bg => bg.id === previewData.background)?.color || 'bg-gradient-to-br from-pink-300 to-orange-200';
  const previewTextColor = activeTheme.textColor;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <PageBackNav />
        <header className={`mb-8 rounded-[32px] border sm:mb-10 ${isDarkMode ? 'border-slate-800 bg-slate-950/90 shadow-xl shadow-slate-950/10' : 'border-white bg-white shadow-lg'} px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/20">
              <span className="text-2xl">🍬</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">SweetPoster</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create. Customize. Celebrate.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              ← Back
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <button className="rounded-full px-3 py-2 bg-pink-50 text-pink-600 shadow-sm shadow-pink-200">Poster Generator</button>
              <button className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">My Posters</button>
              <button className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Templates</button>
              <Link
                to="/contact"
                className="rounded-full px-3 py-2 border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Contact
              </Link>
            </nav>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex h-12 w-12 items-center justify-center rounded-3xl border ${isDarkMode ? 'border-slate-700 bg-slate-900 text-amber-300' : 'border-slate-200 bg-white text-slate-900'} transition-all duration-300 hover:scale-105`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-pink-500/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <span>⬇️</span>
              Download Poster
            </button>
          </div>
        </header>

        <main className="grid gap-8 xl:grid-cols-[1.03fr_1fr]">
          <section className={`rounded-[32px] border ${isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-white bg-white'} shadow-2xl shadow-slate-200/50 p-8`}>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-pink-600 dark:text-pink-400">Design Your Sweet Poster</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Customize your poster with colors, text, and themes. See live preview on the right.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Poster Title</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300">T</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value.slice(0, 60))}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    placeholder="Sweet Deal food"
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formData.title.length}/60</span>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Subtitle</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300">Tt</span>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => handleFormChange('subtitle', e.target.value.slice(0, 100))}
                    rows={2}
                    className="min-h-[72px] w-full resize-none bg-transparent text-sm font-medium text-slate-900 outline-none dark:text-slate-100"
                    placeholder="Try our handcrafted desserts."
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formData.subtitle.length}/100</span>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Theme Style</label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleFormChange('theme', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition duration-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {Object.keys(themes).map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Themes</label>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(themes).map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleFormChange('theme', theme)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${formData.theme === theme ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">Background Style</label>
                <div className="grid grid-cols-4 gap-3">
                  {backgroundOptions.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => handleFormChange('background', bg.id)}
                      className={`h-20 rounded-3xl border transition-all duration-300 ${formData.background === bg.id ? 'border-pink-500 shadow-lg shadow-pink-500/20' : 'border-transparent'} ${bg.color}`}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpdatePreview}
                disabled={isUpdating}
                className="w-full rounded-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/20 transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdating ? 'Updating Preview...' : 'Update Preview'}
              </button>
            </div>
          </section>

          <section className={`rounded-[32px] border ${isDarkMode ? 'border-slate-800 bg-slate-900/95' : 'border-white bg-white'} shadow-2xl shadow-slate-200/50 p-8`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Live Preview</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Auto updated</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
                <span className={isUpdating ? 'h-2.5 w-2.5 rounded-full bg-amber-400' : 'h-2.5 w-2.5 rounded-full bg-emerald-500'} />
                {isUpdating ? 'Refreshing' : 'Auto updated'}
              </span>
            </div>

            <div className={`relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl ${previewBackground}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_20%)]" />
              <div className="relative px-6 py-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="rounded-full bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 backdrop-blur-sm border border-amber-200/10">
                    special offer
                  </span>
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    UP TO <span className="text-2xl">20%</span>
                  </div>
                </div>

                <div className="mb-4 max-w-2xl">
                  <h1 className={`text-5xl font-black tracking-[-0.04em] ${previewTextColor}`}>
                    {previewData.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-lg font-medium text-white/90">
                    {previewData.subtitle}
                  </p>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                    alt="Colorful Indian sweets arranged on a dessert platter"
                    className="h-[360px] w-full object-cover"
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] bg-white/5 p-5 text-center text-white">
                    <p className="text-2xl font-black">100%</p>
                    <p className="mt-1 text-xs uppercase opacity-80">Pure Ingredients</p>
                  </div>
                  <div className="rounded-[28px] bg-white/5 p-5 text-center text-white">
                    <p className="text-2xl font-black">Premium</p>
                    <p className="mt-1 text-xs uppercase opacity-80">Quality</p>
                  </div>
                  <div className="rounded-[28px] bg-white/5 p-5 text-center text-white">
                    <p className="text-2xl font-black">Freshly</p>
                    <p className="mt-1 text-xs uppercase opacity-80">Made</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/70 px-6 py-4 text-center text-sm text-amber-100/80">
                  Sweetness in every bite. Happiness in every moment. ♥
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PosterGeneratorPage;
