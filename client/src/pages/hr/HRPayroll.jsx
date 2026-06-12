import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const currentMonth = MONTHS[new Date().getMonth()];

const HRPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genMonth, setGenMonth] = useState(currentMonth);
  const [genYear, setGenYear] = useState(currentYear);
  const [employees, setEmployees] = useState([]);
  const [salaryMap, setSalaryMap] = useState({});
  const [generating, setGenerating] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchPayroll(); }, []);

  const fetchPayroll = async () => {
    try {
      const { data } = await api.get('/api/payroll');
      setPayrolls(data);
    } catch {
      addToast('Failed to load payroll', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openGenerate = async () => {
    try {
      const { data } = await api.get('/api/users');
      const emps = (data || []).filter(u => u.role === 'Employee' || u.role === 'Intern');
      setEmployees(emps);
      const map = {};
      emps.forEach(e => { map[e._id] = { base: '', deductions: '0', net: '' }; });
      setSalaryMap(map);
    } catch {
      addToast('Failed to load employees', 'error');
    }
    setShowGenerate(true);
  };

  const updateSalary = (empId, field, val) => {
    setSalaryMap(prev => {
      const entry = { ...prev[empId], [field]: val };
      if (field === 'base' || field === 'deductions') {
        const base = parseFloat(field === 'base' ? val : entry.base) || 0;
        const ded = parseFloat(field === 'deductions' ? val : entry.deductions) || 0;
        entry.net = String(Math.max(0, base - ded));
      }
      return { ...prev, [empId]: entry };
    });
  };

  const handleGenerate = async () => {
    const records = employees
      .filter(e => salaryMap[e._id]?.base)
      .map(e => ({
        employeeId: e._id,
        baseSalary: salaryMap[e._id].base,
        deductions: salaryMap[e._id].deductions || '0',
        netPay: salaryMap[e._id].net || salaryMap[e._id].base,
      }));

    if (records.length === 0) {
      addToast('Enter at least one employee salary to generate', 'error');
      return;
    }

    try {
      setGenerating(true);
      const { data } = await api.post('/api/payroll/generate', { month: genMonth, year: genYear, records });
      addToast(`Generated payroll for ${data.generated} employee(s)`, 'success');
      setShowGenerate(false);
      fetchPayroll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate payroll', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendPayslip = async (id) => {
    try {
      await api.post(`/api/payroll/${id}/payslip`);
      addToast('Payslip sent to employee', 'success');
      fetchPayroll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send payslip', 'error');
    }
  };

  const filtered = filterMonth ? payrolls.filter(p => p.month === filterMonth) : payrolls;

  const totalPaid = filtered.filter(p => p.status === 'Paid').length;
  const totalPending = filtered.filter(p => p.status === 'Pending').length;

  return (
    <div className="view active" id="view-hr-payroll">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Payroll</div>
          <div className="section-sub">{payrolls.length} records total</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="inp" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: '12px' }}>
            <option value="">All months</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <Button variant="primary" size="sm" icon="plus" onClick={openGenerate}>Generate Payroll</Button>
        </div>
      </div>

      {/* Summary row */}
      {!loading && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { label: `${totalPaid} Paid`, bg: 'var(--success-bg)', color: 'var(--success-text)' },
            { label: `${totalPending} Pending`, bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
          ].map(c => (
            <div key={c.label} style={{ padding: '5px 14px', borderRadius: '20px', background: c.bg, color: c.color, fontSize: '12px', fontWeight: 600 }}>
              {c.label}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}><i className="fas fa-circle-notch fa-spin"></i></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No payroll records found</div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Base Salary</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pay => (
                <tr key={pay._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar
                        initials={pay.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        bg={pay.employee?.avatar?.bg}
                        color={pay.employee?.avatar?.color}
                        size="sm"
                      />
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{pay.employee?.name}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{pay.month} {pay.year}</td>
                  <td style={{ fontSize: '13px' }}>{pay.baseSalary}</td>
                  <td style={{ fontSize: '13px', color: 'var(--danger)' }}>{pay.deductions ? `–${pay.deductions}` : '—'}</td>
                  <td style={{ fontSize: '13px', fontWeight: 700 }}>{pay.netPay || pay.baseSalary}</td>
                  <td>
                    <Badge variant={pay.status === 'Paid' ? 'success' : 'warning'}>{pay.status}</Badge>
                  </td>
                  <td>
                    {pay.status === 'Pending' && (
                      <Button variant="primary" size="sm" onClick={() => handleSendPayslip(pay._id)}>Send Payslip</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Payroll" subtitle="Enter salary details for each employee" maxWidth="620px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Month</label>
            <select className="inp" value={genMonth} onChange={e => setGenMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Year</label>
            <select className="inp" value={genYear} onChange={e => setGenYear(Number(e.target.value))}>
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg2)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)' }}>Employee</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)' }}>Base Salary</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)' }}>Deductions</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--success)' }}>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={emp._id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg2)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar initials={emp.avatar?.initials} bg={emp.avatar?.bg} color={emp.avatar?.color} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ color: 'var(--text3)', fontSize: '11px' }}>{emp.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input className="inp" placeholder="e.g. 85000" value={salaryMap[emp._id]?.base || ''}
                      onChange={e => updateSalary(emp._id, 'base', e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input className="inp" placeholder="0" value={salaryMap[emp._id]?.deductions || ''}
                      onChange={e => updateSalary(emp._id, 'deductions', e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--success)' }}>
                    {salaryMap[emp._id]?.net || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer" style={{ marginTop: '16px' }}>
          <Button variant="secondary" onClick={() => setShowGenerate(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : `Generate for ${genMonth} ${genYear}`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default HRPayroll;
