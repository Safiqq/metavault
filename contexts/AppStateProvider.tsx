import { APP_CONSTANTS } from "@/constants/AppConstants";
import { loadState, saveState } from "@/lib/appState";
import { AUTH_NL_STATES, AUTH_STATES, StoreStates } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const defaultState: StoreStates = {
  authState: AUTH_STATES.NOT_LOGGED_IN,
  currentState: AUTH_NL_STATES.IDLE,

  email: "",
  mnemonic: [],

  generatorData: [],

  lastMnemonicVerification: "",
  lastSessionRenewal: "",

  askMnemonicEvery: APP_CONSTANTS.DEFAULT_MNEMONIC_VERIFICATION_INTERVAL,
  sessionTimeout: APP_CONSTANTS.DEFAULT_SESSION_TIMEOUT,
  sessionTimeoutAction: "Lock",
};

interface AppStateContextType {
  state: StoreStates;
  setState: React.Dispatch<React.SetStateAction<StoreStates>>;
  isLoading: boolean;
  resetState: () => void;
  setSignedOutState: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StoreStates>(defaultState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect to load state on app start
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const persistedState = await loadState();
        if (persistedState) {
          setState((prevState) => ({ ...prevState, ...persistedState }));
        }
      } catch (err) {
        console.error("App state load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateState();
  }, []);

  // Effect to save state whenever it changes
  useEffect(() => {
    // Don't save on the initial load/hydration
    if (!isLoading) {
      const saveStateAsync = async () => {
        try {
          await saveState(state);
        } catch (err) {
          console.error("App state save error:", err);
        }
      };

      saveStateAsync();
    }
  }, [state, isLoading]);

  const resetState = useCallback(() => {
    setState(defaultState);
  }, []);

  const setSignedOutState = useCallback(() => {
    setState((prevState) => ({
      authState: AUTH_STATES.NOT_LOGGED_IN,
      currentState: AUTH_NL_STATES.IDLE,
      email: "",
      mnemonic: prevState.mnemonic, // Use prevState
      generatorData: [],
      lastMnemonicVerification: "",
      lastSessionRenewal: "",
      askMnemonicEvery: prevState.askMnemonicEvery, // Use prevState
      sessionTimeout: prevState.sessionTimeout, // Use prevState
      sessionTimeoutAction: prevState.sessionTimeoutAction, // Use prevState
    }));
  }, []);

  const contextValue = useMemo<AppStateContextType>(
    () => ({
      state,
      setState,
      isLoading,
      resetState,
      setSignedOutState,
    }),
    [state, isLoading, resetState, setSignedOutState]
  );

  // Prevent rendering children until hydration is complete
  if (isLoading) {
    // Render a loading spinner or splash screen
    return null;
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};
