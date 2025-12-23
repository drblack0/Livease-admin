import React, { useEffect, useState } from "react";
import { getAdminUsers, addAdminUser, deleteAdminUser } from "../../server";
import "./adminManagement.scss";

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;

  // Add admin modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Fetch admin users
  const fetchAdmins = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAdminUsers(page, recordsPerPage);
      
      if (res?.admins) {
        setAdmins(res.admins);
        setFilteredAdmins(res.admins);
        setTotalPages(res.total_pages || 1);
        setCurrentPage(res.current_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = admins.filter((admin) =>
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query)
      );
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchAdmins(page);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  // Handle add admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All fields are required");
      return;
    }

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    try {
      setFormLoading(true);
      const res = await addAdminUser(formData);
      
      if (res) {
        // Reset form and close modal
        setFormData({ name: "", email: "", password: "" });
        setShowAddModal(false);
        // Refresh admin list
        fetchAdmins(currentPage);
      }
    } catch (error) {
      console.error("Failed to add admin:", error);
      setFormError(error.message || "Failed to add admin user");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin user?")) {
      return;
    }

    try {
      await deleteAdminUser(adminId);
      fetchAdmins(currentPage);
    } catch (error) {
      console.error("Failed to delete admin:", error);
      alert("Failed to delete admin user");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-management">
      <div className="admin-management__header">
        <div>
          <h1>Admin Management</h1>
          <p>Manage admin panel users and permissions.</p>
        </div>

        <button
          className="admin-management__new-admin"
          onClick={() => setShowAddModal(true)}
        >
          <img src="/assets/iconplus.png" alt="plus" />
          <span>New Admin</span>
        </button>
      </div>

      <div className="admin-management__controls">
        <input
          className="admin-management__search"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="admin-management__table-wrapper">
        <table className="admin-management__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading admin users...</td>
              </tr>
            ) : filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td>
                    <img
                      src="/assets/3d_avatar_1.png"
                      alt="avatar"
                      className="admin-management__avatar"
                    />
                    <span className="name">{admin.name}</span>
                  </td>
                  <td>{admin.email}</td>
                  <td>{formatDate(admin.createdAt)}</td>
                  <td>
                    <span
                      className="admin-management__action"
                      onClick={() => handleDeleteAdmin(admin._id)}
                    >
                      <img src="/assets/icon.png" alt="delete" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No admin users found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filteredAdmins.length > 0 && (
          <div className="admin-management__pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="admin-management__modal-overlay">
          <div className="admin-management__modal">
            <div className="admin-management__modal-header">
              <h2>Add New Admin User</h2>
              <button
                className="admin-management__modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: "", email: "", password: "" });
                  setFormError("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="admin-management__form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div className="admin-management__form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="admin-management__form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 8 characters)"
                  required
                />
              </div>

              {formError && (
                <div className="admin-management__form-error">{formError}</div>
              )}

              <div className="admin-management__form-actions">
                <button
                  type="button"
                  className="admin-management__btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: "", email: "", password: "" });
                    setFormError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-management__btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;


