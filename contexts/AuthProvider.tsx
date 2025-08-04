import { supabase } from "@/lib/supabase";
import { Session, User, AuthError } from "@supabase/supabase-js";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

/**
 * Represents the shape of the authentication context
 */
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps your app and makes auth state available to any
 * child component that calls `useAuth()`.
 */
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const refreshAttempts = useRef<number>(0);
  const lastRefreshAttempt = useRef<number>(0);

  /**
   * Fetches the current session from Supabase
   */
  const fetchSession = useCallback(async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      // Validate session data
      if (data.session) {
        validateSession(data.session);
      }
      
      setSession(data.session);
    } catch (err) {
      console.error("Failed to fetch session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validates session data structure and expiration
   */
  const validateSession = (session: Session) => {
    if (!session?.access_token || !session.refresh_token) {
      throw new Error("Invalid session data");
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      throw new Error("Session has expired");
    }
  };

  /**
   * Refreshes the current session with rate limiting
   */
  const refreshSession = useCallback(async () => {
    const now = Date.now();
    
    try {
      refreshAttempts.current++;
      lastRefreshAttempt.current = now;
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        throw refreshError;
      }
      
      // Validate the refreshed session
      if (data.session) {
        validateSession(data.session);
      }
      
      setSession(data.session);
      return data.session;
    } catch (err) {
      console.error("Failed to refresh session");
      throw err; // Re-throw to allow error handling by the caller
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSession]);

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading,
    refreshSession,
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(
    () => value,
    [
      session,
      isLoading,
      refreshSession,
    ]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access the auth context
 * @returns The auth context containing session, user, and auth methods
 * @throws {Error} If used outside of an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
