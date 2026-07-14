// Custom error class for handling API errors
export class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = [],
    stack?: string,
  ) {
    // Call the parent Error constructor
    super(message);

    // Initialize error properties
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    // Use the provided stack trace if available
    if (stack) {
      this.stack = stack;
    } else {
      // Capture the current stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}