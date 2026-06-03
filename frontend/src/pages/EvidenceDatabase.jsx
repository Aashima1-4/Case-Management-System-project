import React, { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/auth';

const EvidenceDatabase = () => {
  const [cases, setCases] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');
  const user = auth.getCurrentUser();

  useEffect(() => {
    const load = async () => {
      const params = {
        limit: 50,
        sortBy,
        sortOrder,
        evidenceStatus: filterStatus || undefined,
      };
      const { cases: data } = await storage.getCases(params);
      const withEvidence = data.filter(
        (c) => c.evidenceStatus && c.evidenceStatus !== 'Registered'
      );
      setCases(filterStatus ? withEvidence : data.filter((c) => c.caseOpenDate || c.evidenceStatus));
    };
    load();
  }, [sortBy, sortOrder, filterStatus]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Evidence <span>Database</span></h2>
        <p>Cases with evidence progress and examination metadata.</p>
      </div>

      <div className="inventory-filters" style={{ marginBottom: '1rem' }}>
        <select
          className="input-field filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All evidence statuses</option>
          <option value="Under Examination">Under Examination</option>
          <option value="Reported">Reported</option>
          <option value="Collected">Collected</option>
        </select>
      </div>

      <div className="glass-card table-section" style={{ marginTop: '1rem' }}>
        {cases.length === 0 ? (
          <p className="empty-msg">No evidence records found.</p>
        ) : (
          <table className="case-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-btn" onClick={() => toggleSort('caseNo')}>Case No</button></th>
                <th><button type="button" className="sort-header-btn" onClick={() => toggleSort('firNo')}>FIR No</button></th>
                <th>Evidence Status</th>
                <th>Phase</th>
                <th>Parcels / Exhibits</th>
                <th>LA</th>
                {user?.role !== 'SA' && <th>Reported</th>}
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id || c.id}>
                  <td>{c.caseNo}</td>
                  <td>{c.firNo}</td>
                  <td>
                    <span className="status-badge">
                      {user?.role === 'SA' && (c.evidenceStatus === 'Reported' || c.evidenceStatus === 'Collected')
                        ? 'Under Examination'
                        : c.evidenceStatus}
                    </span>
                  </td>
                  <td>{c.evidencePhase || '—'}</td>
                  <td>{c.noOfParcels ?? 0} / {c.noOfExhibits ?? 0}</td>
                  <td>{c.laName || '—'}</td>
                  {user?.role !== 'SA' && <td>{c.reportedDate || '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EvidenceDatabase;
