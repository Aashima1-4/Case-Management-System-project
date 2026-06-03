import React, { useState, useEffect } from "react";

const StatusDateIcon = ({ status }) => {
  const icons = {
    "Under Examination": (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    "Reported": (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    "Collected": (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    )
  };
  return icons[status] || null;
};

const CaseForm = ({ onSubmit, initialData, onCancel, user }) => {
  const [formData, setFormData] = useState({
    caseNo: "",
    firNo: "",
    us: "",
    rcNo: "",
    date: "",
    personName: "",
    time: "",
    laFunctionalDetails: "",
    isLACompleted: false,
    allottedTo: "",
    allottedBy: "",
    allottedDate: "",
    allottedTime: "",
    teamMemberName: "",
    teamMemberPosition: "",
    teamAssignmentDate: "",
    teamAssignmentTime: "",
    caseOpenDate: "",
    caseOpenTime: "",
    noOfParcels: "",
    noOfExhibits: "",
    conditionOfExhibit: "",
    whoHelped: "",
    pendingReason: "",
    evidenceStatus: "Registered",
    evidencePhase: "",
    startedDate: "",
    finishDate: "",
    reportedDate: "",
    collectedDate: ""
  });

  const isAdmin = user?.role === "Admin";
  const isLA = user?.role === "LA";
  const isSA = user?.role === "SA";
  const isSSA = user?.role === "SSA";
  const isSSO = user?.role === "SSO";
  const isProcessCompleted = formData.isLACompleted;
  const canEditTeam = isAdmin || isSSO;
  
  // Base fields are locked if process is completed (unless Admin or LA) or if the user is an SA
  // LA can always edit their own base fields regardless of completion status
  const isBaseFieldDisabled = (isProcessCompleted && !isAdmin && !isLA) || isSA || (isSSO && initialData);
  
  // SA details can be edited by SA, SSA, SSO, Admin
  const canEditSADetails = isSA || isSSA || isSSO || isAdmin;
  const canEditPendingReason = isSSO;

  useEffect(() => {
    if (initialData) setFormData({
      ...formData,
      ...initialData
    });
    else setFormData({
        caseNo: "",
        firNo: "",
        us: "",
        rcNo: "",
        date: "",
        personName: "",
        time: "",
        laFunctionalDetails: "",
        isLACompleted: false,
        allottedTo: "",
        allottedBy: "",
        allottedDate: "",
        allottedTime: "",
        teamMemberName: "",
        teamMemberPosition: "",
        teamAssignmentDate: "",
        teamAssignmentTime: "",
        caseOpenDate: "",
        caseOpenTime: "",
        noOfParcels: "",
        noOfExhibits: "",
        conditionOfExhibit: "",
        whoHelped: "",
        pendingReason: "",
        evidenceStatus: "Registered",
        evidencePhase: ""
      });
  }, [initialData]);

  const handleCaseNoChange = (value) => {
    // Standardize to uppercase and limit length to 12 (NN-AA-NNNNNN)
    const val = value.toUpperCase().slice(0, 12);
    
    // Character-by-character validation as they type
    let valid = true;
    for (let i = 0; i < val.length; i++) {
      const char = val[i];
      if (i === 0 || i === 1) { // NN
        if (!/\d/.test(char)) valid = false;
      } else if (i === 2) { // Separator
        if (char !== "-" && char !== "/") valid = false;
      } else if (i === 3 || i === 4) { // AA
        if (!/[A-Z]/.test(char)) valid = false;
      } else if (i === 5) { // Separator
        if (char !== "-" && char !== "/") valid = false;
      } else if (i >= 6) { // N (1 to 6 digits)
        if (!/\d/.test(char)) valid = false;
      }
    }

    if (valid || val === "") {
      setFormData({...formData, caseNo: val});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final format check on submission: NN-AA- (1 to 6 digits)
    const caseNoRegex = /^\d{2}[-/][A-Z]{2}[-/]\d{1,6}$/;
    if (!caseNoRegex.test(formData.caseNo)) {
      alert("Invalid Case No format! Expected: 23-CY-24 or 23-CY-202400 (2 digits, 2 letters, 1-6 digits)");
      return;
    }

    onSubmit(formData);
    if (!initialData) setFormData({
        caseNo: "",
        firNo: "",
        us: "",
        rcNo: "",
        date: "",
        personName: "",
        time: "",
        laFunctionalDetails: "",
        isLACompleted: false,
        allottedTo: "",
        allottedBy: "",
        allottedDate: "",
        allottedTime: "",
        teamMemberName: "",
        teamMemberPosition: "",
        teamAssignmentDate: "",
        teamAssignmentTime: "",
        caseOpenDate: "",
        caseOpenTime: "",
        noOfParcels: "",
        noOfExhibits: "",
        conditionOfExhibit: "",
        whoHelped: "",
        pendingReason: "",
        evidenceStatus: "Registered",
        evidencePhase: "",
        startedDate: "",
        finishDate: "",
        reportedDate: "",
        collectedDate: ""
    });
  };

  return (
    <form className="case-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="field-label">Case No (Format: 23-CY-1 to 23-CY-202400)</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g., 23-CY-101" 
            value={formData.caseNo}
            onChange={(e) => handleCaseNoChange(e.target.value)}
            disabled={isBaseFieldDisabled}
            required 
            pattern="\d{2}[-/][A-Z]{2}[-/]\d{1,6}"
            title="Format: 2 digits - 2 letters - (1 to 6 digits)"
            maxLength="12"
          />
        </div>
        <div className="form-group">
          <label className="field-label">FIR No</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="FIR No" 
            value={formData.firNo}
            onChange={(e) => setFormData({...formData, firNo: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
        <div className="form-group">
          <label className="field-label">U/S (Section)</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="U/S (Section)" 
            value={formData.us}
            onChange={(e) => setFormData({...formData, us: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
        <div className="form-group">
          <label className="field-label">RC No</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="RC No" 
            value={formData.rcNo}
            onChange={(e) => setFormData({...formData, rcNo: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
        <div className="form-group">
          <label className="field-label">Date</label>
          <input 
            type="date" 
            className="input-field" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
        <div className="form-group">
          <label className="field-label">Person Name</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Person Name" 
            value={formData.personName}
            onChange={(e) => setFormData({...formData, personName: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
        <div className="form-group">
          <label className="field-label">Time</label>
          <input 
            type="time" 
            className="input-field" 
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            disabled={isBaseFieldDisabled}
            required 
          />
        </div>
      </div>

      {(isLA || isAdmin) && !isSA && (
        <div className="la-details-section">
          <h4>LA Functional Details</h4>
          <textarea 
            className="input-field" 
            placeholder="Enter technical/functional details of the case analysis..."
            rows="4"
            value={formData.laFunctionalDetails}
            onChange={(e) => setFormData({...formData, laFunctionalDetails: e.target.value})}
          ></textarea>
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={formData.isLACompleted}
              onChange={(e) => setFormData({...formData, isLACompleted: e.target.checked})}
            />
            Mark analysis as completed (Ready for Allotment)
          </label>
        </div>
      )}

      {!isLA && (canEditSADetails || formData.caseOpenDate) && (
        <div className="sa-details-section team-assignment-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <h4 style={{ color: 'var(--primary-light)', marginBottom: '1rem', letterSpacing: '1px' }}>Case Opening Details (SA)</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Case Open Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.caseOpenDate}
                onChange={(e) => setFormData({...formData, caseOpenDate: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
            <div className="form-group">
              <label>Case Open Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={formData.caseOpenTime}
                onChange={(e) => setFormData({...formData, caseOpenTime: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
            <div className="form-group">
              <label>No. of Parcels</label>
              <input 
                type="number" 
                min="0"
                step="1"
                className="input-field" 
                placeholder="0"
                value={formData.noOfParcels}
                onChange={(e) => setFormData({...formData, noOfParcels: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
            <div className="form-group">
              <label>No. of Exhibits</label>
              <input 
                type="number" 
                min="0"
                step="1"
                className="input-field" 
                placeholder="0"
                value={formData.noOfExhibits}
                onChange={(e) => setFormData({...formData, noOfExhibits: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
            <div className="form-group">
              <label>Condition of Exhibit</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="E.g. Intact, Damaged, Sealed..."
                value={formData.conditionOfExhibit}
                onChange={(e) => setFormData({...formData, conditionOfExhibit: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
            <div className="form-group">
              <label>Who Helped Opening?</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Name / Role"
                value={formData.whoHelped}
                onChange={(e) => setFormData({...formData, whoHelped: e.target.value})}
                disabled={!canEditSADetails}
              />
            </div>
          </div>
        </div>
      )}

      {!isLA && (canEditSADetails || formData.evidenceStatus) && (
        <div className="sa-details-section team-assignment-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <h4 style={{ color: 'var(--primary-light)', marginBottom: '1rem', letterSpacing: '1px' }}>Evidence & Case Progress Details</h4>
          <div className="form-grid">
            <div className="form-group phase-selector-group">
              <label>Case Status</label>
              <div className="phase-grid">
                {["Under Examination", "Reported", "Collected"]
                  .filter(status => {
                    // Role-based filtering (Strict)
                    if (isAdmin) return true;
                    if (isSA) return status === "Under Examination";
                    if (isSSA || isSSO) return status === "Under Examination" || status === "Reported";
                    return true; // LA sees all but maybe can only edit Collected? (User said SA/SSA/SSO/Admin for SADetails)
                  })
                  .map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`phase-btn ${formData.evidenceStatus === status ? 'active' : ''}`}
                    onClick={() => {
                      if (canEditSADetails) {
                        setFormData({...formData, evidenceStatus: status});
                      }
                    }}
                    disabled={!canEditSADetails}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Pending Reason</label>
              <select
                className="input-field"
                value={formData.pendingReason}
                onChange={(e) => setFormData({...formData, pendingReason: e.target.value})}
                disabled={!canEditPendingReason}
              >
                <option value="">Select pending reason</option>
                <option value="Pendrive">Pendrive</option>
                <option value="Hard Disk">Hard Disk</option>
              </select>
              {!canEditPendingReason && (
                <small className="field-note">Only SSO can set or update this pending reason.</small>
              )}
            </div>

            <div className="status-dates-container" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group status-date-group examination">
                  <label><StatusDateIcon status="Under Examination" /> Case Started Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.startedDate}
                    onChange={(e) => setFormData({...formData, startedDate: e.target.value})}
                    disabled={!isAdmin && !isSA && !isSSA && !isSSO} // LA is read-only for this
                  />
                </div>
                <div className="form-group status-date-group examination">
                  <label><StatusDateIcon status="Under Examination" /> Case Finish Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.finishDate}
                    onChange={(e) => setFormData({...formData, finishDate: e.target.value})}
                    disabled={!isAdmin && !isSA && !isSSA && !isSSO} // LA is read-only for this
                  />
                </div>

                {(!isSA || isAdmin) && (
                  <div className="form-group status-date-group reported">
                    <label><StatusDateIcon status="Reported" /> Reported Date</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={formData.reportedDate}
                      onChange={(e) => setFormData({...formData, reportedDate: e.target.value})}
                      disabled={!isAdmin && !isSSA && !isSSO} // LA is read-only for this
                    />
                  </div>
                )}

                {(!isSA || isAdmin) && (
                  <div className="form-group status-date-group collected">
                    <label><StatusDateIcon status="Collected" /> Collected Date</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={formData.collectedDate}
                      onChange={(e) => setFormData({...formData, collectedDate: e.target.value})}
                      disabled={!isAdmin && !isLA} // Only Admin and LA can edit
                    />
                  </div>
                )}
            </div>

            <div className="form-group phase-selector-group">
              <label>Current Phase Progress</label>
              <div className="phase-grid">
                {["Extraction", "Analysis", "Report", "Draft", "Worksheet", "Given to Team Leader"].map((phase) => (
                  <button
                    key={phase}
                    type="button"
                    className={`phase-btn ${formData.evidencePhase === phase ? 'active' : ''}`}
                    onClick={() => {
                      if (canEditSADetails) {
                        setFormData({...formData, evidencePhase: phase});
                      }
                    }}
                    disabled={!canEditSADetails}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLA && !isSA && formData.allottedTo && (
        <div className="allotment-info-section team-assignment-section">
          <h4>Team Assignment Details</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Team Member Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter Team Member Name"
                value={formData.teamMemberName}
                onChange={(e) => setFormData({...formData, teamMemberName: e.target.value})}
                disabled={!canEditTeam}
              />
            </div>
            <div className="form-group">
              <label>Position</label>
              <select 
                className="input-field" 
                value={formData.teamMemberPosition}
                onChange={(e) => setFormData({...formData, teamMemberPosition: e.target.value})}
                disabled={!canEditTeam}
              >
                <option value="">Select Position</option>
                <option value="SA">Scientific Assistant (SA)</option>
                <option value="SSA">Senior Scientific Assistant (SSA)</option>
                <option value="Assistant">Assistant</option>
                <option value="Technical Staff">Technical Staff</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assignment Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.teamAssignmentDate}
                onChange={(e) => setFormData({...formData, teamAssignmentDate: e.target.value})}
                disabled={!canEditTeam}
              />
            </div>
            <div className="form-group">
              <label>Assignment Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={formData.teamAssignmentTime}
                onChange={(e) => setFormData({...formData, teamAssignmentTime: e.target.value})}
                disabled={!canEditTeam}
              />
            </div>
          </div>
        </div>
      )}

      {!isLA && !isSA && formData.allottedTo && (
        <div className="allotment-info-section">
          <h4>Case Allotment Details</h4>
          <div className="allotment-grid">
            <p><strong>Allotted To:</strong> {formData.allottedTo}</p>
            <p><strong>Allotted By:</strong> {formData.allottedBy}</p>
            <p><strong>Date:</strong> {formData.allottedDate}</p>
            <p><strong>Time:</strong> {formData.allottedTime}</p>
          </div>
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="btn-primary">{initialData ? "Update Case" : "Register Case"}</button>
        {initialData && <button type="button" className="action-btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default CaseForm;