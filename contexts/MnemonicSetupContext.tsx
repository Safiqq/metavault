import { createContext, useContext, useState, ReactNode } from 'react';

interface MnemonicSetupContextType {
  mnemonic: string[];
  setMnemonic: (mnemonic: string[]) => void;
  clearMnemonic: () => void;
}

const MnemonicSetupContext = createContext<MnemonicSetupContextType | null>(null);

export function MnemonicSetupProvider({ children }: { children: ReactNode }) {
  const [mnemonic, setMnemonicState] = useState<string[]>([]);

  const setMnemonic = (newMnemonic: string[]) => {
    setMnemonicState(newMnemonic);
  };

  const clearMnemonic = () => {
    setMnemonicState([]);
  };

  return (
    <MnemonicSetupContext.Provider value={{ mnemonic, setMnemonic, clearMnemonic }}>
      {children}
    </MnemonicSetupContext.Provider> 
  );
}

export function useMnemonicSetup() {
  const context = useContext(MnemonicSetupContext);
  if (!context) {
    throw new Error('useMnemonicSetup must be used within MnemonicSetupProvider');
  }
  return context;
}