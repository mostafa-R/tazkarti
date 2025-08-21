import { User, Calendar } from 'lucide-react';

export default function RoleSelector({ selectedRole, onSelect }) {
  const Card = ({ role, title, subtitle, Icon }) => {
    const active = selectedRole === role;
    return (
      <button
        type="button"
        onClick={() => onSelect(role)}
        className={`w-full text-left border rounded-2xl p-5 transition-all
          ${active ? 'ring-2 ring-[#0052CC] bg-blue-50' : 'border-gray-200 hover:border-[#0052CC]'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${active ? 'bg-[#0052CC] text-white' : 'bg-gray-100 text-[#0052CC]'}`}>
            <Icon size={24} />
          </div>
          <div>
            <div className={`font-semibold ${active ? 'text-[#0052CC]' : 'text-gray-900'}`}>{title}</div>
            <div className="text-sm text-gray-500">{subtitle}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Choose Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card role="user" title="User" subtitle="Ticket Buyer" Icon={User} />
        <Card role="organizer" title="Organizer" subtitle="Event Host" Icon={Calendar} />
      </div>
    </div>
  );
}
