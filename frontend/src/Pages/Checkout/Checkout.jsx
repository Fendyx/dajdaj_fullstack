// src/Pages/Checkout/Checkout.jsx
import React, { useState } from "react";
import { ProgressBar } from "./components/ProgressBar";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import DeliveryStep from "./components/DeliveryStep/DeliveryStep";
import "./Checkout.css";

// <-- добавленный импорт
import { useAddDeliveryDataMutation } from "../../slices/userApi";

export default function Checkout() {
  const steps = ["Dane", "Dostawa"];
  const [currentStep, setCurrentStep] = useState(1);

  // используем хук RTK Query
  const [addDeliveryData, { isLoading }] = useAddDeliveryDataMutation();

  const [formData, setFormData] = useState({
    personalData: { name: "", surname: "", email: "", phone: "" },
    delivery: {
      address: {
        address: "",
        lat: null,
        lon: null,
        place_id: null,
      },
      method: "",
    },
  });

  // шаг 1
  const handlePersonalInfoChange = (data) => {
    setFormData((prev) => ({ ...prev, personalData: data }));
  };

  // шаг 2
  const handleDeliveryChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      delivery: { ...prev.delivery, [field]: value },
    }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      const { name, surname, email, phone } = formData.personalData;
      return name && surname && email && phone;
    }
    if (currentStep === 2) {
      return formData.delivery.address?.address && formData.delivery.method;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      alert("Uzupełnij wszystkie wymagane pola");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const submitOrder = async () => {
    const payload = {
      personalData: formData.personalData,
      delivery: {
        address: formData.delivery.address.address,
        method: formData.delivery.method,
      },
    };

    try {
      const response = await addDeliveryData(payload).unwrap();
      console.log("✅ Данные доставки сохранены:", response.deliveryDatas);
      alert("✅ Данные доставки сохранены!");
      // можно перейти на страницу успеха / очистить корзину и т.п.
    } catch (error) {
      console.error("❌ Ошибка сохранения:", error);
      alert("Ошибка сохранения данных доставки");
    }
  };

  return (
    <div className="checkout-container">
      <ProgressBar currentStep={currentStep} steps={steps} />

      <div className="checkout-content">
        {currentStep === 1 && (
          <PersonalInfoForm data={formData.personalData} onChange={handlePersonalInfoChange} />
        )}

        {currentStep === 2 && (
          <DeliveryStep
            selectedAddress={formData.delivery.address}
            selectedMethod={formData.delivery.method}
            onAddressChange={(addr) => handleDeliveryChange("address", addr)}
            onMethodChange={(method) => handleDeliveryChange("method", method)}
            onBack={prevStep}
            onPlaceOrder={submitOrder}
            personalData={formData.personalData}
            delivery={formData.delivery}
            isSubmitting={isLoading}
          />
        )}
      </div>

      <div className="checkout-actions">
        {currentStep === 1 && (
          <button className="btn btn-primary" onClick={nextStep}>
            Dalej
          </button>
        )}
      </div>
    </div>
  );
}
