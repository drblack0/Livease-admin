import React, { useState } from 'react';
import { addUser } from '../../../server';
import './AddTenantModal.scss';

const AddTenantModal = ({ isOpen, onClose, onSuccess }) => {
  const [tenantForm, setTenantForm] = useState({
    name: '',
    email: '',
    number: '',
    location: '',
    password: '',
    account_type: 'Tenant'
  });
  const [submittingTenant, setSubmittingTenant] = useState(false);
  const [tenantError, setTenantError] = useState('');
  const [tenantSuccess, setTenantSuccess] = useState('');

  if (!isOpen) return null;

  const handleAddTenantSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setTenantError('');
    setTenantSuccess('');

    // Validation
    if (!tenantForm.name || !tenantForm.email || !tenantForm.number || !tenantForm.location || !tenantForm.password) {
      setTenantError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tenantForm.email)) {
      setTenantError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmittingTenant(true);
      const response = await addUser({
        name: tenantForm.name.trim(),
        email: tenantForm.email.trim(),
        number: tenantForm.number.trim(),
        location: tenantForm.location.trim(),
        password: tenantForm.password,
        account_type: 'Tenant'
      });

      if (response) {
        setTenantSuccess('Tenant created successfully!');
        setTimeout(() => {
          setTenantForm({
            name: '',
            email: '',
            number: '',
            location: '',
            password: '',
            account_type: 'Tenant'
          });
          setTenantError('');
          setTenantSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      let errorMessage = error.message || 'Failed to create tenant. Please try again.';
      
      // Check for specific duplicate user error
      if (errorMessage.toLowerCase().includes('account already exist')) {
        errorMessage = "This contact already exists";
      }
      
      setTenantError(errorMessage);
    } finally {
      setSubmittingTenant(false);
    }
  };

  return (
    <div
      className="add-tenant-modal-overlay"
      onClick={onClose}>
      <div
        className="add-tenant-modal-content"
        onClick={e => e.stopPropagation()}>
        <div className="add-tenant-modal-header">
          <div className="add-tenant-header-left">
            <h2>Add New Tenant</h2>
            <p className="add-tenant-subtitle">
              Create a new tenant account in the system.
            </p>
          </div>
          <button
            type="button"
            className="add-tenant-submit-btn"
            onClick={handleAddTenantSubmit}
            disabled={submittingTenant}>
            {submittingTenant ? 'Creating...' : 'Create Tenant'}
          </button>
        </div>

        {tenantError && (
          <div className="add-tenant-error">{tenantError}</div>
        )}

        {tenantSuccess && (
          <div className="add-tenant-success">{tenantSuccess}</div>
        )}

        <form onSubmit={handleAddTenantSubmit} className="add-tenant-form">
          <div className="add-tenant-form-columns">
            {/* Left Column */}
            <div className="add-tenant-left-column">
              <div className="add-tenant-form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={tenantForm.name}
                  onChange={e =>
                    setTenantForm({
                      ...tenantForm,
                      name: e.target.value
                    })
                  }
                  placeholder="Enter tenant name"
                  required
                />
              </div>

              <div className="add-tenant-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={tenantForm.email}
                  onChange={e =>
                    setTenantForm({
                      ...tenantForm,
                      email: e.target.value
                    })
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="add-tenant-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={tenantForm.number}
                  onChange={e =>
                    setTenantForm({
                      ...tenantForm,
                      number: e.target.value
                    })
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="add-tenant-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={tenantForm.location}
                  onChange={e =>
                    setTenantForm({
                      ...tenantForm,
                      location: e.target.value
                    })
                  }
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="add-tenant-form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={tenantForm.password}
                  onChange={e =>
                    setTenantForm({
                      ...tenantForm,
                      password: e.target.value
                    })
                  }
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;
