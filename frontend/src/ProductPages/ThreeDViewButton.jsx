import React from 'react';
import './ThreeDViewButton.css';

export function ThreeDViewButton() {
  return (
    <button className="three-d-button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="three-d-icon"
      >
        <path d="M12 2l7 4v8l-7 4-7-4V6z" />
        <path d="M12 22V12M19 6l-7 4-7-4" />
      </svg>
      <span>View 3D Model</span>
    </button>
  );
}
