import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWallets, getTransactionLogs } from '../../server/index';
import Pagination from '../comman/Pagination/Pagination';
import './wallet.scss';

function Wallet() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState([]);
	const [wallets, setWallets] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const recordsPerPage = 10;

	useEffect(() => {
		fetchWallets();
	}, []);

	useEffect(() => {
		if (selectedUserId) {
			fetchTransactions(selectedUserId, currentPage);
		}
	}, [selectedUserId, currentPage]);

	useEffect(() => {
		// Auto-select first user if none selected and wallets are loaded
		if (wallets.length > 0 && !selectedUserId) {
			const firstWallet = wallets[0];
			const firstUserId =
				firstWallet.user?._id ||
				firstWallet.user?._id?.toString() ||
				firstWallet.user?.toString() ||
				firstWallet.user;
			if (firstUserId) {
				setSelectedUserId(firstUserId.toString());
			}
		}
	}, [wallets]);

	const fetchWallets = async () => {
		try {
			setLoading(true);
			const response = await getWallets(1, 1000); // Get all wallets for balance calculation
			console.log('Wallets API Response:', response); // Debug log

			// Handle different response structures (data.wallets or wallets directly)
			const walletsData = response?.data?.wallets || response?.wallets || [];

			if (walletsData.length > 0) {
				// Filter out deleted wallets and wallets without valid users
				const validWallets = walletsData.filter(
					wallet => wallet && !wallet.is_deleted && wallet.user
				);

				console.log('Valid wallets:', validWallets); // Debug log

				if (validWallets.length > 0) {
					setWallets(validWallets);

					// Calculate aggregate balance from valid wallets only
					const totalBalance = validWallets.reduce((sum, wallet) => {
						const balance =
							typeof wallet.balance === 'number'
								? wallet.balance
								: parseFloat(wallet.balance) || 0;
						return sum + balance;
					}, 0);
					setBalance(totalBalance);
					console.log('Total balance calculated:', totalBalance); // Debug log

					// Auto-select first user if available
					if (!selectedUserId) {
						const firstWallet = validWallets[0];
						// Handle different user ID formats
						let firstUserId = null;
						if (firstWallet.user) {
							if (
								typeof firstWallet.user === 'object' &&
								firstWallet.user._id
							) {
								firstUserId = firstWallet.user._id.toString();
							} else if (typeof firstWallet.user === 'string') {
								firstUserId = firstWallet.user;
							} else {
								firstUserId = firstWallet.user.toString();
							}
						}

						if (firstUserId) {
							setSelectedUserId(firstUserId);
							console.log('Auto-selected user ID:', firstUserId); // Debug log
						}
					}
				} else {
					console.warn('No valid wallets found after filtering');
				}
			} else {
				console.warn('No wallets found in response:', response);
			}
		} catch (error) {
			console.error('Error fetching wallets:', error);
			alert('Failed to load wallets. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const fetchTransactions = async (userId, page) => {
		if (!userId) return;

		try {
			setLoading(true);
			const response = await getTransactionLogs(userId, page, recordsPerPage);
			if (response?.logs) {
				setTransactions(response.logs);
				setTotalPages(response.total_pages || 1);
			}
		} catch (error) {
			console.error('Error fetching transactions:', error);
			alert('Failed to load transactions. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const formatDate = txn => {
		// Handle different possible date fields
		const dateValue = txn.date || txn.createdAt || txn.updatedAt;
		if (!dateValue) return '';
		const date = new Date(dateValue);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const formatType = type => {
		return type?.charAt(0).toUpperCase() + type?.slice(1) || '';
	};

	const handleUserChange = e => {
		const userId = e.target.value;
		setSelectedUserId(userId);
		setCurrentPage(1);
	};

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const filteredTransactions = transactions.filter(txn => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			txn.amount?.toString().includes(searchLower) ||
			txn.type?.toLowerCase().includes(searchLower) ||
			formatDate(txn).toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="wallet-page">
			<div className="wallet-header-row">
				<div>
					<h1>Wallet</h1>
					<p>Manage Your Task and Activities.</p>
				</div>
				<div className="wallet-header-actions">
					<button onClick={() => navigate('/credit-wallet')}>
						<img src="/assets/icon (1).png" alt="add" /> Credit Wallet
					</button>
					<button onClick={() => navigate('/credit-wallet')}>
						<img src="/assets/icon (1).png" alt="add" /> Debit Wallet
					</button>
				</div>
			</div>
			<div className="wallet-balance-section">
				<div className="wallet-balance-label">Total Available Balance</div>
				<div className="wallet-balance-box">
					<span className="wallet-balance-credits">
						<img src="/assets/cryptocurrency-color_gold (1).png" alt="coin" />{' '}
						Credits
					</span>
					<span className="wallet-balance-value">
						{loading ? 'Loading...' : balance.toLocaleString()}
					</span>
				</div>
			</div>

			{wallets.length > 0 && (
				<div className="wallet-user-selector" style={{ marginBottom: '20px' }}>
					<label htmlFor="user-select" style={{ marginRight: '10px' }}>
						Select User:{' '}
					</label>
					<select
						id="user-select"
						value={selectedUserId || ''}
						onChange={handleUserChange}
						style={{ padding: '8px', minWidth: '200px' }}>
						{wallets.map((wallet, index) => {
							// Handle different user ID formats
							let userId = null;
							let userName = 'Unknown User';

							if (wallet.user) {
								if (typeof wallet.user === 'object' && wallet.user._id) {
									userId = wallet.user._id.toString();
									userName =
										wallet.user.name || wallet.user.email || 'Unknown User';
								} else if (typeof wallet.user === 'string') {
									userId = wallet.user;
									userName = 'User ' + userId.substring(0, 8);
								} else {
									userId = wallet.user.toString();
									userName = 'User ' + userId.substring(0, 8);
								}
							}

							// Fallback to index if no user ID found
							if (!userId) {
								userId = `wallet-${index}`;
							}

							const balance =
								typeof wallet.balance === 'number'
									? wallet.balance
									: parseFloat(wallet.balance) || 0;

							return (
								<option key={userId} value={userId}>
									{userName} (Balance: ₹{balance.toLocaleString()})
								</option>
							);
						})}
					</select>
				</div>
			)}

			<div className="wallet-table-controls">
				<input
					className="wallet-search"
					placeholder="Search transactions..."
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
				<div className="wallet-table-filters">
					<button>
						<img
							src="/assets/Icon (4).png"
							alt="date"
							style={{ width: 18, marginRight: 6 }}
						/>
						Date
					</button>
					<button>Status</button>
				</div>
			</div>
			<div className="wallet-table-wrapper">
				{loading ? (
					<div style={{ padding: '20px', textAlign: 'center' }}>
						Loading transactions...
					</div>
				) : filteredTransactions.length === 0 ? (
					<div style={{ padding: '20px', textAlign: 'center' }}>
						{selectedUserId
							? 'No transactions found.'
							: 'Please select a user to view transactions.'}
					</div>
				) : (
					<>
						<table className="wallet-table">
							<thead>
								<tr>
									<th>
										<input type="checkbox" />
									</th>
									<th>Amount</th>
									<th>Type</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{filteredTransactions.map((txn, idx) => (
									<tr key={idx}>
										<td>
											<input type="checkbox" />
										</td>
										<td>₹{txn.amount?.toLocaleString() || 0}</td>
										<td>{formatType(txn.type)}</td>
										<td>{formatDate(txn)}</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pagination
							className="wallet-pagination"
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export default Wallet;
