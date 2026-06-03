import React from "react";
import { ROLES } from "../../utils/permissions";

const SORT_COLUMNS = [
  { key: "caseNo", label: "Case No" },
  { key: "firNo", label: "FIR No" },
  { key: "status", label: "Status" },
  { key: "evidenceStatus", label: "Evidence" },
  { key: "createdAt", label: "Created" },
];

const CaseTable = ({
  cases,
  onEdit,
  onDelete,
  onAssignTeam,
  onOpenAllotment,
  canEdit,
  canDelete,
  user,
  sortBy,
  sortOrder,
  onSort,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  viewOnly,
}) => {
  if (cases.length === 0) {
    return <p className="empty-msg">No cases found in the inventory.</p>;
  }

  const handleSort = (key) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "desc");
    }
  };

  const sortIndicator = (key) => {
    if (sortBy !== key) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="table-controls-wrapper">
      <div className="inventory-filters">
        <select
          className="input-field filter-select"
          value={filters?.status || ""}
          onChange={(e) => onFilterChange?.({ status: e.target.value })}
        >
          <option value="">All workflow statuses</option>
          <option value="Registered">Registered</option>
          <option value="Allotted">Allotted</option>
          <option value="Team-Assigned">Team-Assigned</option>
        </select>
        <select
          className="input-field filter-select"
          value={filters?.evidenceStatus || ""}
          onChange={(e) => onFilterChange?.({ evidenceStatus: e.target.value })}
        >
          <option value="">All evidence statuses</option>
          <option value="Under Examination">Under Examination</option>
          <option value="Reported">Reported</option>
          <option value="Collected">Collected</option>
        </select>
        <select
          className="input-field filter-select"
          value={filters?.isLACompleted ?? ""}
          onChange={(e) => onFilterChange?.({ isLACompleted: e.target.value })}
        >
          <option value="">All LA statuses</option>
          <option value="true">LA Done</option>
          <option value="false">LA Pending</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="case-table">
          <thead>
            <tr>
              {SORT_COLUMNS.map((col) => (
                <th key={col.key}>
                  <button type="button" className="sort-header-btn" onClick={() => handleSort(col.key)}>
                    {col.label}{sortIndicator(col.key)}
                  </button>
                </th>
              ))}
              <th>RC No</th>
              <th>Person</th>
              <th>LA Name</th>
              <th>LA Status</th>
              <th>Allotted To</th>
              <th>Pending</th>
              <th>Phase</th>
              <th>Team</th>
              {!viewOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c._id || c.id}>
                <td>{c.caseNo}</td>
                <td>{c.firNo}</td>
                <td>
                  <span className={`status-badge ${(c.status || "registered").toLowerCase().replace(/\s+/g, "-")}`}>
                    {c.status || "Registered"}
                  </span>
                </td>
                <td>
                  {c.evidenceStatus ? (
                    <span className={`status-badge status-${(user?.role === ROLES.SA && (c.evidenceStatus === "Reported" || c.evidenceStatus === "Collected") ? "under-examination" : c.evidenceStatus).toLowerCase().replace(/\s+/g, "-")}`}>
                      {user?.role === ROLES.SA && (c.evidenceStatus === "Reported" || c.evidenceStatus === "Collected")
                        ? "Under Examination"
                        : c.evidenceStatus}
                    </span>
                  ) : (
                    <span className="status-badge phase-pending">Pending</span>
                  )}
                </td>
                <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                <td>{c.rcNo}</td>
                <td>{c.personName}</td>
                <td>{c.laName || "N/A"}</td>
                <td>
                  <span className={`status-badge ${c.isLACompleted ? "la-complete" : "registered"}`}>
                    {c.isLACompleted ? "LA Done" : "Pending"}
                  </span>
                </td>
                <td>{c.allottedTo || "Not Allotted"}</td>
                <td>{c.pendingReason || "N/A"}</td>
                <td>{c.evidencePhase || "Pending"}</td>
                <td>{c.teamMemberName || "N/A"}</td>
                {!viewOnly && (
                  <td className="actions-cell">
                    {canEdit && (
                      <button type="button" className="edit-btn" onClick={() => onEdit(c)}>
                        Edit
                      </button>
                    )}
                    {user?.role === ROLES.ADMIN && onOpenAllotment && (
                      <button type="button" className="assign-btn" onClick={() => onOpenAllotment(c)}>
                        {c.allottedTo ? "Reallot" : "Allot"}
                      </button>
                    )}
                    {user?.role === ROLES.SSO && c.status === "Allotted" && (
                      <button type="button" className="assign-btn" onClick={() => onAssignTeam(c)}>
                        Assign Team
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" className="delete-btn" onClick={() => onDelete(c._id || c.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange?.(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages} ({pagination.total} cases)
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange?.(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CaseTable;
