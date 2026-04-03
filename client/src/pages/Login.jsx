import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [education, setEducation] = useState('');
    const [institution, setInstitution] = useState('');
    const [cfHandle, setCfHandle] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        const { data, error } = await signIn({ email, password });
        if (error) setError(error.message);
        else navigate('/profile');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        const { data, error } = await signUp({ email, password, profileData: { full_name: fullName, age: age ? parseInt(age,10) : null, education, institution, cf_handle: cfHandle } });
        if (error) {
            setError(error.message);
            return;
        }
        navigate('/profile');
    };

    return (
        <div className="auth-fullpage">
            <div className="auth-panel">
                <div className="auth-header">
                    <div className="auth-icon" aria-hidden>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div>
                        <div className="auth-title">CF Analyzer</div>
                        <div className="auth-subtitle">Sign in to access your analytics dashboard</div>
                    </div>
                </div>

                <div className="auth-tabs">
                    <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</div>
                    <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</div>
                </div>

                {tab === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Email</label>
                            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                        </div>

                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Password</label>
                            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-filled" style={{ flex: 1, justifyContent: 'center' }}>Sign In</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Full name</label>
                            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                        </div>

                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Codeforces Handle</label>
                            <input className="input-field" value={cfHandle} onChange={(e) => setCfHandle(e.target.value)} placeholder="cf_handle" />
                        </div>

                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Email</label>
                            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                        </div>

                        <div className="form-row">
                            <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>Password</label>
                            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-filled" style={{ flex: 1, justifyContent: 'center' }}>Create account</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
