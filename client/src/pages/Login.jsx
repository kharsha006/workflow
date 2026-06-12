import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { roleHome } from '../components/routing/RoleProtected';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();
  
  const initialRole = searchParams.get('role') || localStorage.getItem('wf_last_role') || 'Founding Team';
  const [role] = useState(initialRole);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [panDetails, setPanDetails] = useState('');
  const [aadharCard, setAadharCard] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const getRoleTheme = (r) => {
    switch (r) {
      case 'Founding Team': return { icon: 'fa-crown', label: 'Founding Team' };
      case 'Employee': return { icon: 'fa-user-tie', label: 'Employee' };
      case 'Intern': return { icon: 'fa-graduation-cap', label: 'Intern' };
      case 'HR': return { icon: 'fa-people-group', label: 'HR' };
      default: return { icon: 'fa-user', label: 'User' };
    }
  };

  const theme = getRoleTheme(role);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isResetMode) {
        const data = await resetPassword(email, otp, password);
        setSuccess(data.message || 'Password reset successful. Please log in.');
        setIsForgotMode(false);
        setIsResetMode(false);
        setPassword('');
        setOtp('');
      } else if (isForgotMode) {
        const data = await forgotPassword(email);
        setSuccess(data.message || 'OTP sent to your email.');
        setIsResetMode(true);
      } else if (isRegistering) {
        const data = await register({ name, email, password, role, dateOfBirth, panDetails, aadharCard, mobileNumber });
        setSuccess(data.message || 'Registration successful! Your account is pending HR approval.');
        setIsRegistering(false); // flip back to login mode so they can eventually login
        // clear fields
        setPassword('');
      } else {
        const data = await login(email, password, role);
        navigate(roleHome(data.role));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" id="page-login" style={{ flexDirection: 'column' }}>
      <div className="login-card">
        <div className="login-logo-row">
          <div className="login-logo-icon">W</div>
          <span className="login-logo-text">WorkFlow</span>
        </div>
        
        <div className="role-pill">
          <i className={`fas ${theme.icon}`} style={{ fontSize: '11px' }}></i> 
          <span>{theme.label}</span>
        </div>
        
        <div className="login-title">{isRegistering ? 'Create Account' : isResetMode ? 'Reset Password' : isForgotMode ? 'Forgot Password' : 'Welcome back'}</div>
        <div className="login-subtitle">{isRegistering ? 'Register for a new workspace account' : 'Sign in to access your workspace'}</div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegistering && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input className="inp" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date of Birth</label>
                <input className="inp" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">PAN Details</label>
                  <input className="inp" type="text" placeholder="ABCDE1234F" value={panDetails} onChange={e => setPanDetails(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Aadhar Card</label>
                  <input className="inp" type="text" placeholder="1234 5678 9012" value={aadharCard} onChange={e => setAadharCard(e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mobile Number</label>
                <input className="inp" type="tel" placeholder="+91 9876543210" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isForgotMode && !isResetMode && (
              <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>Enter your email to receive a password reset OTP.</p>
            )}
            
            {isResetMode && (
              <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>Enter the 6-digit OTP sent to your email and your new password.</p>
            )}

            <div className="input-group">
              <label style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Email Address</label>
              <input 
                className="inp"
                type="email" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isResetMode}
              />
            </div>
            
            {isResetMode && (
              <div className="input-group">
                <label>6-Digit OTP</label>
                <input
                  className="inp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            )}

            {(!isForgotMode || isResetMode) && (
              <div className="input-group">
                <label style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>{isResetMode ? 'New Password' : 'Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="inp"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <i 
                    className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text3)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>
            )}

            {(!isRegistering && !isForgotMode) && (
              <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '8px' }}>
                <span 
                  style={{ fontSize: '13px', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setIsForgotMode(true)}
                >
                  Forgot Password?
                </span>
              </div>
            )}
          </div>
          
          {success && (
            <div style={{ display: 'block', marginTop: '4px', padding: '10px 14px', background: '#ECFDF5', color: '#047857', borderRadius: '8px', fontSize: '13px', border: '1px solid #A7F3D0' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i> {success}
            </div>
          )}

          {error && (
            <div className="login-error" style={{ display: 'block', marginTop: '4px' }}>
              <i className="fas fa-triangle-exclamation"></i> {error}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '14px', padding: '12px' }} disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : isResetMode ? 'Reset Password' : isForgotMode ? 'Send OTP' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        {(!isForgotMode && (role === 'Employee' || role === 'Intern')) && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text2)' }}>
            {isRegistering ? (
              <span>Already have an account? <span style={{ color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsRegistering(false)}>Sign in here</span></span>
            ) : (
              <span>Don't have an account? <span style={{ color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsRegistering(true)}>Register</span></span>
            )}
          </div>
        )}

        {isForgotMode && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text2)' }}>
            <span style={{ color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }} onClick={() => {
              setIsForgotMode(false);
              setIsResetMode(false);
              setSuccess('');
              setError('');
            }}>Back to Login</span>
          </div>
        )}

        <p className="login-hint" style={{ marginTop: '8px' }}>
          <Link to="/" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
            <i className="fas fa-arrow-left"></i> Back to role select
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
