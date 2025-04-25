import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthenticationSetupContextType {
  authentication: number[];
  setAuthentication: (authentication: number[]) => void;
  clearAuthentication: () => void;
}

const AuthenticationSetupContext = createContext<AuthenticationSetupContextType | null>(null);

export function AuthenticationSetupProvider({ children }: { children: ReactNode }) {
  const [authentication, setAuthenticationState] = useState<number[]>([]);

  const setAuthentication = (newAuthentication: number[]) => {
    setAuthenticationState(newAuthentication);
  };

  const clearAuthentication = () => {
    setAuthenticationState([]);
  };

  return (
    <AuthenticationSetupContext.Provider value={{ authentication, setAuthentication, clearAuthentication }}>
      {children}
    </AuthenticationSetupContext.Provider> 
  );
}

export function useAuthenticationSetup() {
  const context = useContext(AuthenticationSetupContext);
  if (!context) {
    throw new Error('useAuthenticationSetup must be used within AuthenticationSetupProvider');
  }
  return context;
}