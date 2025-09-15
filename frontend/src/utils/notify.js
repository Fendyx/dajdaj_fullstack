// frontend/src/utils/notify.js
import { toast } from "react-toastify";

// Функция проверяет, мобильное ли устройство
const isMobile = () => window.innerWidth <= 768; // можно изменить breakpoint

const notify = {
  success: (message, options = {}) => {
    if (!isMobile()) toast.success(message, options);
  },
  info: (message, options = {}) => {
    if (!isMobile()) toast.info(message, options);
  },
  error: (message, options = {}) => {
    if (!isMobile()) toast.error(message, options);
  },
};

export default notify;
