// src/utils/notification.js
import { toast } from 'react-toastify';

export const showSuccess = (msg) => {
  toast.success(msg, { autoClose: 3000 });
};

export const showError = (msg) => {
  toast.error(msg, { autoClose: 4000 });
};

export const showInfo = (msg) => {
  toast.info(msg, { autoClose: 3000 });
};
