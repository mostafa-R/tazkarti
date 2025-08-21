import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';

export default function OrganizerSignupForm({ onBack }) {
  const [show, setShow] = useState({ pass: false, confirm: false });
  const [fields, setFields] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    country: 'Egypt', city: '', street: '', zip: '',
    orgName: '', orgDescription: '', bio: '',
    profileImage: null,
  });

  const onChange = (name, value) => setFields(prev => ({ ...prev, [name]: value }));

  const submit = (e) => {
    e.preventDefault();
    
    console.log('Organizer signup payload', fields);
    alert('Organizer signup submitted (demo)');
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-[#0052CC] text-sm hover:underline">← Back to Role Selection</button>

      <form onSubmit={submit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" required value={fields.firstName} onChange={v => onChange('firstName', v)} />
            <Input label="Last Name" required value={fields.lastName} onChange={v => onChange('lastName', v)} />
          </div>
          <Input type="email" label="Email" required value={fields.email} onChange={v => onChange('email', v)} />
          <Input label="Phone (optional)" value={fields.phone} onChange={v => onChange('phone', v)} placeholder="01XXXXXXXXX" />
        </div>

        {/* Account Security */}
        <div>
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Account Security</h4>
          <Password
            label="Password"
            value={fields.password}
            onChange={v => onChange('password', v)}
            show={show.pass}
            toggle={() => setShow(s => ({ ...s, pass: !s.pass }))}
          />
          <Password
            label="Confirm Password"
            value={fields.confirmPassword}
            onChange={v => onChange('confirmPassword', v)}
            show={show.confirm}
            toggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
          />
          <p className="text-xs text-gray-500 mt-1">Min 8 chars, include uppercase, lowercase, number, special</p>
        </div>

        {/* Address */}
        <div>
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Country" value={fields.country} onChange={v => onChange('country', v)}
              options={['Egypt','United Arab Emirates','Saudi Arabia','Jordan','Lebanon']} />
            <Input label="City" required value={fields.city} onChange={v => onChange('city', v)} />
            <Input label="Street" required value={fields.street} onChange={v => onChange('street', v)} />
            <Input label="ZIP Code" required value={fields.zip} onChange={v => onChange('zip', v)} />
          </div>
        </div>

        {/* Organization */}
        <div>
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Organization Information</h4>
          <Input label="Organization Name" required value={fields.orgName} onChange={v => onChange('orgName', v)} />
          <Textarea label="Organization Description" required maxLength={500}
            value={fields.orgDescription} onChange={v => onChange('orgDescription', v)} />
          <Textarea label="Bio (optional)" maxLength={300}
            value={fields.bio} onChange={v => onChange('bio', v)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image (optional)</label>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-[#0052CC] hover:bg-blue-50">
              <Upload className="mx-auto mb-2 text-[#0052CC]" />
              <span className="text-sm">Click to upload</span>
              <input type="file" className="hidden" accept="image/*"
                onChange={(e)=> onChange('profileImage', e.target.files?.[0] || null)} />
            </label>
            {fields.profileImage && <p className="text-sm text-green-600 mt-2">✓ {fields.profileImage.name}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#0052CC] hover:bg-[#003d99] text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Sign Up as Organizer
        </button>
      </form>
    </div>
  );
}

/* --- Small UI helpers (Inputs) --- */
function Input({ label, value, onChange, type='text', placeholder='', required=false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
      />
    </div>
  );
}

function Password({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
          placeholder="Enter password"
          required
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, required=false, maxLength, placeholder='' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent min-h-[96px] resize-vertical"
      />
      {maxLength && <p className="text-xs text-gray-500 mt-1">Max {maxLength} characters</p>}
    </div>
  );
}
