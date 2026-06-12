import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const statusVariant = (s) => {
  if (s === 'present') return 'success';
  if (s === 'wfh') return 'info';
  if (s === 'on_leave') return 'warning';
  return 'danger';
};

const statusLabel = (s, isLate) => {
  if (s === 'present' && isLate) return 'Late';
  if (s === 'present') return 'Present';
  if (s === 'wfh') return 'WFH';
  if (s === 'on_leave') return 'On Leave';
  return 'Absent';
};

const statusVariantFromLabel = (label) => {
  if (label === 'Present') return 'success';
  if (label === 'WFH') return 'info';
  if (label === 'Late') return 'warning';
  if (label === 'On Leave') return 'warning';
  return 'danger';
};

const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return {
    start: monday.toISOString().split('T')[0],
    end: friday.toISOString().split('T')[0],
  };
};

const HRAttendance = () => {
  const [view, setView] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (view === 'daily') fetchDailyAttendance();
    else fetchWeeklyAttendance();
  }, [date, view]);

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/attendance?date=${date}`);
      setRecords(data);
    } catch (err) {
      addToast('Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyAttendance = async () => {
    try {
      setLoading(true);
      const { start, end } = getWeekRange();
      const { data } = await api.get(`/api/attendance?startDate=${start}&endDate=${end}`);

      // Group by employee, then by date
      const byEmployee = {};
      (data || []).forEach(r => {
        const empId = r.employee?._id;
        if (!empId) return;
        if (!byEmployee[empId]) byEmployee[empId] = { employee: r.employee, days: {} };
        byEmployee[empId].days[r.date] = r;
      });

      // Build 5-day grid
      const days = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(d.toISOString().split('T')[0]);
      }

      const rows = Object.values(byEmployee).map(emp => ({
        employee: emp.employee,
        days: days.map(d => emp.days[d] || null),
        presentCount: days.filter(d => emp.days[d]?.status === 'present' || emp.days[d]?.status === 'wfh').length,
        lateCount: days.filter(d => emp.days[d]?.isLate).length,
      }));

      setWeeklyData({ rows, days });
    } catch (err) {
      addToast('Failed to load weekly attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDay = (dateStr) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="view active" id="view-hr-attendance">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Attendance</div>
          <div className="section-sub">
            {view === 'daily'
              ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'This week'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '3px' }}>
            {['daily', 'weekly'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '5px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', background: view === v ? 'var(--bg)' : 'transparent',
                  color: view === v ? 'var(--brand)' : 'var(--text2)',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>
                {v === 'daily' ? 'Daily' : 'Weekly'}
              </button>
            ))}
          </div>
          {view === 'daily' && (
            <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          )}
        </div>
      </div>

      {/* Summary chips */}
      {view === 'daily' && !loading && records.length > 0 && (() => {
        const present = records.filter(r => r.status === 'present' && !r.isLate).length;
        const late = records.filter(r => r.isLate).length;
        const wfh = records.filter(r => r.status === 'wfh').length;
        const absent = records.filter(r => r.status === 'absent').length;
        return (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: `${present} Present`, color: 'var(--success-bg)', text: 'var(--success-text)' },
              { label: `${late} Late`, color: 'var(--warning-bg)', text: 'var(--warning-text)' },
              { label: `${wfh} WFH`, color: 'var(--info-bg)', text: 'var(--info-text)' },
              { label: `${absent} Absent`, color: 'var(--danger-bg)', text: 'var(--danger-text)' },
            ].map(chip => (
              <div key={chip.label} style={{ padding: '5px 14px', borderRadius: '20px', background: chip.color, color: chip.text, fontSize: '12px', fontWeight: 600 }}>
                {chip.label}
              </div>
            ))}
          </div>
        );
      })()}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}><i className="fas fa-circle-notch fa-spin"></i></div>
        ) : view === 'daily' ? (
          records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No records for this date</div>
          ) : (
            <table className="task-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => {
                  const label = statusLabel(record.status, record.isLate);
                  return (
                    <tr key={record._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar
                            initials={record.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            bg={record.employee?.avatar?.bg}
                            color={record.employee?.avatar?.color}
                            size="sm"
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{record.employee?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{record.employee?.department}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{record.loginTime || '—'}</td>
                      <td style={{ fontSize: '13px' }}>{record.logoutTime || '—'}</td>
                      <td style={{ fontSize: '13px' }}>{record.hoursWorked || '—'}</td>
                      <td><Badge variant={statusVariantFromLabel(label)}>{label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          // Weekly view
          !weeklyData.rows || weeklyData.rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No records for this week</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="task-table" style={{ width: '100%', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    {weeklyData.days.map(d => <th key={d}>{formatDay(d)}</th>)}
                    <th>Present</th>
                    <th>Late</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.rows.map(row => (
                    <tr key={row.employee._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar initials={row.employee.avatar?.initials} bg={row.employee.avatar?.bg} color={row.employee.avatar?.color} size="sm" />
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>{row.employee.name}</span>
                        </div>
                      </td>
                      {row.days.map((rec, i) => (
                        <td key={i} style={{ textAlign: 'center' }}>
                          {rec ? (
                            <Badge variant={statusVariant(rec.status)} style={{ fontSize: '10px' }}>
                              {statusLabel(rec.status, rec.isLate)}
                            </Badge>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>—</span>
                          )}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success)' }}>{row.presentCount}/5</td>
                      <td style={{ textAlign: 'center', fontWeight: row.lateCount > 0 ? 700 : 400, color: row.lateCount > 0 ? 'var(--warning)' : 'var(--text3)' }}>
                        {row.lateCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HRAttendance;
