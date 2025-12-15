import React, { useState } from 'react';

import './scrapingmodule.scss';


import { saveScrapedProperty } from '../../server';

function ScrapingModule() {
  const [form, setForm] = useState({
    link: '',
    source: 'Facebook',
    keywords: '',
    resultsLimit: 20, // Default limit
  });

  const [rows, setRows] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!form.link) {
        setError("Please provide a link.");
        setLoading(false);
        return;
    }

    try {
        console.log("Sending scrape request to backend...");

        const response = await fetch('http://localhost:4001/api/v1/scraping/facebook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header if your backend requires it and you have a token
                // 'x-authorization-token': localStorage.getItem('authToken') 
            },
            body: JSON.stringify({
                url: form.link,
                limit: form.resultsLimit
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Backend request failed");
        }

        const data = await response.json();
        const items = data.data || data; 
        
        console.log("Results from backend:", items);

        // Map results to table format
        // Map results to table format
        // Backend now returns structured data directly
        const mappedRows = items.map(item => ({
            ...item, // Keep all fields (rent, deposit, images, etc.)
            property: item.property || "N/A",
            avatar: item.avatar || '/assets/3d_avatar_1.png',
            description: item.description || "No description",
            link: item.facebookUrl || "N/A",
            listedBy: item.listedBy || "Unknown",
        }));

        setRows(mappedRows);
    } catch (err) {
        console.error("Scraping error:", err);
        setError("Scraping failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleCheckboxChange = (idx) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(idx)) {
        newSelected.delete(idx);
    } else {
        newSelected.add(idx);
    }
    setSelectedIndices(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
        setSelectedIndices(new Set(rows.map((_, idx) => idx)));
    } else {
        setSelectedIndices(new Set());
    }
  };

  const handleUpload = async () => {
    if (selectedIndices.size === 0) {
        alert("Please select at least one item to upload.");
        return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    const indices = Array.from(selectedIndices);

    for (const idx of indices) {
        const item = rows[idx];
        try {
            await saveScrapedProperty(item);
            successCount++;
        } catch (err) {
            console.error("Failed to upload item:", item.property, err);
            failCount++;
        }
    }

    setUploading(false);
    alert(`Upload Complete.\nSuccess: ${successCount}\nFailed: ${failCount}`);
    // Optional: Remove successful ones or clear selection
    if (successCount > 0) {
        setSelectedIndices(new Set());
    }
  };

  return (
    <div className="scraping-module-page">
      <div className="scraping-module-card">
        <h1>Scraping Module</h1>
        <p>Enter a Facebook URL to scrape posts.</p>
        <form className="scraping-module-form" onSubmit={handleScrape}>
          <div className="form-group">
            <label>Enter Link*</label>
            <input
              type="text"
              name="link"
              placeholder="https://www.facebook.com/groups/..."
              value={form.link}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Source Selection</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
            >
              <option>Facebook</option>
              {/* Other options masked for now as we focus on FB */}
            </select>
          </div>
          <div className="form-group">
             <label>Results Limit</label>
             <input
                type="number"
                name="resultsLimit"
                placeholder="20"
                value={form.resultsLimit}
                onChange={handleChange}
             />
          </div>
          {/* Keywords input kept but not used by this specific actor setup yet, 
              or could be used if we switch actors. Keeping it for UI consistency. */}
          <div className="form-group">
            <label>Enter Keywords (Optional)</label>
            <input
              type="text"
              name="keywords"
              placeholder="Keywords"
              value={form.keywords}
              onChange={handleChange}
            />
          </div>
          
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

          <div className="scraping-module-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Scraping..." : "Submit"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => setRows([])}>Clear</button>
          </div>
        </form>
      </div>
      
      {rows.length > 0 && (
          <div className="scraping-module-table-wrapper">
            <table className="scraping-module-table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={handleSelectAll} checked={rows.length > 0 && selectedIndices.size === rows.length} /></th>
                  <th>Post Preview</th>
                  <th>Full Text</th>
                  <th>Link</th>
                  <th>Listed by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                        <input 
                            type="checkbox" 
                            checked={selectedIndices.has(idx)} 
                            onChange={() => handleCheckboxChange(idx)} 
                        />
                    </td>
                    <td>
                      <img src={row.avatar} alt="avatar" className="scraping-module-avatar" />
                      {row.property}
                    </td>
                    <td>{row.description}</td>
                    <td><a href={row.link} target="_blank" rel="noreferrer">View Post</a></td>
                    <td>{row.listedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="scraping-module-pagination">
              {rows.length} Result(s)
            </div>
            <div className="scraping-module-upload-row">
              <button 
                className="upload-btn" 
                onClick={handleUpload} 
                disabled={uploading || selectedIndices.size === 0}
              >
                  {uploading ? "Uploading..." : "Upload Selected"}
              </button>
            </div>
          </div>
      )}
    </div>
  );
}

export default ScrapingModule;
