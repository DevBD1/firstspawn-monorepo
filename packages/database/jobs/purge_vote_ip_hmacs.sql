UPDATE votes
SET ip_hmac = NULL
WHERE ip_hmac IS NOT NULL
  AND created_at < now() - interval '48 hours';
