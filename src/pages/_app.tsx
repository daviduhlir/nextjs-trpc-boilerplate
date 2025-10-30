import type { AppType } from 'next/app';
import { trpc } from '@/utils/trpc';
import { ThemeProvider } from '@/styles/ThemeProvider';

/**
 * App wrapper with tRPC and styled-components providers
 * Wraps the entire application to enable:
 * - tRPC hooks and context
 * - Styled-components theme and global styles
 */
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
