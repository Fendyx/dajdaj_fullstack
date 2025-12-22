import styled from "styled-components";

export const StyledForm = styled.form`
  width: 100%;
  max-width: 440px;
  background-color: #ffffff;
  padding: 3rem 2.5rem; /* Большие отступы для больших мониторов */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Большие промежутки */

  h2 {
    margin-bottom: 0.5rem;
    text-align: center;
    font-size: 1.75rem;
    color: #1a1a1a;
    font-weight: 700;
  }

  /* --- АДАПТАЦИЯ ПОД НОУТБУКИ (Высота экрана < 800px) --- */
  @media (max-height: 800px) {
    padding: 1.5rem 2rem; /* Уменьшаем внутренние отступы в 2 раза */
    gap: 1rem; /* Уменьшаем расстояние между элементами */
    
    h2 {
      font-size: 1.5rem; /* Чуть меньше заголовок */
      margin-bottom: 0.2rem;
    }

    input {
      padding: 0.7rem 1rem !important; /* Чуть компактнее поля */
    }
    
    button {
      padding: 0.8rem !important;
    }
  }

  button[type="submit"] {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    background-color: #111;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover { background-color: #333; }
    &:disabled { background-color: #ccc; cursor: not-allowed; }
  }

  .error-text {
    color: #d32f2f;
    font-size: 0.8rem;
    margin-top: -0.5rem; /* Подтянем ошибку ближе к полю */
    margin-left: 2px;
  }
  
  .backend-error {
    background-color: #ffebee;
    color: #c62828;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    text-align: center;
  }

  .switch-auth {
    margin-top: 0.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: #666;

    span {
      color: #007bff;
      font-weight: 600;
      cursor: pointer;
      margin-left: 5px;
      &:hover { text-decoration: underline; }
    }
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #888;
    font-size: 0.8rem;
    margin: 0.2rem 0; /* Уменьшим отступы у разделителя */
    
    &::before, &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #eaeaea;
    }
    &::before { margin-right: 10px; }
    &::after { margin-left: 10px; }
  }

  .social-login {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .google-btn, .facebook-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.7rem; /* Чуть меньше паддинг */
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ddd;
    color: #333;
    transition: 0.2s;

    &:hover { background-color: #f9f9f9; border-color: #ccc; }
  }

  /* Мобильная версия (ширина) */
  @media (max-width: 480px) {
    box-shadow: none;
    border: none;
    padding: 1.5rem;
    max-width: 100%;
  }
`;

export const InputGroup = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column; /* Label сверху, Input снизу */

  label {
    margin-bottom: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #444;
  }

  /* Адаптация label для ноутбуков */
  @media (max-height: 800px) {
    label { margin-bottom: 4px; font-size: 0.85rem; }
  }

  input {
    width: 100%;
    padding: 0.9rem 1rem;
    padding-right: 2.5rem; /* Место для глаза */
    border: 1px solid ${props => props.hasError ? '#d32f2f' : '#ccc'};
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    outline: none;
    background: #fff; /* Чтобы текст под глазом не просвечивал */

    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
  }

  /* --- ФИКС ГЛАЗА --- */
  .eye-icon {
    position: absolute;
    right: 12px;
    /* Ключевой момент: мы привязываем его к низу поля */
    /* Высота стандартного инпута ~45-50px. Отступ снизу ~13px ставит его в центр по вертикали */
    bottom: 13px; 
    
    color: #999;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2; /* Поверх инпута */
    
    &:hover { color: #555; }
  }
  
  /* Подстройка глаза для компактного режима ноутбука */
  @media (max-height: 800px) {
    .eye-icon {
       bottom: 10px; /* Так как инпут стал меньше по высоте (padding 0.7rem) */
    }
  }
`;