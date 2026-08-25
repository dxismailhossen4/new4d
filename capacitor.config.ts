import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.new4d.admin',
  appName: 'New4D Admin',
  webDir: 'dist/public',
  server: {
    url: 'https://4dinsight-deeeyrxh.manus.space',
    cleartext: false,
    allowNavigation: ['4dinsight-deeeyrxh.manus.space', 'pfyviyhdyjztqvvvibby.supabase.co']
  }
};

export default config;
