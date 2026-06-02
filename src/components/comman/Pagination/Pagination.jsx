import React from 'react';
import './Pagination.scss';

function getPaginationRange(currentPage, totalPages) {
	if (totalPages <= 1) return [1];
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages = [1];

	if (currentPage > 3) {
		pages.push('ellipsis-start');
	}

	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	for (let page = start; page <= end; page += 1) {
		pages.push(page);
	}

	if (currentPage < totalPages - 2) {
		pages.push('ellipsis-end');
	}

	pages.push(totalPages);

	return pages;
}

function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
	if (!totalPages || totalPages < 1) return null;

	const pages = getPaginationRange(currentPage, totalPages);

	const handlePageChange = page => {
		if (page < 1 || page > totalPages || page === currentPage) return;
		onPageChange(page);
	};

	return (
		<div className={`pagination ${className}`.trim()}>
			<button
				type="button"
				className="pagination__nav"
				onClick={() => handlePageChange(currentPage - 1)}
				disabled={currentPage === 1}
				aria-label="Previous page">
				&lt; Prev
			</button>

			<div className="pagination__pages" role="navigation" aria-label="Pagination">
				{pages.map(page =>
					typeof page === 'string' ? (
						<span key={page} className="pagination__ellipsis" aria-hidden="true">
							…
						</span>
					) : (
						<button
							key={page}
							type="button"
							className={`pagination__page${
								page === currentPage ? ' pagination__page--active' : ''
							}`}
							onClick={() => handlePageChange(page)}
							disabled={page === currentPage}
							aria-label={`Page ${page}`}
							aria-current={page === currentPage ? 'page' : undefined}>
							{page}
						</button>
					)
				)}
			</div>

			<button
				type="button"
				className="pagination__nav"
				onClick={() => handlePageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				aria-label="Next page">
				Next &gt;
			</button>
		</div>
	);
}

export default Pagination;
