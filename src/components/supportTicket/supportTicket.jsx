import React, { useEffect, useState } from "react";
import { getTickets } from "../../server";
import Pagination from "../comman/Pagination/Pagination";
import "./supportTicket.scss";

function SupportTicket() {
  const [tickets, setTickets] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, ticket: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch tickets
  const fetchTickets = async (page = 1) => {
    try {
      const res = await getTickets(page);
      if (res?.tickets) {
        setTickets(res.tickets);
        setTotalPages(res.total_pages || 1);
        setCurrentPage(res.current_page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchTickets(page);
  };

  // Filtered tickets based on search
  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticketNo?.toLowerCase().includes(query) ||
      ticket.user?.name?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query) ||
      ticket.status?.toLowerCase().includes(query)
    );
  });

  // File upload handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  return (
    <div className="support-ticket-page">
      <div className="support-ticket-header-row">
        <div>
          <h1>Support Ticket</h1>
          <p>Manage Your Task and Activities.</p>
        </div>
        <div className="support-ticket-header-actions">
          <button className="add-btn">
            <img src="/assets/icon (1).png" alt="add" /> Add Ticket
          </button>
          <button className="export-btn">
            <img src="/assets/icon (2).png" alt="export" /> Export Data
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="support-ticket-table-controls">
        <input
          className="support-ticket-search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="support-ticket-table-filters">
          <button>
            <img src="/assets/Icon (2).png" alt="date" />
            <span>Date</span>
          </button>
          <button>
            <img src="/assets/Icon (3).png" alt="filter" />
            <span>Filter</span>
          </button>
          <button>
            <img src="/assets/icondownarrow.png" alt="status" />
            <span>Status</span>
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="support-ticket-table-wrapper">
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Ticket No.</th>
              <th>User Name</th>
              <th>Summary</th>
              <th>Last Message</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, idx) => (
              <tr key={ticket._id || idx}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{ticket.ticketNo || ticket._id}</td>
                <td>
                  <img
                    src="/assets/3d_avatar_1.png"
                    alt="avatar"
                    className="support-ticket-avatar"
                  />
                  {ticket.user?.name || "N/A"}
                </td>
                <td>{ticket.category}</td>
                <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                <td>
                  <span
                    className={
                      ticket.status === "Active"
                        ? "status-active"
                        : ticket.status === "Inactive"
                        ? "status-inactive"
                        : "status-resolved"
                    }
                  >
                    {ticket.status}
                  </span>
                </td>
                <td style={{ position: "relative" }}>
                  <button
                    className="support-ticket-dots"
                    onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                  >
                    ⋮
                  </button>
                  {menuOpen === idx && (
                    <div className="support-ticket-dropdown">
                      <button
                        onClick={() => {
                          setEditModal({ open: true, ticket });
                          setMenuOpen(null);
                        }}
                      >
                        Edit Details
                      </button>
                      <button>Mark Resolved</button>
                      <button>Archive issue</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7}>No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          className="support-ticket-pagination"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div
          className="support-ticket-modal-overlay"
          onClick={() => setEditModal({ open: false, ticket: null })}
        >
          <div
            className="support-ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Ticket</h2>
            <p>
              Update ticket details and upload supporting documents if needed.
            </p>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Ticket No.</label>
                <input type="text" value={editModal.ticket._id} readOnly />
              </div>
              <div className="modal-form-group">
                <label>Description</label>
                <textarea defaultValue={editModal.ticket.category}></textarea>
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Raised by</label>
                <input
                  type="text"
                  value={editModal.ticket.user?.name || ""}
                  readOnly
                />
              </div>
              <div className="modal-form-group">
                <label>Category</label>
                <select defaultValue={editModal.ticket.category}>
                  <option>Payment Issue</option>
                  <option>Verification Problem</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>Upload Property Bill/Document</label>
                <input
                  type="file"
                  id="upload-document"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpeg,.jpg,.png"
                />
                <button
                  type="button"
                  className="modal-upload-btn"
                  onClick={() =>
                    document.getElementById("upload-document").click()
                  }
                >
                  Upload ⬆️
                </button>
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files-list">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx}>{file.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-submit-btn">Submit</button>
            </div>

            <button
              className="modal-close-btn"
              onClick={() => setEditModal({ open: false, ticket: null })}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportTicket;
