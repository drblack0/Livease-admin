import React from 'react';
import './feedback.scss';

function Feedback() {
  return (
    <div className="feedback-page">
      <div className="feedback-main">
        <div className="feedback-details-card">
          <h3>Details</h3>
          <div className="feedback-users-row">
            <div className="feedback-user">
              <img src="/assets/3d_avatar_1.png" alt="landlord" />
              <div>
                <div className="feedback-user-name">Janvi Patel</div>
                <div className="feedback-user-role">landlord</div>
              </div>
            </div>
            <div className="feedback-user">
              <img src="/assets/3d_avatar_2.png" alt="tenant" />
              <div>
                <div className="feedback-user-name">Anjali Patel</div>
                <div className="feedback-user-role">Tenant</div>
              </div>
            </div>
          </div>
          <div className="feedback-address">
            <span>📍</span> 4517 Washington Ave. Manchester, Kentucky 39495
          </div>
          <div className="feedback-info-row">
            <div>Monthly</div>
            <div>05/07/2025</div>
            <div>Pending</div>
            <div>Images Uploaded</div>
          </div>
          <div className="feedback-section-title">Tenant Submission</div>
          <div className="feedback-images-label">Property Images</div>
          <div className="feedback-images">
            <div className="img-placeholder"></div>
            <div className="img-placeholder"></div>
            <div className="img-placeholder"></div>
          </div>
          <div className="feedback-date">11:20 AM IST, May 28, 2025</div>
          <div className="feedback-actions-row">
            <button className="send-btn">Send Reminder</button>
            <button className="resolve-btn">Resolve</button>
            <button className="archive-btn" disabled>Archive</button>
          </div>
        </div>
      </div>
      <div className="feedback-side">
        <div className="feedback-side-card">
          <div className="feedback-side-title">Landlord Feedback</div>
          <div className="feedback-side-content">Property in good condition</div>
          <div className="feedback-side-date">11:20 AM IST, May 28, 2025</div>
        </div>
        <div className="feedback-side-card">
          <div className="feedback-side-title">Tenant Feedback</div>
          <div className="feedback-side-content">Property in good condition</div>
          <div className="feedback-side-date">11:20 AM IST, May 28, 2025</div>
        </div>
        <div className="feedback-side-card">
          <div className="feedback-side-title">
            Zeqlo Notes
            <button className="add-notes-btn">Add Notes</button>
          </div>
          <div className="feedback-side-content">Property in good condition</div>
          <div className="feedback-side-date">11:20 AM IST, May 28, 2025</div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;