import React from "react";
import "./LoadingTruck.css"; // Nhớ import file CSS

const LoadingTruck = () => {
  return (
    <div className="loader-wrapper">
      <div className="car-container">
        <div className="car">
          <div className="window"></div>
          <div className="cargo-details"></div>
          <div className="door"></div>
          <div className="lights"></div>
        </div>
        {/* Class wheels dùng chung, thêm wheels1/wheels2 để định vị */}
        <div className="wheels wheels1"></div>
        <div className="wheels wheels2"></div>
        <div className="street"></div>
        <div className="post"></div>
      </div>
    </div>
  );
};

export default LoadingTruck;
