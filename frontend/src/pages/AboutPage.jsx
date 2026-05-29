import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAboutContent } from '../api/about';
import PageBackNav from '../components/PageBackNav';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const iconMap = {
  Sparkles: <Sparkles className="h-8 w-8" />,
  ShieldCheck: <ShieldCheck className="h-8 w-8" />,
};

const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchAboutContent();
        setContent(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load about content:', err);
        setError(err?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Unable to load content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <PageBackNav />
      </div>
      {/* Stats */}
      <section className="pb-12 pt-4 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {content.stats.map((stat, idx) => (
              <motion.div
                key={stat.id || `stat-${idx}`}
                variants={itemVariants}
                className="rounded-2xl border border-orange-100/50 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm transition-shadow hover:shadow-xl"
              >
                <p className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  {stat.number}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold text-slate-950 md:text-5xl">Our Core Values</h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
              The principles that guide every decision, every recipe, and every delivery.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {content.coreValues.map((value, idx) => (
              <motion.div
                key={value.id || `value-${idx}`}
                variants={itemVariants}
                className="group rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white transition-all group-hover:shadow-lg">
                  {iconMap[value.icon] || <Sparkles className="h-8 w-8" />}
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">{value.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold text-slate-950 md:text-5xl">Why Choose ShopSweet?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
              Experience the difference that premium craftsmanship and genuine care can make.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2"
          >
            {content.whyChoose.map((item, idx) => (
              <motion.div
                key={item.id || `why-${idx}`}
                variants={itemVariants}
                className="flex gap-6 rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="flex-shrink-0 text-5xl">{item.icon}</div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-950">{item.title}</h3>
                  <p className="leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
