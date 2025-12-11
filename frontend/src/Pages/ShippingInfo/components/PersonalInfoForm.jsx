import React, { useEffect } from "react";
import { useSelector } from "react-redux";

export function PersonalInfoForm({ data, onChange }) {
  const userEmail = useSelector((state) => state.auth.email);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  // Подставляем email сразу при наличии userEmail
  useEffect(() => {
    if (userEmail && data.email !== userEmail) {
      onChange({
        ...data,
        email: userEmail,
      });
    }
  }, [userEmail]);

  return (
    <div className="form-section">
      <h2>Dane odbiorcy</h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="label">Imię</label>
          <input
            type="text"
            className="input"
            placeholder="Wpisz swoje imię"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Nazwisko</label>
          <input
            type="text"
            className="input"
            placeholder="Wpisz swoje nazwisko"
            value={data.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">E-mail</label>
          <input
            type="email"
            className="input"
            placeholder="example@mail.com"
            value={data.email}
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="label">Numer telefonu</label>
          <input
            type="tel"
            className="input"
            placeholder="+48 600 000 000"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
