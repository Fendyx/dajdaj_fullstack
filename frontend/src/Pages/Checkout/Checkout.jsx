import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ProgressBar } from "./components/ProgressBar";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import DeliveryMethods from "./components/DeliveryMethods";
import { Summary } from "./components/Summary";
import "./Checkout.css";

export default function Checkout() {
  const steps = ["Dane", "Dostawa", "Podsumowanie"];
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    defaultDelivery: { name: "", surname: "", email: "", phone: "" },
  });

  const token = localStorage.getItem("token");
  const pickupPoint = useSelector((state) => state.cart.pickupPoint); // ✅ читаем выбранный пункт

  const handlePersonalInfoChange = (data) => {
    setFormData((prev) => ({ ...prev, defaultDelivery: data }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      const { name, surname, email, phone } = formData.defaultDelivery;
      return name && surname && email && phone;
    }
    if (currentStep === 2) {
      return !!pickupPoint; // ✅ проверяем, что выбран пункт
    }
    return true;
  };

  const saveStep1ToBackend = async () => {
    try {
      await fetch("/api/profile/delivery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData.defaultDelivery),
      });
    } catch (err) {
      console.error("Error saving delivery info:", err);
    }
  };

  const nextStep = async () => {
    if (!validateStep()) {
      alert("Uzupełnij wszystkie wymagane pola");
      return;
    }
    if (currentStep === 1) {
      await saveStep1ToBackend();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="checkout-container">
      <ProgressBar currentStep={currentStep} steps={steps} />

      <div className="checkout-content">
        {currentStep === 1 && (
          <PersonalInfoForm
            data={formData.defaultDelivery}
            onChange={handlePersonalInfoChange}
          />
        )}

        {currentStep === 2 && <DeliveryMethods />}

        {currentStep === 3 && (
          <Summary
            data={{
              ...formData,
              pickupPoint, // ✅ добавляем пункт в итоговый обзор
            }}
          />
        )}
      </div>

      <div className="checkout-actions">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            Wstecz
          </button>
        )}
        {currentStep < steps.length && (
          <button className="btn btn-primary" onClick={nextStep}>
            Dalej
          </button>
        )}
        {currentStep === steps.length && (
          <button
            className="btn btn-success"
            onClick={() => {
              // Здесь уже можно делать POST заказа на бэкенд
              console.log("Заказ:", { ...formData, pickupPoint });
              alert("Zamówienie złożone!");
            }}
          >
            Złóż zamówienie
          </button>
        )}
      </div>
    </div>
  );
}
