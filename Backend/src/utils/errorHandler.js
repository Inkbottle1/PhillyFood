// backend/src/utils/errorHandler.js
//
// Global Express error-handling middleware.
// Captures all errors passed with next(err) or thrown in async routes
// and sends a consistent JSON response.

export default function errorHandler(err, req, res, next) {
  // If the error object has an explicit HTTP status, use it.
  // Otherwise default to 500 (Internal Server Error).
  const statusCode = err.status || 500;

  // Choose a message safe to send to clients.
  // Prefer a custom message if available; fall back to a generic one.
  const message =
    err.publicMessage || // your own safe, user-friendly text
    err.message ||       // generic error text
    'Internal server error';

  // Log full error details to the server console for debugging.
  // Includes stack trace, which is never sent to the client.
  console.error('ErrorHandler caught:', err);

  // Send a consistent JSON response to the client.
  // The shape { error: "..."} makes it easy for the frontend to display.
  res.status(statusCode).json({
    error: message,
  });
}
