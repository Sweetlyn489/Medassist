import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listPatients } from '../../api/patients';
import './topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  async function handleSearch(value) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const { data } = await listPatients({ search: value, limit: 6 });
    setResults(data);
    setShowResults(true);
  }

  function goToPatient(id) {
    setShowResults(false);
    setQuery('');
    navigate(`/patients/${id}`);
  }

  return (
    <header className="topbar">
      <div className="topbar-search">
        <input
          type="text"
          placeholder="Search patients by name or ID..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
        />
        {showResults && (
          <div className="topbar-search-results">
            {results.length === 0 ? (
              <div className="topbar-search-empty">No matching patients</div>
            ) : (
              results.map((p) => (
                <div key={p._id} className="topbar-search-item" onMouseDown={() => goToPatient(p._id)}>
                  <span className="topbar-search-name">{p.firstName} {p.lastName}</span>
                  <span className="topbar-search-id mono">{p.patientId}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-user-name">{user?.name}</div>
          <div className="topbar-user-role">{user?.title || user?.role}</div>
        </div>
        <button className="btn btn-sm" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
