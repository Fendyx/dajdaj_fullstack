import React from 'react';
import { FaCube, FaImage } from 'react-icons/fa';
import './ThreeDViewButton.css';

export function ThreeDViewButton({ onClick, is3DMode }) {
  return (
    <button onClick={onClick} className="three-d-button">
      {is3DMode ? (
        <>
          <FaImage className="three-d-icon" />
          <span>Посмотреть фотографии</span>
        </>
      ) : (
        <>
          <FaCube className="three-d-icon" />
          <span>View 3D Model</span>
        </>
      )}
    </button>
  );
}
