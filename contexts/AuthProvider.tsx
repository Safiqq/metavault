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

// Rate limiting configuration
const RATE_LIMIT = {
  REFRESH_WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REFRESH_ATTEMPTS: 5,
};

/**
 * Represents the shape of the authentication context
 */
interface AuthContextType {
  /** Current session object if authenticated, null otherwise */
  session: Session | null;
  /** Current user object if authenticated, null otherwise */
  user: User | null;
  /** Whether the auth state is being loaded */
  isLoading: boolean;
  /** Any error that occurred during auth operations */
  error: string | null;
  /** 
   * Refreshes the current session
   * @returns A promise that resolves with the new session or null if refresh fails
   */
  refreshSession: () => Promise<Session | null>;
  /** Function to clear any auth errors */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAuthState: AuthContextType = {
  session: null,
  user: null,
  isLoading: true,
  error: null,
  refreshSession: async () => null, // Return null to match Promise<Session | null>
  clearError: () => {},
};

/**
 * Provider component that wraps your app and makes auth state available to any
 * child component that calls `useAuth()`.
 */
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const refreshAttempts = useRef<number>(0);
  const lastRefreshAttempt = useRef<number>(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches the current session from Supabase
   */
  const fetchSession = useCallback(async () => {
    try {
      setError(null);
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
      const errorMessage = getErrorMessage(err, "Failed to fetch session");
      setError(errorMessage);
      console.error("Session fetch error:", err);
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
   * Extracts a user-friendly error message from various error types
   */
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error instanceof Error) {
      return error.message || defaultMessage;
    }
    if (typeof error === 'string') {
      return error;
    }
    return defaultMessage;
  };

  /**
   * Refreshes the current session with rate limiting
   */
  const refreshSession = useCallback(async () => {
    const now = Date.now();
    
    // Reset rate limit counter if window has passed
    if (now - lastRefreshAttempt.current > RATE_LIMIT.REFRESH_WINDOW_MS) {
      refreshAttempts.current = 0;
    }
    
    // Check rate limit
    if (refreshAttempts.current >= RATE_LIMIT.MAX_REFRESH_ATTEMPTS) {
      setError("Too many requests. Please try again later.");
      throw new Error("Too many requests. Please try again later.");
    }
    
    try {
      refreshAttempts.current++;
      lastRefreshAttempt.current = now;
      
      setError(null);
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
      const errorMessage = getErrorMessage(err, "Failed to refresh session");
      setError(errorMessage);
      console.error("Session refresh error:", err);
      throw err; // Re-throw to allow error handling by the caller
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setError(null);
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
    error,
    refreshSession,
    clearError,
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(
    () => value,
    [
      session,
      isLoading,
      error,
      refreshSession,
      clearError,
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
