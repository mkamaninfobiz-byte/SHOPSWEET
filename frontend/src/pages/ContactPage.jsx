import { useState } from 'react';
import PageBackNav from '../components/PageBackNav';
import { Link } from 'react-router-dom';
import { sendContactMessage } from '../api/contact';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [status, setStatus] = useState({ loading: false, success: '', error: '', previewUrl: '' });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '', previewUrl: '' });

    const { name, email, phone, message } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setStatus({ loading: false, success: '', error: 'Please complete all required fields.', previewUrl: '' });
      return;
    }

    try {
      const response = await sendContactMessage(formData);
      setStatus({
        loading: false,
        success: 'Thank you! Your message has been submitted.',
        error: '',
        previewUrl: response?.previewUrl || '',
      });
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (error) {
      setStatus({ loading: false, success: '', error: error?.message || 'Something went wrong. Please try again.', previewUrl: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageBackNav />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-xl shadow-slate-200/40">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-600">Contact Us</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Let's make your sweet event unforgettable.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Share your question, idea, or feedback and we will get back to you soon. Our team is ready to help with orders, posters, and custom sweets.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Your Name
                <input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="Enter your name"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="name@example.com"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Phone Number
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="Enter your phone"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Subject
                <select
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                >
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Poster Request</option>
                  <option>Feedback</option>
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Message
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                placeholder="Write your message here"
              />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {status.error && <p className="text-sm font-medium text-red-600">{status.error}</p>}
                {status.success && <p className="text-sm font-medium text-emerald-700">{status.success}</p>}
                {status.previewUrl && (
                  <p className="mt-2 text-sm text-slate-600">
                    Your message was submitted using a test email account. Preview the email here:{' '}
                    <a href={status.previewUrl} target="_blank" rel="noreferrer" className="font-semibold text-pink-600 hover:underline">
                      open preview
                    </a>
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={status.loading}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>

          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-gradient-to-b from-pink-50 to-orange-50 p-8 shadow-xl shadow-slate-200/40">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Contact info</h2>
              <p className="mt-3 text-sm text-slate-600">Reach us for orders, poster customization, or general questions.</p>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p>support@shopsweet.com</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <p>+91 98765 43210</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Address</p>
                  <p>123 Sweet Lane, Dessert City, India</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">Working hours</h3>
              <p className="mt-3 text-sm text-slate-600">Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p className="mt-3 text-sm text-slate-600">Sun: 10:00 AM - 6:00 PM</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
