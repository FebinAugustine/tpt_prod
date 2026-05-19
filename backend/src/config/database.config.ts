import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const options: Record<string, any> = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 30000,
  };

  const useTls = process.env.MONGODB_TLS === 'true';
  if (useTls) {
    options.tls = true;
    options.tlsAllowInvalidCertificates =
      process.env.MONGODB_TLS_SKIP_VERIFY === 'true';
  }

  return {
    uri: process.env.MONGODB_URI,
    options,
  };
});
