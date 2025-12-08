import { useState, useEffect } from "react";
import RangeSlider from "react-range-slider-input";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addProperty,
  getPropertyByID,
  updatePropertyStatus,
  uploadDocs,
  getUsersList,
} from "../../server";
import {
  prepareProfilePayload,
  mapAiResponseToFormData,
  isSaveFormValid,
  validateMoneyInput,
  validateDurationInput,
} from "../../util/validateForm/";

// import Loader from "../../Components/Loader/Loader.component";
import {
  AiSendIcon,
  backBtnIcon,
  uploadIcon,
  signinLocation,
} from "../../util/svg";
import {
  BHK_OPTIONS,
  LOCALITY_DETAILS_OPTIONS,
  AMENITIES_OPTIONS,
  FURNISHING_OPTIONS,
  PREFERENCE_OPTIONS,
  PROPERTY_TYPE,
} from "../../constants";

import AutoComplete from "../comman/AutoComplete/AutoComplete";
import "react-range-slider-input/dist/style.css";
import "./addProperty.scss";

/* ---------- Small Components ---------- */
const CheckboxGroup = ({
  field,
  options,
  selected,
  onToggle,
  inputType = "checkbox",
}) => (
  <div className="checkbox-group">
    {options.map((item) => (
      <label key={item}>
        <input
          type={inputType}
          checked={selected.includes(item)}
          onChange={() => onToggle(field, item)}
        />
        {item}
      </label>
    ))}
  </div>
);

const BooleanCheckboxGroup = ({ field, options, selected, onToggle }) => (
  <div className="checkbox-group">
    {options.map((item) => (
      <label key={item.key}>
        <input
          type="checkbox"
          checked={selected[item.key] || false}
          onChange={() => onToggle(field, item.key)}
        />
        {item.label}
      </label>
    ))}
  </div>
);

const InputGroup = ({ label, children, required }) => (
  <div className="section">
    <label className="label">
      {label} {required && <span className="required">*</span>}
    </label>
    {children}
  </div>
);

const FileUpload = ({ accountType, onUpload, uploaded }) => (
  <InputGroup label="Verification" required>
    <input
      type="file"
      id="document-upload"
      style={{ display: "none" }}
      onChange={(e) => onUpload(e.target.files[0])}
    />
    <label htmlFor="document-upload" className="upload-btn">
      {accountType === "landlord" || accountType === "admin"
        ? "Upload Property Bill/Document"
        : "Upload ID Proof"}{" "}
      <i>{uploadIcon()}</i>
    </label>
    {uploaded && (
      <p className="document-status">Document uploaded successfully</p>
    )}
  </InputGroup>
);

