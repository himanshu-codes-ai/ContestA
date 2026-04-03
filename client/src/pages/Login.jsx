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
        if (data) {
            // sign up succeeded and AuthContext created profile
        }
        navigate('/profile');
    };

    return (
        <div className="auth-fullpage">
            <div className="auth-panel">
                <div className="auth-header">
                    <div className="auth-icon" aria-hidden>
                        {/* simple SVG robot/user icon */}
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" opacity="0.95" />
                            <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor" opacity="0.6" />
                        </svg>
                    </div>
                    <div>
                        <div className="auth-title">CodeBrains</div>
                        <div className="auth-subtitle">Sign in to access your developer dashboard</div>
                    </div>
                </div>

                <div className="auth-tabs">
                    <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</div>
                    <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</div>
                </div>

                {tab === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div className="form-row input-with-icon">
                            <label className="input-label">Email</label>
                            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24"><path d="M2 6v12h20V6L12 13 2 6z"/></svg>
                            </span>
                        </div>

                        <div className="form-row input-with-icon">
                            <label className="input-label">Password</label>
                            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V8a6 6 0 1 0-12 0v2H4v10h16V10h-2z"/></svg>
                            </span>
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-filled">Sign In</button>
                            <div className="form-note">Forgot password? Use your profile page after login.</div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <div className="form-row">
                            <label className="input-label">Full name</label>
                            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                        </div>

                        <div className="form-row">
                            <label className="input-label">Codeforces Handle</label>
                            <input className="input-field" value={cfHandle} onChange={(e) => setCfHandle(e.target.value)} placeholder="cf_handle" />
                        </div>

                        <div className="form-row">
                            <label className="input-label">Email</label>
                            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                        </div>

                        <div className="form-row input-with-icon">
                            <label className="input-label">Password</label>
                            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V8a6 6 0 1 0-12 0v2H4v10h16V10h-2z"/></svg>
                            </span>
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-filled">Create account</button>
                            <div className="form-note">We store your Codeforces handle for quick lookups.</div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
