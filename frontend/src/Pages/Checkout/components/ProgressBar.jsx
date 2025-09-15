import React from 'react';
import '../Checkout.css';

export function ProgressBar({ currentStep, steps }) {
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={index} className="progress-step">
            <div
              className={`progress-step-circle ${
                index + 1 < currentStep
                  ? 'active'
                  : index + 1 === currentStep
                  ? 'current'
                  : 'inactive'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`progress-step-label ${
                index + 1 <= currentStep ? 'active' : 'inactive'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-bg"></div>
        <div
          className="progress-bar-fill"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