/* ---------- Main Component ---------- */
const DetailsComponent = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = queryParams.get("userId");
  const type = queryParams.get("type") || "landlord";
  const action = queryParams.get("action") || "";
  const propertyId = queryParams.get("propertyId");

  // Minimal local user state to preserve tenant vs landlord UI branching.
  const [user] = useState(() => {
    // Check for admin first
    if (localStorage.getItem("adminEmail")) {
      return { account_type: "admin" };
    }
    // normalize incoming type query param to match utils expectations ("Landlord"/"Tenant")
    const normalized = type
      ? type.toLowerCase() === "landlord"
        ? "landlord"
        : "tenant"
      : localStorage.getItem("account_type") || "tenant";
    return { account_type: normalized };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [landlords, setLandlords] = useState([]);
  const [selectedLandlord, setSelectedLandlord] = useState("");

  const navigate = useNavigate();

  // Local UI-only form state. No API calls or validations here.
  const [formData, setFormData] = useState({
    property_requirement: "",
    property_images: [],
    property_name: "",
    address: {},
    about: "",
    space: { min: 0, max: 100 },
    bhk_type: [],
    locality_details: {},
    amenities: {},
    furnishing: "",
    rental_budget: { min: "", max: "" },
    deposit: { min: "", max: "" },
    preference: "",
    possession_date: "",
    lease_duration: "",
    verification_document: null,
    aiSuggestion: [],
    property_type: "",
    is_primary: false,
    is_deleted: false,
  });

  /* ---------- Simple UI handlers (no side-effects) ---------- */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, child, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      if (field === "bhk_type") {
        return {
          ...prev,
          bhk_type: prev.bhk_type.includes(value)
            ? prev.bhk_type.filter((v) => v !== value)
            : [...prev.bhk_type, value],
        };
      }
      return {
        ...prev,
        [field]: { ...prev[field], [value]: !prev[field]?.[value] },
      };
    });
  };

  const handlePropertyImagesUpload = async (files) => {
    setIsLoading(true);
    try {
      const uploadedImages = [];
      for (let file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadDocs(fd);
        uploadedImages.push(result.asset);
      }
      setFormData((prev) => ({
        ...prev,
        property_images: [...prev.property_images, ...uploadedImages],
      }));
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a property image by index
  const handleRemovePropertyImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      property_images: prev.property_images.filter((_, i) => i !== index),
    }));
  };
  const toggleAiSuggestion = (enabled) =>
    setFormData((prev) => ({
      ...prev,
      aiSuggestion: enabled ? ["enabled"] : [],
    }));

  const handleAiRequirement = () => {
    // UI-only placeholder: mark AI as used and do not call external services.
    setFormData((prev) => ({ ...prev, aiSuggestion: ["enabled"] }));
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Fetch landlords if user is admin
  useEffect(() => {
    if (user.account_type === "admin") {
      const fetchLandlords = async () => {
        try {
          // Fetch landlords, assuming pagination to get many or modify limit as needed
          const res = await getUsersList(1, 100, "Landlord");
          if (res?.users) {
            setLandlords(res.users);
          }
        } catch (err) {
          console.error("Failed to fetch landlords", err);
        }
      };
      fetchLandlords();
    }
  }, [user.account_type]);

  // If this page is opened in edit mode (action=edit), fetch the property
  // and prefill the form with API response values.
  useEffect(() => {
    let mounted = true;
    const prefill = async () => {
      if (action !== "edit" || !propertyId) return;
      try {
        const res = await getPropertyByID(propertyId);
        if (!mounted || !res) return;

        const mapApiToForm = (p) => ({
          property_requirement: p.property_requirement || "",
          property_images: p.property_images || [],
          property_name: p.title || p.property_title || "",
          address: p.address || {},
          about: p.property_description || p.about || "",
          space: {
            min: p.space?.min ?? p.area ?? 0,
            max: p.space?.max ?? p.area ?? 0,
          },
          bhk_type: p.bhk_type || [],
          locality_details: p.locality_details || {},
          amenities: p.amenities || {},
          furnishing: p.furnishing || "",
          rental_budget: {
            min: p.rental_budget?.min ?? p.rent_amount ?? "",
            max: p.rental_budget?.max ?? "",
          },
          deposit: {
            min: p.deposit?.min ?? p.deposit_amount ?? "",
            max: p.deposit?.max ?? "",
          },
          preference: p.preferred_tenants || "",
          possession_date: p.possession_date
            ? new Date(p.possession_date).toISOString().slice(0, 10)
            : "",
          lease_duration: p.lease_duration || "",
          // Ensure verification_document is always an array so uploads and
          // payload building don't end up saving an empty string on the server.
          verification_document: p.verification_document || null,
          aiSuggestion: p.ai_pricing_enabled ? ["enabled"] : [],
          property_type: p.property_type || "",
          is_primary: p.is_primary || false,
        });

        setFormData((prev) => ({ ...prev, ...mapApiToForm(res) }));
        if (res.landlord && user.account_type === "admin") {
          setSelectedLandlord(res.landlord);
        }

      } catch (err) {
        console.error("Failed to prefill property for edit", err);
      }
    };

    prefill();
    return () => {
      mounted = false;
    };
  }, [action, propertyId, user.account_type]);

  const handleSave = async () => {
    // Call the API to add property. Show basic success / failure feedback and
    // navigate back to profile/dashboard on success.
    try {
      setIsLoading(true);
      // Build payload using shared prepareProfilePayload helper so field names
      // and types match server expectations.
      // If admin, treat as landlord for payload structure purposes
      const accountTypeForPayload =
        user.account_type === "admin" ||
        (user.account_type && user.account_type.toLowerCase() === "landlord")
          ? "landlord"
          : "tenant";
      const payload = prepareProfilePayload(formData, accountTypeForPayload);

      // When adding a property for a specific landlord (navigated from profile),
      // include the landlord id so backend can associate the property.
      if (type && type.toLowerCase() === "landlord" && userId) {
        payload.landlord = userId;
      }
      // If admin selected a landlord
      if (user.account_type === "admin" && selectedLandlord) {
        payload.landlord = selectedLandlord;
      }

      if (action === "edit" && propertyId) {
        // When editing, call updatePropertyStatus to update the existing property
        await updatePropertyStatus(payload, propertyId);
        alert("Property updated successfully!");
        navigate("/profile");
      } else {
        await addProperty(payload);
        // notify user and navigate back to profile (existing back button goes to /profile)
        alert("Property added successfully!");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Failed to add property", err);
      alert("Failed to add property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    // Store a placeholder/local reference for UI preview.
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDocs(fd);
      // Fix: Store as single string, not array. Backend expects string.
      handleInputChange("verification_document", result.asset);
    } catch (err) {
      console.error("Document upload failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- JSX ---------- */
  return (
    <>
      {/* {isLoading && <Loader />}
      {isLoading && <Loader />} */}

      <div className="edit-profile-setup rad">
        <h2>
          {user.account_type === "landlord" || user.account_type === "admin"
            ? "Add New Property"
            : "Set up Your Profile"}
        </h2>
        <p className="subtitle">
          {user.account_type !== "landlord" && user.account_type !== "admin"
            ? "Complete your Profile And find Best Property, kindly fill all the field to find best deals."
            : "Complete your Property details And find Best Tenant, kindly fill all the field to find best deals."}
        </p>

        {user.account_type === "admin" && (
          <InputGroup label="Select Landlord" required>
            <select
              className="input"
              value={selectedLandlord}
              onChange={(e) => setSelectedLandlord(e.target.value)}
            >
              <option value="">Select Landlord</option>
              {landlords.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.email})
                </option>
              ))}
            </select>
          </InputGroup>
        )}

        {(user.account_type === "landlord" || user.account_type === "admin") && (
          <>
            <div className="primary-checkbox">
              <label>
                Select as Primary
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) =>
                    handleInputChange("is_primary", e.target.checked)
                  }
                />
              </label>
            </div>
            <InputGroup label="Upload Property Images" required>
              <input
                type="file"
                id="property-images-upload"
                style={{ display: "none" }}
                multiple
                className="property-images-upload"
                onChange={(e) => handlePropertyImagesUpload(e.target.files)}
              />
              <label htmlFor="property-images-upload" className="upload-btn">
                Upload <i>{uploadIcon()}</i>
              </label>

              <div className="uploaded-images">
                {formData.property_images.map((img, idx) => (
                  <div key={idx} className="image-preview">
                    <button
                      type="button"
                      className="remove-image"
                      aria-label={`Remove image ${idx + 1}`}
                      onClick={() => handleRemovePropertyImage(idx)}
                    >
                      ×
                    </button>
                    <img src={img} alt={`Property ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Property Name" required>
              <input
                className="input propertyname-input"
                placeholder="Property Name"
                value={formData.property_name}
                onChange={(e) =>
                  handleInputChange("property_name", e.target.value)
                }
              />
            </InputGroup>

            <InputGroup label="Location" required>
              <AutoComplete
                id="address"
                placeholder="Location"
                value={formData.address?.structured_formatting?.main_text}
                onChange={handleInputChange}
                onBlur={handleBlur}
                // icon={signinLocation}
              />
            </InputGroup>
          </>
        )}

        {/* {user.account_type !== "landlord" && (
          <InputGroup label="Property Requirements">
            <div className="Ai-requirement">
              <textarea
                placeholder="Type your requirement here..."
                className="requirement-input"
                value={formData.property_requirement}
                onChange={(e) =>
                  handleInputChange("property_requirement", e.target.value)
                }
              />
              <i onClick={handleAiRequirement}>{AiSendIcon()}</i>
            </div>
          </InputGroup>
        )} */}

        <InputGroup label="Space">
          <div className="space-slider">
            <RangeSlider
              min={100}
              max={10000}
              step={100}
              className="single-thumb"
              value={[0, formData.space.max || 100]}
              thumbsDisabled={[true, false]}
              rangeSlideDisabled
              onInput={([, max]) =>
                handleNestedInputChange("space", "max", max)
              }
            />
            <input
              className="input"
              placeholder="Sq. Feet"
              value={formData.space.max ? `${formData.space.max} Sq. Feet` : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const val = Math.max(100, Math.min(Number(raw), 10000));
                handleNestedInputChange("space", "max", val);
              }}
            />
          </div>
          <CheckboxGroup
            field="bhk_type"
            options={BHK_OPTIONS}
            selected={formData.bhk_type}
            onToggle={handleCheckboxChange}
          />
        </InputGroup>

        <InputGroup label="Locality Details">
          <BooleanCheckboxGroup
            field="locality_details"
            options={LOCALITY_DETAILS_OPTIONS}
            selected={formData.locality_details}
            onToggle={handleCheckboxChange}
          />
        </InputGroup>

        <InputGroup label="Amenities">
          <BooleanCheckboxGroup
            field="amenities"
            options={AMENITIES_OPTIONS}
            selected={formData.amenities}
            onToggle={handleCheckboxChange}
          />
        </InputGroup>

        <InputGroup label="Furnishing">
          <CheckboxGroup
            field="furnishing"
            options={FURNISHING_OPTIONS}
            selected={[formData.furnishing]}
            onToggle={(field, val) =>
              handleInputChange(field, formData.furnishing === val ? "" : val)
            }
          />
        </InputGroup>

        {(user.account_type === "landlord" || user.account_type === "admin") && (
          <>
            <InputGroup label="Preference" required>
              <CheckboxGroup
                field="preference"
                options={PREFERENCE_OPTIONS}
                selected={[formData.preference]}
                onToggle={(field, val) =>
                  handleInputChange(
                    field,
                    formData.preference === val ? "" : val
                  )
                }
              />
            </InputGroup>
            <InputGroup label="Property Type" required>
              <CheckboxGroup
                field="property_type"
                inputType="radio"
                options={PROPERTY_TYPE}
                selected={[formData.property_type]}
                onToggle={(field, val) =>
                  handleInputChange(
                    field,
                    formData.property_type === val ? "" : val
                  )
                }
              />
            </InputGroup>
          </>
        )}

        <InputGroup label="Rental Budget" required>
          {user.account_type === "landlord" || user.account_type === "admin" ? (
            <div className="suggestion-checkbox">
              <input
                className="input"
                placeholder="Minimum Budget"
                value={formData.rental_budget.min}
                onChange={(e) =>
                  handleNestedInputChange(
                    "rental_budget",
                    "min",
                    e.target.value
                  )
                }
              />
              <div className="ai-suggestion-wrapper">
                <div className="ai-text-wrapper">
                  <span>Get AI pricing suggestions</span>
                  <span className="sub-text">
                    Helps improve the odds of renting out your property
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.aiSuggestion.includes("enabled")}
                  onChange={(e) => toggleAiSuggestion(e.target.checked)}
                />
              </div>
            </div>
          ) : (
            <div className="input-group">
              <input
                className="input"
                placeholder="Minimum Budget"
                value={formData.rental_budget.min}
                onChange={(e) =>
                  handleNestedInputChange(
                    "rental_budget",
                    "min",
                    e.target.value
                  )
                }
              />
              <input
                className="input"
                placeholder="Maximum Budget"
                value={formData.rental_budget.max}
                onChange={(e) =>
                  handleNestedInputChange(
                    "rental_budget",
                    "max",
                    e.target.value
                  )
                }
              />
            </div>
          )}
        </InputGroup>

        <div className="section group-section">
          <div className="inner-section">
            <label className="label">
              Possession Date <span className="required">*</span>
            </label>
            <input
              className="input"
              type="date"
              value={formData.possession_date}
              onChange={(e) =>
                handleInputChange("possession_date", e.target.value)
              }
            />
          </div>
          <div className="inner-section">
            <label className="label">
              Lease Duration <span className="required">*</span>
            </label>
            <input
              className="input"
              placeholder="Lease Duration"
              value={formData.lease_duration}
              onChange={(e) =>
                handleInputChange("lease_duration", e.target.value)
              }
            />
          </div>
        </div>

        <InputGroup label="Deposit" required>
          <div className="input-group">
            <input
              className="input"
              placeholder="Minimum Deposit"
              value={formData.deposit.min}
              onChange={(e) =>
                handleNestedInputChange("deposit", "min", e.target.value)
              }
            />
            {user.account_type !== "landlord" && user.account_type !== "admin" && (
              <input
                className="input"
                placeholder="Maximum Deposit"
                value={formData.deposit.max}
                onChange={(e) =>
                  handleNestedInputChange("deposit", "max", e.target.value)
                }
              />
            )}
          </div>
        </InputGroup>

        {(user.account_type === "landlord" || user.account_type === "admin") && (
          <InputGroup label="About The Property" required>
            <textarea
              className="input"
              placeholder="Type about the property here..."
              value={formData.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
            />
          </InputGroup>
        )}

        <FileUpload
          accountType={user.account_type}
          onUpload={handleDocumentUpload}
          uploaded={formData.verification_document}
        />

        <div className="actions">
          <button className="skip-btn">Skip</button>
          <button
            className="save-btn"
            onClick={handleSave}
            // disabled={!isSaveFormValid(formData, user.account_type)}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default DetailsComponent;
