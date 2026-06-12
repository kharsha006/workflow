import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const progColor = (p) =>
  p === 100 ? 'var(--success)' : p >= 50 ? 'var(--info)' : p > 0 ? 'var(--warning)' : 'var(--text3)';

const statusVariant = (s) =>
  s === 'Completed' ? 'success' : s === 'Blocked' ? 'danger' : 'info';

const EMPTY = { task: '', hours: '', status: 'In Progress', progress: 0, notes: '' };

const DailyStatusEntry = () => {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchTodayLog(); }, []);

  // Auto-set progress to 100 when status is Completed
  useEffect(() => {
    if (form.status === 'Completed') setForm(f => ({ ...f, progress: 100 }));
  }, [form.status]);

  const fetchTodayLog = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/daily-status/my-status?date=${today}`);
      setLog(data.length ? data[0] : null);
    } catch {
      addToast("Failed to load today's status log", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.task.trim()) { addToast('Task description is required', 'error'); return; }

    try {
      setSubmitting(true);
      await api.post('/api/daily-status', {
        date: today,
        taskUpdate: {
          task: form.task,
          hoursSpent: Number(form.hours) || 0,
          status: form.status,
          progress: Number(form.progress),
          notes: form.notes,
        },
      });
      addToast('Task logged successfully', 'success');
      setForm(EMPTY);
      fetchTodayLog();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  const isLocked = log?.isLocked;
  const tasks = log?.tasks || [];
  const totalHours = tasks.reduce((s, t) => s + (t.hoursSpent || 0), 0);
  const avgProg = tasks.length ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / tasks.length) : 0;

  return (
    <div className="view active" id="view-daily-status">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Daily Status Log</div>
          <div className="section-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        {isLocked
          ? <Badge variant="warning"><i className="fas fa-lock"></i> Locked at 6:00 PM</Badge>
          : <Badge variant="success"><i className="fas fa-lock-open"></i> Open until 6:00 PM</Badge>}
      </div>

      {/* Summary stats if there are entries */}
      {tasks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Tasks logged', value: tasks.length, color: 'var(--brand)' },
            { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: 'var(--success)' },
            { label: 'Hours logged', value: `${totalHours}h`, color: 'var(--info)' },
            { label: 'Avg progress', value: `${avgProg}%`, color: progColor(avgProg) },
          ].map(s => (
            <div key={s.label} className="emp-stat">
              <div className="emp-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="emp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col">
        {/* Log a task form */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Log a Task</div>
          </div>

          {isLocked ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--warning)', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #F59E0B' }}>
              <i className="fas fa-clock" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
              <p style={{ margin: 0 }}>Today's log was locked at 6:00 PM.</p>
              <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text2)', margin: '6px 0 0' }}>A new log opens tomorrow.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task description *</label>
                <textarea className="inp" rows="2" placeholder="What did you work on?" value={form.task}
                  onChange={e => setForm({ ...form, task: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hours spent</label>
                  <input className="inp" type="number" min="0" max="24" step="0.5" placeholder="e.g. 2.5" value={form.hours}
                    onChange={e => setForm({ ...form, hours: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Progress
                  <span style={{ fontWeight: 700, color: progColor(Number(form.progress)) }}>{form.progress}%</span>
                </label>
                <input type="range" min="0" max="100" step="5" value={form.progress}
                  onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: progColor(Number(form.progress)) }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / blockers <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                <input className="inp" placeholder="Any blockers or context…" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              <Button type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Saving…' : 'Add to Log'}
              </Button>
            </form>
          )}
        </div>

        {/* Today's entries */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Today's Entries</div>
            <Badge variant="neutral">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                No tasks logged yet
              </div>
            ) : tasks.map((task, idx) => {
              const pc = progColor(task.progress || 0);
              return (
                <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 500, fontSize: '13px', flex: 1, marginRight: '8px' }}>{task.task}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {task.hoursSpent > 0 && `${task.hoursSpent}h · `}{task.updated}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Progress</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: pc }}>{task.progress || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: '5px' }}>
                      <div className="progress-fill" style={{ width: `${task.progress || 0}%`, background: pc }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                    {task.notes && (
                      <span style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatusEntry;
