import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, signOut, profile: ctxProfile, updateProfile, refreshProfile } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setProfile(ctxProfile); }, [ctxProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({
                full_name: profile.full_name || null,
                age: profile.age ? Number(profile.age) : null,
                education: profile.education || null,
                institution: profile.institution || null,
                cf_handle: profile.cf_handle || null,
                bio: profile.bio || null,
            });
            await refreshProfile();
        } catch (err) {
            console.warn('update profile error', err);
        }
        setSaving(false);
        setEditing(false);
    };

    if (!user) {
        return <div className="terminal-panel" style={{ maxWidth: 720, margin: '28px auto', padding: 20 }}>Not signed in.</div>;
    }

    return (
        <div className="terminal-panel" style={{ maxWidth: 720, margin: '28px auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Profile</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={() => signOut()}>Sign Out</button>
                </div>
            </div>

            {!profile ? (
                <div>Loading profile…</div>
            ) : (
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    <label className="input-label">Full name</label>
                    <input className="input-field" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} disabled={!editing} />
                    <label className="input-label">Age</label>
                    <input className="input-field" value={profile.age ?? ''} onChange={(e) => setProfile({ ...profile, age: e.target.value })} disabled={!editing} />
                    <label className="input-label">Education</label>
                    <input className="input-field" value={profile.education || ''} onChange={(e) => setProfile({ ...profile, education: e.target.value })} disabled={!editing} />
                    <label className="input-label">Institution</label>
                    <input className="input-field" value={profile.institution || ''} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} disabled={!editing} />
                    <label className="input-label">CF Handle</label>
                    <input className="input-field" value={profile.cf_handle || ''} onChange={(e) => setProfile({ ...profile, cf_handle: e.target.value })} disabled={!editing} />

                    <div style={{ marginTop: 12 }}>
                        {editing ? (
                            <>
                                <button className="btn-primary-filled" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                                <button className="btn-ghost" onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>Cancel</button>
                            </>
                        ) : (
                            <button className="btn-primary" onClick={() => setEditing(true)}>Edit profile</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
