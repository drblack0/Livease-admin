import React, { useEffect, useState } from "react";
import { getUsersList, getProperties, addUser } from "../../server";
import "./userManagement.scss";
import { Link, useNavigate } from "react-router-dom";
import AddTenantModal from "../comman/AddTenantModal/AddTenantModal";

function UserManagement({ compType }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;

  // Add tenant modal state
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);

  const navigate = useNavigate();

  // Fetch data based on compType
  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      let res;

      if (compType === "property") {
        res = await getProperties(page, recordsPerPage);
        if (res?.properties) {
          const updatedProperties = res.properties.map((prop) => ({
            ...prop,
            title: prop.title || "N/A",
            name: prop.landlord?.name || "N/A",
            bhk: Array.isArray(prop.bhk_type)
              ? prop.bhk_type.join(", ")
              : prop.bhk_type || "N/A",
            rent: prop.rent_amount || 0,
            status: prop.is_deleted ? "Inactive" : "Active",
          }));
          setData(updatedProperties);
          setFilteredData(updatedProperties);
          setTotalPages(res.total_pages || 1);
          setCurrentPage(res.current_page || 1);
        }
      } else {
        res = await getUsersList(
          page,
          recordsPerPage,
          compType === "landlord" ? "Landlord" : "Tenant"
        );
        if (res?.users) {
          const updatedUsers = res.users.map((user, index) => ({
            ...user,
            avatar: "/assets/3d_avatar_1.png",
            status: index % 2 === 0 ? "Active" : "Inactive",
            verification:
              index % 3 === 0 ? "Done" : index % 3 === 1 ? "Pending" : "Failed",
            listingCount: user.listings_count,
          }));
          setData(updatedUsers);
          setFilteredData(updatedUsers);
          setTotalPages(res.total_pages || 1);
          setCurrentPage(res.current_page || 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [compType]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter((item) => {
        if (compType === "property") {
          return (
            item.title.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.bhk.toLowerCase().includes(query) ||
            item.rent.toString().includes(query) ||
            item.status.toLowerCase().includes(query)
          );
        } else {
          return (
            item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.number.toLowerCase().includes(query)
          );
        }
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, data, compType]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchData(page);
  };

  // Add tenant modal functions
  const handleOpenAddTenantModal = () => {
    setShowAddTenantModal(true);
  };

  // Table headers
  const headers =
    compType === "property"
      ? ["Title", "Name", "BHK", "Rent", "Status"]
      : compType === "landlord"
      ? [
          "Name",
          "Email",
          "Number",
          "Status",
          "Verification",
          "Listing Count",
          "Action",
        ]
      : ["Name", "Email", "Number", "Status", "Verification", "Action"];

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div>
          <h1>
            {compType.charAt(0).toUpperCase() + compType.slice(1)} Management
          </h1>
          <p>Manage your task and activities.</p>
        </div>

        {/* New button navigates to /add-property for property/landlord, handles modal for tenant */}
        <button
          className="user-management__new-tenant"
          onClick={() => {
            if (compType === 'tenant') {
              handleOpenAddTenantModal();
            } else {
              navigate(`/add-property?type=${compType}`)
            }
          }}
        >
          <img src="/assets/iconplus.png" alt="plus" />
          <span>
            New{" "}
            {compType === "property"
              ? "Property"
              : compType.charAt(0).toUpperCase() + compType.slice(1)}
          </span>
        </button>
      </div>

      <div className="user-management__controls">
        <input
          className="user-management__search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="user-management__table-wrapper">
        <table className="user-management__table">
          <thead>
            <tr>
              {compType !== "property" && (
                <th>
                  <input type="checkbox" />
                </th>
              )}
              {headers.map((h, idx) => (
                <th key={idx}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    compType === "property"
                      ? 5
                      : compType === "landlord"
                      ? 8
                      : 7
                  }
                >
                  Loading data...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr
                  key={item._id || idx}
                  onClick={() =>
                    compType === "property" && navigate(`/property/${item._id}`)
                  }
                >
                  {compType !== "property" && (
                    <td>
                      <input type="checkbox" />
                    </td>
                  )}

                  {compType === "property" ? (
                    <>
                      <td>
                        <Link className="name" to={`/property/${item._id}`}>
                          {item.title}
                        </Link>
                      </td>
                      <td>{item.name}</td>
                      <td>{item.bhk}</td>
                      <td>{item.rent}</td>
                      <td
                        className={
                          item.status === "Active" ? "active" : "inactive"
                        }
                      >
                        {item.status}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <img
                          src={item.avatar}
                          alt="avatar"
                          className="user-management__avatar"
                        />
                        <Link
                          className="name"
                          to={`/profile/${item._id}?userType=${compType}`}
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.number}</td>
                      <td
                        className={
                          item.status === "Active" ? "active" : "inactive"
                        }
                      >
                        {item.status}
                      </td>
                      <td
                        className={
                          item.verification === "Done"
                            ? "done"
                            : item.verification === "Pending"
                            ? "pending"
                            : "failed"
                        }
                      >
                        {item.verification}
                      </td>
                      {compType === "landlord" && <td>{item.listingCount}</td>}
                      <td>
                        <span className="user-management__action">
                          <img src="/assets/Icon (1).png" alt="edit" />
                        </span>
                        <span className="user-management__action">
                          <img src="/assets/icon.png" alt="delete" />
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    compType === "property"
                      ? 5
                      : compType === "landlord"
                      ? 8
                      : 7
                  }
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="user-management__pagination">
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

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        onSuccess={() => fetchData(currentPage)}
      />
    </div>
  );
}

export default UserManagement;
