import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../lib/firebaseClient';

const AuthContext = createContext();

const hasFirebase = auth && database;

let fbOnAuthStateChanged, fbCreateUser, fbSignIn, fbSignOut, fbUpdateProfile, fbDbRef, fbGet, fbSet, fbUpdate;

if (hasFirebase) {
    import('firebase/auth').then((fa) => {
        fbOnAuthStateChanged = fa.onAuthStateChanged;
        fbCreateUser = fa.createUserWithEmailAndPassword;
        fbSignIn = fa.signInWithEmailAndPassword;
        fbSignOut = fa.signOut;
        fbUpdateProfile = fa.updateProfile;
    });
    import('firebase/database').then((fd) => {
        fbDbRef = fd.ref;
        fbGet = fd.get;
        fbSet = fd.set;
        fbUpdate = fd.update;
    });
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hasFirebase || !fbOnAuthStateChanged) {
            setLoading(false);
            return;
        }
        const unsubscribe = fbOnAuthStateChanged(auth, async (fbUser) => {
            setSession(fbUser ?? null);
            setUser(fbUser ?? null);
            if (fbUser) {
                try {
                    const profileRef = fbDbRef(database, `developer_profiles/${fbUser.uid}`);
                    const snap = await fbGet(profileRef);
                    if (!snap.exists()) {
                        const initial = {
                            id: fbUser.uid,
                            full_name: fbUser.displayName || null,
                            age: null,
                            education: null,
                            institution: null,
                            bio: null,
                            cf_handle: null,
                            created_at: Date.now(),
                            updated_at: Date.now(),
                        };
                        await fbSet(profileRef, initial);
                        setProfile(initial);
                    } else {
                        setProfile({ ...(snap.val()), id: fbUser.uid });
                    }
                } catch (err) {
                    console.warn('firebase ensureProfile error', err);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async ({ email, password, profileData = {} }) => {
        if (!hasFirebase) return { data: null, error: new Error('Firebase not configured') };
        try {
            const cred = await fbCreateUser(auth, email, password);
            const fbUser = cred.user;
            if (profileData.full_name) {
                try { await fbUpdateProfile(fbUser, { displayName: profileData.full_name }); } catch (e) { /* ignore */ }
            }
            try {
                const profileRef = fbDbRef(database, `developer_profiles/${fbUser.uid}`);
                const payload = {
                    id: fbUser.uid,
                    full_name: profileData.full_name || fbUser.displayName || null,
                    age: profileData.age ?? null,
                    education: profileData.education || null,
                    institution: profileData.institution || null,
                    bio: profileData.bio || null,
                    cf_handle: profileData.cf_handle || null,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                };
                await fbSet(profileRef, payload);
                setProfile(payload);
            } catch (err) {
                console.warn('create profile doc error', err);
            }
            return { data: fbUser, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signIn = async ({ email, password }) => {
        if (!hasFirebase) return { data: null, error: new Error('Firebase not configured') };
        try {
            const cred = await fbSignIn(auth, email, password);
            return { data: cred.user, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signOut = async () => {
        if (!hasFirebase) return;
        await fbSignOut(auth);
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (!session) return;
        try {
            const profileRef = fbDbRef(database, `developer_profiles/${session.uid}`);
            const snap = await fbGet(profileRef);
            const p = snap.exists() ? { ...(snap.val()), id: session.uid } : null;
            setProfile(p);
            return p;
        } catch (err) {
            console.warn('refreshProfile error', err);
            setProfile(null);
            return null;
        }
    };

    const updateProfile = async (updates = {}) => {
        if (!session) throw new Error('Not authenticated');
        try {
            const profileRef = fbDbRef(database, `developer_profiles/${session.uid}`);
            const payload = { ...updates, updated_at: Date.now() };
            await fbUpdate(profileRef, payload);
            return await refreshProfile();
        } catch (err) {
            console.warn('updateProfile error', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
