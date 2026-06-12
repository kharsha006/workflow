import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const HRInventory = () => {
  const [inventory] = useState([
    { id: 'INV-1001', type: 'Laptop', name: 'MacBook Pro 16"', assignedTo: { name: 'Riya Kapoor', role: 'Founding Team' }, status: 'Assigned', date: '2025-01-15' },
    { id: 'INV-1002', type: 'Laptop', name: 'Dell XPS 15', assignedTo: { name: 'Marcus Webb', role: 'Backend Engineer' }, status: 'Assigned', date: '2025-02-10' },
    { id: 'INV-1003', type: 'Monitor', name: 'LG UltraFine 27"', assignedTo: { name: 'Priya Nair', role: 'UI/UX Designer' }, status: 'Assigned', date: '2025-03-01' },
    { id: 'INV-1004', type: 'Keyboard', name: 'Keychron K2', assignedTo: null, status: 'Available', date: '2025-05-20' },
    { id: 'INV-1005', type: 'Laptop', name: 'ThinkPad T14', assignedTo: null, status: 'In Repair', date: '2025-06-01' },
    { id: 'INV-1006', type: 'Monitor', name: 'Dell 24" Monitor', assignedTo: null, status: 'Available', date: '2025-06-10' },
  ]);

  return (
    <div className="view active" style={{ padding: '0 24px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Inventory Management</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Manage company assets, devices, and assignments</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Mobile Camera Integration */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            background: '#F3E8FF', border: '1px solid #D8B4FE', padding: '8px 14px',
            borderRadius: 'var(--radius-lg)', fontSize: '13px', fontWeight: 600, color: '#6B21A8',
            transition: 'all 0.2s ease'
          }}>
            <i className="fas fa-camera"></i>
            Take Photo
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  console.log('Captured:', e.target.files[0]);
                  // Would normally upload here
                }
              }} 
            />
          </label>
          <Button variant="brand" icon="plus">Add Item</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="task-table" style={{ width: '100%', margin: 0 }}>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Item</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Acquired On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600, color: 'var(--text2)' }}>{item.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.type}</div>
                </td>
                <td>
                  {item.assignedTo ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar initials={item.assignedTo.name.split(' ').map(n=>n[0]).join('')} size="sm" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.assignedTo.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.assignedTo.role}</div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: '12px' }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <Badge variant={item.status === 'Assigned' ? 'success' : item.status === 'Available' ? 'brand' : 'warning'}>
                    {item.status}
                  </Badge>
                </td>
                <td style={{ color: 'var(--text2)', fontSize: '13px' }}>{item.date}</td>
                <td>
                  <Button variant="ghost" size="sm" icon="pen">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRInventory;
