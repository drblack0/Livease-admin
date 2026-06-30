import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPropertyByID, updatePropertyStatus, deleteProperty } from "../../server"; // getLandlordByID for landlord info
import "./flat.scss";

function Flat() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState({
    name: "",
    role: "Landlord",
    avatar: "/assets/3d_avatar_1.png",
  });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await getPropertyByID(id);
        if (res) {
          setProperty(res);

          // fetch landlord info if landlord ID exists
          // if (res.landlord) {
          //   const landlordRes = await getLandlordByID(res.landlord);
          //   if (landlordRes) {
          //     setOwner({
          //       name: landlordRes.name || "N/A",
          //       role: "Landlord",
          //       avatar: landlordRes.avatar || "/assets/3d_avatar_1.png",
          //     });
          //   }
          // }
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // close dropdown on outside click and helpers for actions
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleEditProperty = () => {
    navigate(`/add-property?propertyId=${id}&action=edit`);
  };

  const handleSuspend = async () => {
    const confirmed = window.confirm("Are you sure you want to suspend this property?");
    if (!confirmed) return;
    try {
      setActionInProgress(true);
      await updatePropertyStatus({ status: "suspended" }, id);
      alert("Property suspended");
      const refreshed = await getPropertyByID(id);
      if (refreshed) setProperty(refreshed);
    } catch (err) {
      console.error("Failed to suspend property", err);
      alert("Failed to suspend property. Please try again.");
    } finally {
      setActionInProgress(false);
      setDropdownOpen(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;
    try {
      setActionInProgress(true);
      // Hard delete: permanently remove the property (and related records) on the backend
      await deleteProperty(id);
      alert("Property deleted");
      // Record no longer exists; leave the detail page
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete property", err);
      alert("Failed to delete property. Please try again.");
    } finally {
      setActionInProgress(false);
      setDropdownOpen(false);
    }
  };

  if (loading) return <div className="loading-text">Loading property...</div>;
  if (!property) return <div className="no-data">Property not found.</div>;

  // map amenities dynamically
  const amenitiesList = [];
  const amenitiesMap = {
    pool: "Pool",
    gym: "Gym",
    parking: "Parking",
    lift: "Lift",
    power_backup: "Power Backup",
    garden: "Garden",
    kids_play_area: "Kids Play Area",
    security: "Security",
  };
  for (const [key, value] of Object.entries(property.amenities || {})) {
    if (value && amenitiesMap[key]) amenitiesList.push(amenitiesMap[key]);
  }

  // map nearby facilities dynamically
  const nearbyFacilitiesList = [];
  const facilitiesMap = {
    metro_station: "Metro Station",
    airport: "Airport",
    school: "School",
    shopping_mall: "Shopping Mall",
    hospital: "Hospital",
    place_of_worship: "Temple / Church",
    park: "Park / Garden",
  };
  for (const [key, value] of Object.entries(property.nearby_facilities || {})) {
    if (value && facilitiesMap[key])
      nearbyFacilitiesList.push(facilitiesMap[key]);
  }

  return (
    <div className="flat-page">
      <div className="flat-page__section-one rad">
        <div className="flat-header">
          <div>
            <h2>{property.title}</h2>
          </div>
          <div className="flat-header__rent">
            <span>
              Monthly Rent : <b>₹ {property.rent_amount}</b>
            </span>
            <span style={{ marginLeft: 24 }}>
              Deposit : <b>₹ {property.deposit_amount}</b>
            </span>
          </div>
        </div>

        <div className="flat-image-section">
          {property.property_images && property.property_images.length > 0 ? (
            <img
              src={property.property_images[0]}
              alt={property.property_title}
              className="flat-main-image"
            />
          ) : (
            <div className="flat-image-placeholder">No Image Available</div>
          )}
          <div className="flat-actions">
            <button className="flat-share-btn">Share</button>
            <div className="flat-actions-wrapper">
              <button
                className="flat-actions-toggle"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                ⋯
              </button>
              {dropdownOpen && (
                <div className="flat-actions-menu" ref={dropdownRef}>
                  <button onClick={handleEditProperty} disabled={actionInProgress}>
                    Edit Property
                  </button>
                  <button onClick={handleSuspend} disabled={actionInProgress}>
                    Suspend
                  </button>
                  <button onClick={handleDeleteProfile} disabled={actionInProgress}>
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flat-bottom-row">
        <div className="flat-desc-card">
          <h3>Description & Overview</h3>
          <p>{property.property_description || "No description available."}</p>
        </div>

        <div className="flat-owner-card">
          <h3>Owner & Documents</h3>
          <div className="flat-owner-info">
            <img src={owner.avatar} alt="owner" className="flat-owner-avatar" />
            <div>
              <div className="flat-owner-name">{owner.name}</div>
              <div className="flat-owner-role">{owner.role}</div>
            </div>
            <div className="flat-owner-chat">
              <img src="/assets/Frame 337.png" alt="chat" />
            </div>
          </div>

          <div className="flat-documents-label">Documents</div>
          <div className="flat-documents">
            {property.property_documents?.ownership_document && (
              <a
                href={property.property_documents.ownership_document}
                target="_blank"
                rel="noopener noreferrer"
                className="flat-document-placeholder"
              >
                Ownership Doc
              </a>
            )}
            {property.property_documents?.property_tax_receipt && (
              <a
                href={property.property_documents.property_tax_receipt}
                target="_blank"
                rel="noopener noreferrer"
                className="flat-document-placeholder"
              >
                Tax Receipt
              </a>
            )}
            {property.property_documents?.other_documents?.map((doc, idx) => (
              <a
                key={idx}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="flat-document-placeholder"
              >
                Doc {idx + 1}
              </a>
            ))}
          </div>
        </div>

        <div className="flat-amenities-card">
          <h3>Amenities</h3>
          <div className="flat-amenities-list">
            {amenitiesList.map((item, idx) => (
              <span key={idx} className="flat-amenity">
                {item}
              </span>
            ))}
          </div>

          {nearbyFacilitiesList.length > 0 && (
            <>
              <h3>Nearby Facilities</h3>
              <div className="flat-amenities-list">
                {nearbyFacilitiesList.map((item, idx) => (
                  <span key={idx} className="flat-amenity">
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flat;
