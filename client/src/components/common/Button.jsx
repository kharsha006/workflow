import React from 'react';

const Button = ({ children, variant = 'primary', size, icon, className = '', ...props }) => {
  const sizeClass = size ? `btn-${size}` : '';
  const btnClass = `btn btn-${variant} ${sizeClass} ${className}`;
  
  return (
    <button className={btnClass} {...props}>
      {icon && <i className={`fas fa-${icon}`}></i>}
      {children}
    </button>
  );
};

export default Button;
