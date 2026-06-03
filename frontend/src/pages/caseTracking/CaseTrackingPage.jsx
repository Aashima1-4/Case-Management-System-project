import React, { useState, useEffect, useCallback } from "react";
import { storage } from "../../utils/storage";
import { auth } from "../../utils/auth";
import CaseForm from "./CaseForm";
import CaseTable from "./CaseTable";
import Toast from "../../components/common/Toast";
import { useLocation } from "react-router-dom";
import {
  ROLES,
  canRegisterCase,
  canEditCase,
  canDeleteCase,
  canAllotCase,
  canAssignTeam,
  isViewOnlyCaseTracking,
} from "../../utils/permissions";
import "./CaseTracking.css";

const CaseTrackingPage = () => {
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedCase, setSearchedCase] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isAllotting, setIsAllotting] = useState(false);
  const [selectedCaseForAllotment, setSelectedCaseForAllotment] = useState(null);
  const [allotmentForm, setAllotmentForm] = useState({
    allottedTo: "",
    allottedBy: "",
    allottedDate: "",
    allottedTime: "",
    previousAllottedTo: "",
    previousAllottedBy: "",
    previousAllottedDate: "",
    previousAllottedTime: "",
  });
  const [isAssigningTeam, setIsAssigningTeam] = useState(false);
  const [selectedCaseForTeam, setSelectedCaseForTeam] = useState(null);
  const [ssoUsers, setSsoUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [listParams, setListParams] = useState({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "",
    evidenceStatus: "",
    isLACompleted: "",
  });

  const user = auth.getCurrentUser();
  const location = useLocation();
  const viewOnly = isViewOnlyCaseTracking(user?.role);

  const loadCases = useCallback(async (overrides = {}) => {
    const params = { ...listParams, ...overrides };
    const { cases: data, pagination: pag } = await storage.getCases(params);
    setCases(data);
    setPagination(pag);
    return { data, pag };
  }, [listParams]);

  useEffect(() => {
    loadCases();
  }, [listParams]);

  useEffect(() => {
    if (canAllotCase(user?.role)) {
      storage.getUsersByRole(ROLES.SSO).then(setSsoUsers);
    }
  }, [user?.role]);

  useEffect(() => {
    const view = new URLSearchParams(location.search).get("view");
    if (view === "allotted" && user?.role === ROLES.SSO) {
      loadCases({ page: 1 });
    }
  }, [location.search, user?.role]);

  const handleAddOrUpdate = async (caseData) => {
    const processedData = {
      ...caseData,
      noOfParcels: caseData.noOfParcels ? parseInt(caseData.noOfParcels, 10) : 0,
      noOfExhibits: caseData.noOfExhibits ? parseInt(caseData.noOfExhibits, 10) : 0,
    };

    if (editingCase) {
      const updatedCaseData = {
        ...processedData,
        laName: user.role === ROLES.LA ? user.email : editingCase.laName,
      };
      const response = await storage.updateCase(editingCase._id || editingCase.id, updatedCaseData);
      if (response?.success) {
        const updatedCase = response.data;
        setCases((prev) =>
          prev.map((c) =>
            (c._id || c.id) === (editingCase._id || editingCase.id) ? updatedCase : c
          )
        );
        if (searchedCase && (searchedCase._id || searchedCase.id) === (editingCase._id || editingCase.id)) {
          setSearchedCase(updatedCase);
        }
        setToast({ message: "Case updated successfully", type: "success" });
        setEditingCase(null);
        loadCases();
      } else {
        setToast({ message: `Update failed: ${response?.message || "Unknown error"}`, type: "error" });
      }
    } else {
      const response = await storage.addCase({
        ...processedData,
        status: "Registered",
        isLACompleted: processedData.isLACompleted || false,
        laName: user.role === ROLES.LA ? user.email : processedData.laName,
      });
      if (response?.success) {
        const addedCase = response.data;
        setSearchedCase(addedCase);
        setToast({ message: "New case added", type: "success" });
        setShowRegistrationForm(false);
        loadCases({ page: 1 });
      } else {
        setToast({ message: `Registration failed: ${response?.message || "Unknown error"}`, type: "error" });
      }
    }
  };

  const openAllotmentForm = (caseItem) => {
    if (!caseItem) return;
    const now = new Date();
    setSelectedCaseForAllotment(caseItem);
    setAllotmentForm({
      allottedTo: caseItem.allottedTo || "",
      allottedBy: user.email,
      allottedDate: caseItem.allottedDate || now.toISOString().split("T")[0],
      allottedTime: caseItem.allottedTime || now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      previousAllottedTo: caseItem.allottedTo || "",
      previousAllottedBy: caseItem.allottedBy || "",
      previousAllottedDate: caseItem.allottedDate || "",
      previousAllottedTime: caseItem.allottedTime || "",
    });
    setIsAllotting(true);
  };

  const handleAllot = async (allotmentData) => {
    if (!selectedCaseForAllotment) return;
    const updatedCase = {
      ...selectedCaseForAllotment,
      previousAllottedTo: selectedCaseForAllotment.allottedTo || "",
      previousAllottedBy: selectedCaseForAllotment.allottedBy || "",
      previousAllottedDate: selectedCaseForAllotment.allottedDate || "",
      previousAllottedTime: selectedCaseForAllotment.allottedTime || "",
      ...allotmentData,
      status: "Allotted",
    };
    const response = await storage.updateCase(
      selectedCaseForAllotment._id || selectedCaseForAllotment.id,
      updatedCase
    );
    if (response?.success) {
      const saved = response.data || updatedCase;
      setCases((prev) =>
        prev.map((c) =>
          (c._id || c.id) === (selectedCaseForAllotment._id || selectedCaseForAllotment.id) ? saved : c
        )
      );
      setSearchedCase(saved);
      setToast({ message: `Case allotted to ${allotmentData.allottedTo}`, type: "success" });
      loadCases();
    } else {
      setToast({ message: response?.message || "Allotment failed", type: "error" });
    }
    setIsAllotting(false);
    setSelectedCaseForAllotment(null);
  };

  const handleTeamAssignment = async (teamData) => {
    if (!selectedCaseForTeam) return;
    const updatedCase = { ...selectedCaseForTeam, ...teamData, status: "Team-Assigned" };
    const response = await storage.updateCase(
      selectedCaseForTeam._id || selectedCaseForTeam.id,
      updatedCase
    );
    if (response?.success) {
      const saved = response.data || updatedCase;
      setCases((prev) =>
        prev.map((c) =>
          (c._id || c.id) === (selectedCaseForTeam._id || selectedCaseForTeam.id) ? saved : c
        )
      );
      setSearchedCase(saved);
      setToast({ message: `Assigned to ${teamData.teamMemberName}`, type: "success" });
      loadCases();
    } else {
      setToast({ message: response?.message || "Assignment failed", type: "error" });
    }
    setIsAssigningTeam(false);
    setSelectedCaseForTeam(null);
  };

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchedCase(null);
      loadCases({ page: 1, search: "" });
      return;
    }

    const caseNoRegex = /^\d{2}[-/][A-Z]{2}[-/]\d{1,6}$/;
    const looksLikeCaseNo = term.length <= 12 && /\d/.test(term[0]);
    if (looksLikeCaseNo && !caseNoRegex.test(term.toUpperCase())) {
      setToast({ message: "Invalid Case No format. Use NN-AA-N or search by FIR No.", type: "error" });
      return;
    }

    const results = await storage.searchCase(term);
    if (!results?.length) {
      setSearchedCase(null);
      setToast({ message: "Case not found.", type: "error" });
      return;
    }

    if (results.length === 1) {
      setSearchedCase(results[0]);
      setCases([results[0]]);
    } else {
      setSearchedCase(null);
      setCases(results);
      setToast({ message: `${results.length} cases found`, type: "info" });
    }
  };

  const handleSearchTermChange = (value) => {
    if (value.length > 12) {
      setSearchTerm(value);
      return;
    }
    const val = value.toUpperCase().slice(0, 12);
    let valid = true;
    for (let i = 0; i < val.length; i++) {
      const char = val[i];
      if (i === 0 || i === 1) { if (!/\d/.test(char)) valid = false; }
      else if (i === 2) { if (char !== "-" && char !== "/") valid = false; }
      else if (i === 3 || i === 4) { if (!/[A-Z]/.test(char)) valid = false; }
      else if (i === 5) { if (char !== "-" && char !== "/") valid = false; }
      else if (i >= 6) { if (!/\d/.test(char)) valid = false; }
    }
    if (valid || val === "") setSearchTerm(val);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    const response = await storage.deleteCase(id);
    if (response?.success) {
      setSearchedCase(null);
      setToast({ message: "Case deleted", type: "info" });
      loadCases();
    } else {
      setToast({ message: response?.message || "Delete failed", type: "error" });
    }
  };

  const handleSort = (sortBy, sortOrder) => {
    setListParams((p) => ({ ...p, sortBy, sortOrder, page: 1 }));
  };

  const handleFilterChange = (patch) => {
    setListParams((p) => ({ ...p, ...patch, page: 1 }));
  };

  const handlePageChange = (page) => {
    setListParams((p) => ({ ...p, page }));
  };

  const displayCases = searchTerm && searchedCase
    ? cases.filter(
        (c) =>
          (c.caseNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.firNo || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cases;

  return (
    <div className="case-tracking-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="module-header">
        <div className="header-content">
          <h2>Case <span>Tracking</span></h2>
          <p>Manage forensic cases, FIR details, and suspect information.</p>
        </div>
        {canRegisterCase(user?.role) && (
          <button
            type="button"
            className={`btn-primary register-toggle-btn ${showRegistrationForm ? "active" : ""}`}
            onClick={() => {
              setShowRegistrationForm(!showRegistrationForm);
              setEditingCase(null);
            }}
          >
            {showRegistrationForm ? "Hide Form" : "Register New Case"}
          </button>
        )}
        {canAssignTeam(user?.role) && (
          <button
            type="button"
            className="btn-primary register-toggle-btn"
            onClick={() => {
              document.getElementById("case-inventory")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            My Allotted Cases
          </button>
        )}
      </div>

      {!(showRegistrationForm || editingCase) && (
        <section className="table-section glass-card">
          <div className="search-allotment-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Case No (23-CY-101) or FIR No..."
                className="input-field search-input"
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button type="button" className="btn-secondary search-btn" onClick={handleSearch}>
                Search
              </button>
              <button
                type="button"
                className="btn-secondary search-btn"
                onClick={() => {
                  setSearchTerm("");
                  setSearchedCase(null);
                  loadCases({ page: 1 });
                }}
              >
                Reset
              </button>
            </div>
            {canAllotCase(user?.role) && searchedCase && (
              <button type="button" className="btn-primary allotment-btn" onClick={() => openAllotmentForm(searchedCase)}>
                {searchedCase.allottedTo ? "Reallot Case" : "New Case Allotment"}
              </button>
            )}
            {canAssignTeam(user?.role) && searchedCase?.status === "Allotted" && (
              <button
                type="button"
                className="btn-primary allotment-btn"
                onClick={() => {
                  setSelectedCaseForTeam(searchedCase);
                  setIsAssigningTeam(true);
                }}
              >
                Assign Team Member
              </button>
            )}
            {user?.role === ROLES.SA && searchedCase && (
              <button type="button" className="btn-primary allotment-btn" onClick={() => setEditingCase(searchedCase)}>
                Add Case Opening Details
              </button>
            )}
          </div>

          {searchedCase && (
            <div className="searched-case-details glass-card">
              <h4>Case Details Found</h4>
              <div className="details-grid">
                <p><strong>Case No:</strong> {searchedCase.caseNo}</p>
                <p><strong>FIR No:</strong> {searchedCase.firNo}</p>
                <p><strong>Person:</strong> {searchedCase.personName}</p>
                <p><strong>LA:</strong> {searchedCase.laName || "N/A"}</p>
                <p><strong>LA Status:</strong> {searchedCase.isLACompleted ? "LA Done" : "Pending"}</p>
                <p><strong>Workflow:</strong> {searchedCase.status}</p>
                <p><strong>Allotted To:</strong> {searchedCase.allottedTo || "Not Allotted"}</p>
                <p><strong>Team:</strong> {searchedCase.teamMemberName || "Not Assigned"}</p>
                {searchedCase.evidenceStatus && (
                  <p><strong>Evidence:</strong> {searchedCase.evidenceStatus} — {searchedCase.evidencePhase || "N/A"}</p>
                )}
              </div>
            </div>
          )}

          <h3 id="case-inventory">Case <span>Inventory</span></h3>
          <CaseTable
            cases={displayCases}
            onEdit={setEditingCase}
            onDelete={handleDelete}
            onAssignTeam={(c) => {
              setSelectedCaseForTeam(c);
              setIsAssigningTeam(true);
            }}
            onOpenAllotment={openAllotmentForm}
            canEdit={canEditCase(user?.role)}
            canDelete={canDeleteCase(user?.role)}
            user={user}
            viewOnly={viewOnly}
            sortBy={listParams.sortBy}
            sortOrder={listParams.sortOrder}
            onSort={handleSort}
            filters={listParams}
            onFilterChange={handleFilterChange}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </section>
      )}

      {(showRegistrationForm || editingCase) && !isAllotting && !isAssigningTeam && (
        <section className="form-section glass-card" id="registration-form">
          <h3>{editingCase ? "Edit Case" : "Register New Case"}</h3>
          <CaseForm
            onSubmit={handleAddOrUpdate}
            initialData={editingCase}
            onCancel={() => {
              setEditingCase(null);
              setShowRegistrationForm(false);
            }}
            user={user}
          />
        </section>
      )}

      {isAllotting && (
        <section className="form-section glass-card allotment-section">
          <h3>Case <span>Allotment</span></h3>
          <p>Assigning Case: <strong>{selectedCaseForAllotment?.caseNo}</strong></p>
          <form
            className="allotment-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAllot(allotmentForm);
            }}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Allotted To (SSO email)</label>
                <select
                  className="input-field"
                  value={allotmentForm.allottedTo}
                  onChange={(e) => setAllotmentForm({ ...allotmentForm, allottedTo: e.target.value })}
                  required
                >
                  <option value="">Select SSO</option>
                  {ssoUsers.map((u) => (
                    <option key={u._id || u.email} value={u.email}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Allotted By</label>
                <input type="text" className="input-field" value={allotmentForm.allottedBy} disabled />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={allotmentForm.allottedDate}
                  onChange={(e) => setAllotmentForm({ ...allotmentForm, allottedDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={allotmentForm.allottedTime}
                  onChange={(e) => setAllotmentForm({ ...allotmentForm, allottedTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Confirm Allotment</button>
              <button type="button" className="action-btn" onClick={() => setIsAllotting(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      {isAssigningTeam && (
        <section className="form-section glass-card allotment-section" id="team-assignment-form">
          <h3>Team <span>Assignment</span></h3>
          <p>Assigning Case: <strong>{selectedCaseForTeam?.caseNo}</strong></p>
          <form
            className="allotment-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleTeamAssignment({
                teamMemberName: formData.get("teamMemberName"),
                teamMemberPosition: formData.get("teamMemberPosition"),
                teamAssignmentDate: formData.get("teamAssignmentDate"),
                teamAssignmentTime: formData.get("teamAssignmentTime"),
              });
            }}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Team Member Name</label>
                <input type="text" name="teamMemberName" className="input-field" required />
              </div>
              <div className="form-group">
                <label>Position</label>
                <select name="teamMemberPosition" className="input-field" required>
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
                  name="teamAssignmentDate"
                  className="input-field"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assignment Time</label>
                <input
                  type="time"
                  name="teamAssignmentTime"
                  className="input-field"
                  defaultValue={new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Confirm Assignment</button>
              <button type="button" className="action-btn" onClick={() => setIsAssigningTeam(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default CaseTrackingPage;
