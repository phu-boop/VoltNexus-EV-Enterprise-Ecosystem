import api from './api';

// Get all reviews for admin
export const getAllReviews = () =>
  api.get('/customers/api/reviews/admin/all').then((res) => res.data);

// Get reviews by status
export const getReviewsByStatus = (status) =>
  api.get(`/customers/api/reviews/admin/status/${status}`).then((res) => res.data);

// Approve a review
export const approveReview = (reviewId, approvedBy) =>
  api.put(`/customers/api/reviews/${reviewId}/approve`, null, { params: { approvedBy } }).then((res) => res.data);

// Reject a review
export const rejectReview = (reviewId, rejectedBy) =>
  api.put(`/customers/api/reviews/${reviewId}/reject`, null, { params: { rejectedBy } }).then((res) => res.data);

// Hide a review
export const hideReview = (reviewId, hiddenBy) =>
  api.put(`/customers/api/reviews/${reviewId}/hide`, null, { params: { hiddenBy } }).then((res) => res.data);

// Mark review as helpful
export const markHelpful = (reviewId) =>
  api.post(`/customers/api/reviews/${reviewId}/helpful`).then((res) => res.data);

export default {
  getAllReviews,
  getReviewsByStatus,
  approveReview,
  rejectReview,
  hideReview,
  markHelpful
};
