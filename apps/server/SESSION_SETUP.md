# Session Setup Notes

## Session Table

The session table is automatically created by `connect-pg-simple` when the server starts, as configured in `main.ts` with `createTableIfMissing: true`.

The table schema follows the standard `connect-pg-simple` format:
- `sid` (primary key)
- `sess` (JSONB)
- `expire` (timestamp)

No manual migration is required.

## Environment Variables

Add to your `.env` file:
```
SESSION_SECRET=your-strong-secret-key-here
SESSION_MAX_AGE=604800000  # 7 days in milliseconds (optional)
SESSION_SAME_SITE=lax  # or 'strict' or 'none' (optional)
```

## Security Notes

1. Use a strong, random `SESSION_SECRET` in production
2. In production, set `secure: true` in cookie settings (requires HTTPS)
3. Ensure CORS is properly configured with `credentials: true`

