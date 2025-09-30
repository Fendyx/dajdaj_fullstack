export const url = "https://dajdaj-fullstack-backend.onrender.com/api";

export const setHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
