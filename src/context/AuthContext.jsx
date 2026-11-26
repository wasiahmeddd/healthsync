import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, resetToSeedData } from '../api';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: "USR-REC-01",
  name: "Anita Desai",
  email: "reception@bmsce.edu",
  role: "HOSPITAL",
  hospitalId: "HOSP-02",
  hospitalName: "BMSCE Healthcare & Research",
  title: "Front Desk Administrator",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('medilink_auth_user');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [demoPersonas, setDemoPersonas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.getDemoPersonas().then(setDemoPersonas);
  }, []);

  const loginWithPersona = (persona) => {
    let authUser = null;
    if (persona.role === 'PATIENT') {
      authUser = {
        id: "USR-PAT-01",
        name: persona.name,
        email: persona.email,
        role: "PATIENT",
        patientId: persona.id,
        avatar: persona.avatar
      };
    } else if (persona.role === 'DOCTOR') {
      authUser = {
        id: persona.id === "DOC-04" ? "USR-DOC-04" : "USR-DOC-01",
        name: persona.name,
        email: persona.email,
        role: "DOCTOR",
        doctorId: persona.id,
        hospitalId: persona.id === "DOC-04" ? "HOSP-02" : "HOSP-01",
        hospitalName: persona.id === "DOC-04" ? "BMSCE Healthcare & Research" : "Apollo Multispeciality Hospital",
        specialization: persona.title,
        avatar: persona.avatar
      };
    } else if (persona.role === 'HOSPITAL') {
      authUser = {
        id: "USR-REC-01",
        name: persona.name,
        email: persona.email,
        role: "HOSPITAL",
        hospitalId: "HOSP-02",
        hospitalName: "BMSCE Healthcare & Research",
        title: "Front Desk Administrator",
        avatar: persona.avatar
      };
    } else if (persona.role === 'PHARMACIST') {
      authUser = {
        id: "USR-PHARM-01",
        name: persona.name,
        email: persona.email,
        role: "PHARMACIST",
        pharmacistId: "PHARM-01",
        hospitalId: "HOSP-01",
        hospitalName: "Apollo Main Pharmacy",
        counter: "Counter 1 - FastTrack",
        avatar: persona.avatar
      };
    }

    if (authUser) {
      setUser(authUser);
      localStorage.setItem('medilink_auth_user', JSON.stringify(authUser));
    }
    return authUser;
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password, role);
      setUser(res.user);
      localStorage.setItem('medilink_auth_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medilink_auth_user');
  };

  const resetAllData = () => {
    resetToSeedData();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        demoPersonas,
        login,
        loginWithPersona,
        logout,
        resetAllData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
