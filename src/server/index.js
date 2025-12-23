import { apiRequest } from '../util/helper/apiHelper';
export const BASE_URL = 'https://livease-backend.onrender.com/api/v1';
// export const BASE_URL = 'http://localhost:4001/api/v1';
export const signIn = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/signInPassword`,
		method: 'POST',
		data
	});

export const getUsersList = (page, recordsPerPage, compType) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getUsers/${compType}?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getProperties = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getProperties?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getPropertyByID = _ID =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getProperty/${_ID}`,
		method: 'GET',
		requiresAuth: true
	});

export const getPropertyByUserID = _ID =>
	apiRequest({
		endpoint: `${BASE_URL}/property/userProperties?userId=${_ID}`,
		method: 'GET',
		requiresAuth: true
	});

export const addProperties = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addProperty`,
		method: 'POST',
		data,
		requiresAuth: true
	});

export const updatePropertyStatus = (data, _id) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/updateProperty/${_id}`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

export const updateUserStatus = (data, _id) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/updateUser/${_id}`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

export const addUser = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addUser`,
		method: 'POST',
		data,
		requiresAuth: true
	});

export const getProfileDetails = _ID =>
	apiRequest({
		endpoint: `${BASE_URL}/user/${_ID}`,
		method: 'GET',
		requiresAuth: true
	});

export const addProperty = payload =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addProperty`,
		data: payload,
		method: 'POST',
		requiresAuth: true
	});

export const saveScrapedProperty = payload =>
	apiRequest({
		endpoint: `${BASE_URL}/property/scraped`,
		data: payload,
		method: 'POST',
		requiresAuth: true
	});

export const getTickets = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getTickets?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getTicketById = ticketId =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getTicket/${ticketId}`,
		method: 'GET',
		requiresAuth: true
	});

export const updateTicket = (ticketId, data) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/updateTicket/${ticketId}`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

export const uploadDocs = formDataToSend =>
	apiRequest({
		endpoint: `${BASE_URL}/profile/uploadAsset`,
		method: 'POST',
		data: formDataToSend,
		requiresAuth: true,
		isFormData: true
	});

export const getMaintenanceRequests = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getServiceRequests?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getMaintenanceRequestsById = id =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getServiceRequest/${id}`,
		method: 'GET',
		requiresAuth: true
	});

export const createServiceRequest = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addServiceRequest`,
		method: 'POST',
		data,
		requiresAuth: true
	});

// Dashboard APIs
export const getDashboardStats = () =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/dashboard/stats`,
		method: 'GET',
		requiresAuth: true
	});

export const getMatchingMetrics = () =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/dashboard/matchingMetrics`,
		method: 'GET',
		requiresAuth: true
	});

export const getRecentActivity = (limit = 10) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/dashboard/recentActivity?limit=${limit}`,
		method: 'GET',
		requiresAuth: true
	});

export const getRecentSupportTickets = (limit = 5) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/dashboard/supportTickets?limit=${limit}`,
		method: 'GET',
		requiresAuth: true
	});

// Wallet APIs
export const getWallets = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getWallets?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getTransactionLogs = (userId, page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getTransactionLogs/${userId}?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const createTransaction = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/createTransaction`,
		method: 'POST',
		data,
		requiresAuth: true
	});

// Service Provider APIs
export const getServiceProviders = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getServiceProviders?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getServiceProviderById = providerId =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getServiceProvider/${providerId}`,
		method: 'GET',
		requiresAuth: true
	});

export const addServiceProvider = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addServiceProvider`,
		method: 'POST',
		data,
		requiresAuth: true
	});

export const updateServiceProvider = (providerId, data) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/updateServiceProvider/${providerId}`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

// Property Checkup APIs
export const getPropertyCheckups = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const getPropertyCheckupById = checkupId =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup/${checkupId}`,
		method: 'GET',
		requiresAuth: true
	});

export const getCheckupsByProperty = propertyId =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup/property/${propertyId}`,
		method: 'GET',
		requiresAuth: true
	});

export const createPropertyCheckup = data =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup`,
		method: 'POST',
		data,
		requiresAuth: true
	});

export const submitCheckupPictures = data =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup/submit`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

export const approvePropertyCheckup = checkupId =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup/${checkupId}/approve`,
		method: 'PUT',
		requiresAuth: true
	});

export const rejectPropertyCheckup = (checkupId, data) =>
	apiRequest({
		endpoint: `${BASE_URL}/propertyCheckup/${checkupId}/reject`,
		method: 'PUT',
		data,
		requiresAuth: true
	});

// Admin Management APIs
export const getAdminUsers = (page, recordsPerPage) =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/getAdminUsers?page=${page}&limit=${recordsPerPage}`,
		method: 'GET',
		requiresAuth: true
	});

export const addAdminUser = data =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/addAdminUser`,
		method: 'POST',
		data,
		requiresAuth: true
	});

export const deleteAdminUser = adminId =>
	apiRequest({
		endpoint: `${BASE_URL}/admin/deleteAdminUser/${adminId}`,
		method: 'DELETE',
		requiresAuth: true
	});
