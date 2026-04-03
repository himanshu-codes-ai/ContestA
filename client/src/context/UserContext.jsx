import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

const STORAGE_KEY = 'cf_analyzer_handle';

export function UserProvider({ children }) {
    const [handle, setHandleState] = useState(() => {
        try { return localStorage.getItem(STORAGE_KEY) || ''; }
        catch { return ''; }
    });

    // Persist to localStorage whenever handle changes
    useEffect(() => {
        try {
            if (handle) localStorage.setItem(STORAGE_KEY, handle);
            else localStorage.removeItem(STORAGE_KEY);
        } catch { /* ignore */ }
    }, [handle]);

    const setHandle = (h) => setHandleState((h || '').trim());
    const clearHandle = () => setHandleState('');

    return (
        <UserContext.Provider value={{ handle, setHandle, clearHandle }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
    return ctx;
}

export default UserContext;
