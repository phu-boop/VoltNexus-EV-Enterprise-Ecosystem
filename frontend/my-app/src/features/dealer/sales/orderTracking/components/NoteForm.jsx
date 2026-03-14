import React, { useState } from 'react';

/**
 * Form thêm ghi chú cho tracking
 * @param {function} onSubmit - Callback khi submit
 * @param {function} onCancel - Callback khi hủy
 */
const NoteForm = ({ onSubmit, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ notes: notes.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Thêm ghi chú</h3>
        <p className="text-sm text-gray-500 mb-4">
          Thêm ghi chú để theo dõi tình trạng đơn hàng
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Nội dung ghi chú
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập ghi chú về tình trạng đơn hàng..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!notes.trim() || submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang thêm...' : 'Thêm ghi chú'}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;