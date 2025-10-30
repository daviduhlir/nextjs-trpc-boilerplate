import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { GlobalStyle } from './global';
import { theme } from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider wraps the entire application with styled-components
 * Provides theme and global styles to all components
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  );
};
