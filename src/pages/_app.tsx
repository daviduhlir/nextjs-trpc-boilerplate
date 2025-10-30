import type { AppType } from 'next/app';
import { trpc } from '@/utils/trpc';

/**
 * App wrapper with tRPC provider
 * Wraps the entire application to enable tRPC hooks
 */
const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);
