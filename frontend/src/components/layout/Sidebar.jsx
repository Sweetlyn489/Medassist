import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icons';
import './sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const clinicianNav = [
    { to: '/', label: 'Clinical Dashboard', icon: 'activity', end: true },
    { to: '/patients', label: 'Patient Directory', icon: 'users' },
    { to: '/findings', label: 'CDS Findings Queue', icon: 'alert-octagon' },
    { to: '/followups', label: 'Follow-up Schedule', icon: 'calendar' },
    { to: '/settings', label: 'CDS Rules Reference', icon: 'shield' },
  ];

  const adminNav = [
    { to: '/', label: 'System Dashboard', icon: 'sliders', end: true },
    { to: '/admin/users', label: 'Staff & Clinicians', icon: 'users' },
    { to: '/patients', label: 'Patient Accounts', icon: 'folder' },
    { to: '/settings', label: 'CDS Rule Governance', icon: 'shield' },
    { to: '/audit-log', label: 'Audit & Compliance', icon: 'file-text' },
  ];

  const navItems = isAdmin ? adminNav : clinicianNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">
          <Icon name={isAdmin ? 'shield' : 'activity'} size={15} color="#fff" />
        </span>
        <div>
          <div className="sidebar-brand-name">MediAssist</div>
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: isAdmin ? '#93c5fd' : '#2dd4bf',
            }}
          >
            {isAdmin ? 'Admin Console' : 'Clinical EHR'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Icon name={item.icon} size={15} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-disclaimer">
          {isAdmin ? (
            <span>
              <strong>HIPAA Security Notice:</strong> Administrative actions are logged for audit compliance.
            </span>
          ) : (
            <span>
              <strong>Clinical CDS:</strong> Decision-support cues require professional evaluation.
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
