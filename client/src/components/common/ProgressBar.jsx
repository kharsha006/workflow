import React from 'react';

const ProgressBar = ({ value, max = 100, variant = 'brand', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  let variantClass = '';
  if (variant === 'success') variantClass = 'progress-success';
  if (variant === 'warning') variantClass = 'progress-warning';
  if (variant === 'danger') variantClass = 'progress-danger';

  return (
    <div className={`progress ${variantClass} ${className}`}>
      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default ProgressBar;
