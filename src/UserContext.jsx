import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './Firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const userRef = doc(db, 'users', authUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUser({ uid: authUser.uid, ...userSnap.data() });
                }
            } else {
                setUser(null);
            }
            setLoading(false); 
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};
