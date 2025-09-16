import styled from "styled-components";

export const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
  background-color: #ffffff; /* белый фон */
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* мягкая тень */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;

  h2 {
    margin-bottom: 1rem;
    text-align: center;
  }

  input {
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }
  }

  p {
    color: red;
    text-align: center;
  }

  .social-login {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .google-btn, .facebook-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .google-btn {
    background-color: #ffffff;
    color: #000;
    border: 1px solid #ccc;
  }

  .google-btn:hover {
    background-color: #f0f0f0;
  }

  .facebook-btn {
    background-color: #4267B2;
    color: #fff;
  }

  .facebook-btn:hover {
    background-color: #365899;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 90%;
  }
`;
