// frontend/src/utils/notify.ts
import { toast } from "react-toastify";

const isMobile = () => window.innerWidth <= 768;

const notify = {
  success: (message: string, options = {}) => {
    if (!isMobile()) toast.success(message, options);
  },
  info: (message: string, options = {}) => {
    if (!isMobile()) toast.info(message, options);
  },
  error: (message: string, options = {}) => {
    if (!isMobile()) toast.error(message, options);
  },
};

export default notify;