import React from "react";
import "./Categories.css";

const Categories = () => {
  const categories = [
    { name: "EasyLife", icon: <img src="/easylife.svg" alt="EasyLife" className="category-icon" /> },
    { name: "Gifts", icon: <img src="/presentcategory.svg" alt="Gifts" className="category-icon" /> },
    { name: "Figurines", icon: <img src="/3dcategory.svg" alt="Figurines" className="category-icon" /> },
  ];

  return (
    <section className="categories-section">
      <div className="categories-header">
        <h2>Categories</h2>
      </div>
      <div className="categories-container">
        {categories.map((cat, index) => (
          <div className="category-wrapper" key={index}>
            <div className="category-card">{cat.icon}</div>
            <span className="category-title">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
