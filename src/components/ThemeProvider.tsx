import { useTheme } from "@/hooks/useTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // This hook applies theme settings automatically via useEffect
  useTheme();
  
  return <>{children}</>;
};

export default ThemeProvider;
