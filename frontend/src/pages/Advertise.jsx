import React, { useState } from 'react';
import './Advertise.css';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  adType: 'Display Banners',
  message: ''
};

const adTypes = [
  'Display Banners',
  'Sponsored Articles',
  'Video Ads',
  'Social/Boosted Posts',
  'Other'
];

const Advertise = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.company.trim()) return 'Company name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
    if (!/^[0-9+\-\s()]{7,}$/.test(form.phone)) return 'Valid phone number is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    try {
      setSubmitting(true);
      // Use neutral path to avoid ad blockers in production
      const res = await fetch(`${baseUrl}/api/marketing-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }
      setStatus({ type: 'success', message: 'Thanks! We will contact you shortly.' });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adv-page">
      <div className="adv-card">
        <header className="adv-header">
          <h1 className="adv-title">Advertise with us</h1>
          <p className="adv-subtitle">Share your details and we will get back to you.</p>
        </header>

        {status && (
          <div className={status.type === 'success' ? 'adv-alert success' : 'adv-alert error'}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="adv-form" noValidate>
          <div className="adv-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          </div>

          <div className="adv-field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" value={form.company} onChange={handleChange} placeholder="Your company/brand" required />
          </div>

          <div className="adv-row">
            <div className="adv-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@company.com" required />
            </div>
            <div className="adv-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" required />
            </div>
          </div>

          <div className="adv-field">
            <label htmlFor="adType">Type of ads</label>
            <select id="adType" name="adType" value={form.adType} onChange={handleChange}>
              {adTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="adv-field">
            <label htmlFor="message">Notes (optional)</label>
            <textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange} placeholder="Budget, target audience, preferred dates, etc."></textarea>
          </div>

          <div className="adv-actions">
            <button type="submit" className="adv-submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Advertise;


