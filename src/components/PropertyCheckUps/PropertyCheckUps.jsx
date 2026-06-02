import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPropertyCheckups, approvePropertyCheckup, rejectPropertyCheckup } from "../../server";
import Pagination from "../comman/Pagination/Pagination";
import "./PropertyCheckUps.scss";

function PropertyCheckUps() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const recordsPerPage = 10;

  // Fetch property checkups from API
  const fetchCheckups = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getPropertyCheckups(page, recordsPerPage);
      console.log('Property checkups response:', res);
      
      // Backend returns array directly (no pagination yet)
      const checkupsArray = Array.isArray(res) ? res : (res?.data || []);
      
      if (checkupsArray.length > 0) {
        const mapped = checkupsArray.map((checkup) => ({
          _id: checkup._id,
          id: checkup._id,
          landlord: checkup.landlord?.name || "N/A",
          tenant: checkup.tenant?.name || "N/A",
          property: checkup.property?.title || checkup.property?.address || "N/A",
          dueDate: checkup.scheduled_date 
            ? new Date(checkup.scheduled_date).toLocaleDateString('en-GB')
            : "—",
          status: checkup.status || "Pending",
          urgency: checkup.urgency || "Medium",
          approved: checkup.status === "Approved" ? "Yes" : "No",
        }));
        setData(mapped);
        // Since backend doesn't return pagination info, calculate it client-side
        setTotalPages(Math.ceil(mapped.length / recordsPerPage));
        setCurrentPage(1);
      } else {
        setData([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch property checkups", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen !== null && !event.target.closest('.action-dropdown') && !event.target.closest('.action-btn')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, urgencyFilter]);

  // Filter rows based on search and filters
  const filteredData = data.filter((row) => {
    const matchesSearch = 
      row.tenant.toLowerCase().includes(search.toLowerCase()) ||
      row.landlord.toLowerCase().includes(search.toLowerCase()) ||
      row.property.toLowerCase().includes(search.toLowerCase()) ||
      row.id.toString().toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || row.status === statusFilter;
    const matchesUrgency = !urgencyFilter || row.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Calculate pagination for filtered data
  const totalFilteredPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalFilteredPages) return;
    setCurrentPage(page);
  };

  const handleApprove = async (checkupId) => {
    try {
      await approvePropertyCheckup(checkupId);
      alert('Checkup approved successfully!');
      fetchCheckups();
    } catch (error) {
      console.error('Error approving checkup:', error);
      alert('Failed to approve checkup. Please try again.');
    }
    setMenuOpen(null);
  };

  const handleReject = async (checkupId) => {
    try {
      await rejectPropertyCheckup(checkupId);
      alert('Checkup rejected successfully!');
      fetchCheckups();
    } catch (error) {
      console.error('Error rejecting checkup:', error);
      alert('Failed to reject checkup. Please try again.');
    }
    setMenuOpen(null);
  };

  const handleViewDetails = (checkupId) => {
    // Navigate to checkup details page
    navigate(`/property-checkup/${checkupId}`);
    setMenuOpen(null);
  };

return (
    <div className="checkups">
      {/* Header */}
      <div className="checkups__header">
        <div>
          <h2 className="checkups__title">Property Check-Ups</h2>
          <p className="checkups__subtitle">Manage Your Task and Activities.</p>
        </div>
        <div className="checkups__header-actions">
          <button className="btn btn--primary">Submit Response</button>
          <button className="btn btn--secondary">Create Request</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="checkups__controls">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Approved">Approved</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
            <option value="">Urgency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="checkups__table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Request ID</th>
            <th>Landlord</th>
            <th>Tenant</th>
            <th>Property</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Urgency</th>
            <th>Approved</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10}>Loading...</td>
            </tr>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => (
              <tr key={row.id}>
                <td><input type="checkbox" /></td>
                <td>{row.id}</td>
                <td>{row.landlord}</td>
                <td>{row.tenant}</td>
                <td>{row.property}</td>
                <td>{row.dueDate}</td>
                <td>
                  <span className={`status status--${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.urgency}</td>
                <td>{row.approved}</td>
                <td style={{ position: "relative" }}>
                  <button
                    className="action-btn"
                    onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                  >
                    ⋮
                  </button>
                  {menuOpen === idx && (
                    <div className="action-dropdown">
                      <button onClick={() => handleViewDetails(row._id || row.id)}>
                        👁️ View Details
                      </button>
                      <button onClick={() => handleApprove(row._id || row.id)}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleReject(row._id || row.id)}>
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10}>No data found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        className="checkups__footer"
        currentPage={currentPage}
        totalPages={totalFilteredPages || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default PropertyCheckUps;
