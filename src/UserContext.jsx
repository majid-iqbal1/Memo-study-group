import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase'; // Adjust this path if firebase is elsewhere
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

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
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
