export const url = `${process.env.REACT_APP_API_URL}/api`;

export const setHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
