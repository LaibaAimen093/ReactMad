// UserContext.js
import React, { createContext, useState } from 'react';

// Create the context
const UserContext = createContext();

// Create the context provider
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
