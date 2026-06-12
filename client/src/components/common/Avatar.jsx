import React from 'react';

const Avatar = ({ initials, bg = '#EEF2FF', color = '#4F46E5', size = 'md', style = {}, className = '' }) => {
  return (
    <div 
      className={`av av-${size} ${className}`} 
      style={{ background: bg, color: color, ...style }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
