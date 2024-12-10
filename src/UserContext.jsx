/*****************************************************************************
*                   React Context for User Management                        *
******************************************************************************
*                                                                            *
* Purpose: Provide a central user context for managing authenticated         *
*          user data and state across the application.                       *
*                                                                            *
* Created: November 2024                                                     *
* Updated: December 2024                                                               *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich                                    *
*                                                                            *
* Features:                                                                  *
*   - User authentication state tracking                                     *
*   - Retrieval of user data from Firestore                                  *
*   - React Context API for user data access                                 *
*   - Hooks for working with user context                                    *
*                                                                            *
*****************************************************************************/

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
