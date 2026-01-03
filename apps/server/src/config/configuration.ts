export default () => ({
  port: parseInt(process.env.SERVER_PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10), // 7 days in milliseconds
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.SESSION_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10),
    },
  },
});

