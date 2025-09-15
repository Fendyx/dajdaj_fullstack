import React, { useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { DeliveryMethods } from './components/DeliveryMethods';
import { Summary } from './components/Summary';
import './Checkout.css';

export default function Checkout() {
  const steps = ['Dane', 'Dostawa', 'Podsumowanie'];
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    defaultDelivery: { name: '', surname: '', email: '', phone: '' },
    deliveryMethod: '',
    deliveryDetails: {}
  });

  const token = localStorage.getItem('token'); // adjust if you store auth differently

  const handlePersonalInfoChange = (data) => {
    setFormData(prev => ({ ...prev, defaultDelivery: data }));
  };

  const handleDeliveryChange = (method, details) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: method,
      deliveryDetails: details
    }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      const { name, surname, email, phone } = formData.defaultDelivery;
      return name && surname && email && phone;
    }
    if (currentStep === 2) {
      return formData.deliveryMethod && Object.keys(formData.deliveryDetails).length > 0;
    }
    return true;
  };

  const saveStep1ToBackend = async () => {
    try {
      await fetch('/api/profile/delivery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData.defaultDelivery)
      });
    } catch (err) {
      console.error('Error saving delivery info:', err);
    }
  };

  const nextStep = async () => {
    if (!validateStep()) {
      alert('Uzupełnij wszystkie wymagane pola');
      return;
    }
    if (currentStep === 1) {
      await saveStep1ToBackend();
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
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
        {currentStep === 2 && (
          <DeliveryMethods
            data={{
              method: formData.deliveryMethod,
              details: formData.deliveryDetails
            }}
            onChange={handleDeliveryChange}
          />
        )}
        {currentStep === 3 && <Summary data={formData} />}
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
            onClick={() => alert('Zamówienie złożone!')}
          >
            Złóż zamówienie
          </button>
        )}
      </div>
    </div>
  );
}
