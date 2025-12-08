import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './maintenanceService.scss';
import {
	getMaintenanceRequests,
	createServiceRequest,
	getUsersList,
	getProperties
} from '../../server';
function MaintenanceService() {
	const navigate = useNavigate();
	const [requests, setRequests] = useState([]);
	const [filteredRequests, setFilteredRequests] = useState([]);
	const [menuOpen, setMenuOpen] = useState(null);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const recordsPerPage = 10;
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [createForm, setCreateForm] = useState({
		requestId: '',
		user_id: '',
		property: '',
		dueDate: '',
		description: '',
		urgency: 'medium',
		cost: 0
	});
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [tenants, setTenants] = useState([]);
	const [properties, setProperties] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [createError, setCreateError] = useState('');
	const [createSuccess, setCreateSuccess] = useState('');

	// Fetch maintenance requests from API
	const fetchData = async (page = 1) => {
		try {
			setLoading(true);
			const res = await getMaintenanceRequests(page, recordsPerPage);
			if (res?.requests) {
				const mapped = res.requests.map(r => ({
					_id: r._id,
					id: r._id,
					tenant: r.tenant?.name || 'N/A',
					property: r.property?.title || 'N/A',
					summary: r.description || 'N/A',
					urgency: r.urgency || 'N/A',
					status: r.status || 'N/A',
					response: r.landlord?.name || 'N/A'
				}));
				setRequests(mapped);
				setFilteredRequests(mapped);
				setTotalPages(res.total_pages || 1);
				setCurrentPage(res.current_page || page);
			} else {
				setRequests([]);
				setFilteredRequests([]);
				setTotalPages(1);
				setCurrentPage(1);
			}
		} catch (err) {
			console.error('Failed to fetch maintenance requests', err);
			setRequests([]);
			setFilteredRequests([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = event => {
			if (
				menuOpen !== null &&
				!event.target.closest('.maintenance-service-dropdown') &&
				!event.target.closest('.maintenance-service-dots')
			) {
				setMenuOpen(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [menuOpen]);

	// Search/filter
	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredRequests(requests);
			return;
		}
		const q = searchQuery.toLowerCase();
		const filtered = requests.filter(r => {
			return (
				(r.id || '').toString().toLowerCase().includes(q) ||
				(r.tenant || '').toLowerCase().includes(q) ||
				(r.property || '').toLowerCase().includes(q) ||
				(r.summary || '').toLowerCase().includes(q) ||
				(r.urgency || '').toLowerCase().includes(q) ||
				(r.status || '').toLowerCase().includes(q) ||
				(r.response || '').toLowerCase().includes(q)
			);
		});
		setFilteredRequests(filtered);
	}, [searchQuery, requests]);

	const handlePageChange = page => {
		if (page < 1 || page > totalPages) return;
		setCurrentPage(page);
	};

	const handleAssignProvider = requestId => {
		// Navigate to provider page with request ID as query param
		navigate(`/provider?requestId=${encodeURIComponent(requestId)}`);
		setMenuOpen(null); // Close the dropdown
	};

	const handleResolve = async requestId => {
		// TODO: Implement resolve functionality
		console.log('Resolve request:', requestId);
		setMenuOpen(null);
	};

	const handleSendReminder = async requestId => {
		// TODO: Implement send reminder functionality
		console.log('Send reminder for request:', requestId);
		setMenuOpen(null);
	};

	const generateRequestId = () => {
		// Generate a random 8-digit request ID
		return '#' + Math.floor(10000000 + Math.random() * 90000000).toString();
	};

	const handleOpenCreateModal = async () => {
		setShowCreateModal(true);
		setCreateError('');
		setCreateSuccess('');
		// Generate request ID
		const newRequestId = generateRequestId();
		setCreateForm(prev => ({ ...prev, requestId: newRequestId }));
		// Fetch tenants and properties for dropdowns
		try {
			const [tenantsRes, propertiesRes] = await Promise.all([
				getUsersList('Tenant', 1, 100),
				getProperties(1, 100)
			]);
			if (tenantsRes?.users) {
				setTenants(tenantsRes.users);
			}
			if (propertiesRes?.properties) {
				setProperties(propertiesRes.properties);
			}
		} catch (error) {
			console.error('Error fetching tenants/properties:', error);
		}
	};

	const handleCloseCreateModal = () => {
		setShowCreateModal(false);
		setCreateForm({
			requestId: '',
			user_id: '',
			property: '',
			dueDate: '',
			description: '',
			urgency: 'medium',
			cost: 0
		});
		setUploadedFiles([]);
		setCreateError('');
		setCreateSuccess('');
	};

	const handleFileUpload = e => {
		const files = Array.from(e.target.files);
		setUploadedFiles([...uploadedFiles, ...files]);
	};

	const removeFile = index => {
		setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
	};

	const handleCreateSubmit = async e => {
		if (e) {
			e.preventDefault();
		}
		setCreateError('');
		setCreateSuccess('');

		if (!createForm.property) {
			setCreateError('Please select a property.');
			return;
		}
		if (!createForm.description || createForm.description.trim() === '') {
			setCreateError('Description is required.');
			return;
		}

		try {
			setSubmitting(true);
			const response = await createServiceRequest({
				user_id: createForm.user_id || '6871eac57ca16dab949e11e3', // Optional - can be set later
				property: createForm.property,
				description: createForm.description.trim(),
				urgency: createForm.urgency,
				cost: parseFloat(createForm.cost) || 0
			});

			if (response) {
				setCreateSuccess('Maintenance request created successfully!');
				// Refresh the list
				setTimeout(() => {
					fetchData(currentPage);
					handleCloseCreateModal();
				}, 1500);
			}
		} catch (error) {
			console.error('Error creating request:', error);
			setCreateError(
				error.message || 'Failed to create request. Please try again.'
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="maintenance-service-page">
			<div className="maintenance-service-header-row">
				<div>
					<h1>Maintenance Service Requests</h1>
					<p>Manage Your Task and Activities.</p>
				</div>
				<button className="create-btn" onClick={handleOpenCreateModal}>
					<img src="/assets/icon (1).png"></img> Create Request
				</button>
			</div>
			<div className="maintenance-service-table-controls">
				<input
					className="maintenance-service-search"
					placeholder="Search"
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
				/>
				{/* <div className="maintenance-service-table-filters">
          <button>Provider ▼</button>
          <button>Urgency ▼</button>
          <button>Status ▼</button>
        </div> */}
			</div>
			<div className="maintenance-service-table-wrapper">
				<table className="maintenance-service-table">
					<thead>
						<tr>
							<th>
								<input type="checkbox" />
							</th>
							<th>Request ID</th>
							<th>Tenant</th>
							<th>Property</th>
							<th>Issue Summary</th>
							<th>Urgency</th>
							<th>Status</th>
							<th>Landlord Response</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={9}>Loading...</td>
							</tr>
						) : filteredRequests.length > 0 ? (
							filteredRequests.map((req, idx) => (
								<tr key={req._id || idx}>
									<td>
										<input type="checkbox" />
									</td>
									<td>
										<Link
											to={`/maintenance-details?id=${encodeURIComponent(
												req._id || req.id
											)}`}>
											{req.id}
										</Link>
									</td>
									<td>
										<Link
											to={`/maintenance-details?id=${encodeURIComponent(
												req._id || req.id
											)}`}>
											{req.tenant}
										</Link>
									</td>
									<td>
										<Link
											to={`/maintenance-details?id=${encodeURIComponent(
												req._id || req.id
											)}`}>
											{req.property}
										</Link>
									</td>
									<td>
										<Link
											to={`/maintenance-details?id=${encodeURIComponent(
												req._id || req.id
											)}`}>
											{req.summary}
										</Link>
									</td>
									<td>
										<Link
											to={`/maintenance-details?id=${encodeURIComponent(
												req._id || req.id
											)}`}>
											{req.urgency}
										</Link>
									</td>
									<td>
										<span className={req.status}>{req.status}</span>
									</td>
									<td>{req.response}</td>
									<td style={{ position: 'relative' }}>
										<button
											className="maintenance-service-dots"
											onClick={() =>
												setMenuOpen(menuOpen === idx ? null : idx)
											}>
											⋮
										</button>
										{menuOpen === idx && (
											<div className="maintenance-service-dropdown">
												<button
													onClick={() => {
														navigate(
															`/maintenance-details?id=${encodeURIComponent(
																req._id || req.id
															)}`
														);
														setMenuOpen(null);
													}}>
													✏️ Edit Request
												</button>
												<button
													onClick={() =>
														handleAssignProvider(req._id || req.id)
													}>
													● Assign Provider
												</button>
												<button
													onClick={() => handleResolve(req._id || req.id)}>
													● Resolve
												</button>
												<button
													onClick={() => handleSendReminder(req._id || req.id)}>
													🔔 Send Reminder
												</button>
											</div>
										)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={9}>No data found.</td>
							</tr>
						)}
					</tbody>
				</table>
				<div className="maintenance-service-pagination">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}>
						&lt; Prev
					</button>
					<span>
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}>
						Next &gt;
					</button>
				</div>
			</div>

			{/* Create Request Modal */}
			{showCreateModal && (
				<div
					className="create-request-modal-overlay"
					onClick={handleCloseCreateModal}>
					<div
						className="create-request-modal-content"
						onClick={e => e.stopPropagation()}>
						<div className="create-request-modal-header">
							<div className="create-request-header-left">
								<h2>Create Request</h2>
								<p className="create-request-subtitle">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
									do eiusmod tempor.
								</p>
							</div>
							<button
								type="button"
								className="create-request-submit-btn"
								onClick={e => {
									e.preventDefault();
									handleCreateSubmit(e);
								}}
								disabled={submitting}>
								{submitting ? 'Creating...' : 'Create'}
							</button>
						</div>

						{createError && (
							<div className="create-request-error">{createError}</div>
						)}

						{createSuccess && (
							<div className="create-request-success">{createSuccess}</div>
						)}

						<form onSubmit={handleCreateSubmit} className="create-request-form">
							<div className="create-request-form-columns">
								{/* Left Column */}
								<div className="create-request-left-column">
									<div className="create-request-form-group">
										<label>Request ID</label>
										<input
											type="text"
											value={createForm.requestId}
											readOnly
											className="create-request-readonly"
										/>
									</div>

									<div className="create-request-form-group">
										<label>Property</label>
										<select
											value={createForm.property}
											onChange={e =>
												setCreateForm({
													...createForm,
													property: e.target.value
												})
											}
											required>
											<option value="">Select Property</option>
											{properties.map(prop => (
												<option key={prop._id} value={prop._id}>
													{prop.title ||
														prop.property_title ||
														prop.name ||
														prop.location ||
														prop.address ||
														prop._id}
												</option>
											))}
										</select>
									</div>

									<div className="create-request-form-group">
										<label>Due Date</label>
										<select
											value={createForm.dueDate}
											onChange={e =>
												setCreateForm({
													...createForm,
													dueDate: e.target.value
												})
											}
											className="create-request-date-select">
											<option value="">Select Date</option>
											{/* Generate date options for next 30 days */}
											{Array.from({ length: 30 }, (_, i) => {
												const date = new Date();
												date.setDate(date.getDate() + i + 1);
												const dateStr = date.toISOString().split('T')[0];
												const formattedDate = date.toLocaleDateString('en-US', {
													month: 'long',
													day: 'numeric',
													year: 'numeric'
												});
												return (
													<option key={dateStr} value={dateStr}>
														{formattedDate}
													</option>
												);
											})}
										</select>
									</div>
								</div>

								{/* Right Column */}
								<div className="create-request-right-column">
									<div className="create-request-form-group">
										<label>Description</label>
										<textarea
											value={createForm.description}
											onChange={e =>
												setCreateForm({
													...createForm,
													description: e.target.value
												})
											}
											placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
											rows="6"
											className="create-request-textarea"
											required
										/>
									</div>

									<div className="create-request-upload-section">
										<button
											type="button"
											className="create-request-upload-btn"
											onClick={() =>
												document.getElementById('file-upload-input').click()
											}>
											Upload Property Bill/Document
											<span className="upload-icon">↑</span>
										</button>
										<input
											id="file-upload-input"
											type="file"
											multiple
											onChange={handleFileUpload}
											style={{ display: 'none' }}
										/>
										{uploadedFiles.length > 0 && (
											<div className="uploaded-files-list">
												{uploadedFiles.map((file, index) => (
													<div key={index} className="uploaded-file-item">
														<span className="uploaded-file-name">
															{file.name}
														</span>
														<button
															type="button"
															onClick={() => removeFile(index)}
															className="uploaded-file-remove">
															×
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default MaintenanceService;
