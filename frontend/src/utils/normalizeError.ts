/**
 * normalizeError — maps any failure into a standardized AppError.
 *
 * Every error that reaches the UI must be an AppError { message, status }.
 * Raw server responses, stack traces, and Axios internals must never be shown
 * to users (Req 24.1, 24.2).
 *
 * Status codes:
 *   0   — network failure / offline
 *   4xx — mapped to user-friendly copy where known
 *   5xx — generic server error message
 *   other — fallback
 */
import type { AppError } from '@/types'

/** Shape of the backend's Detail error body (`{ detail: string }`). */
interface DetailBody {
  detail?: string
  message?: string
}

/** Friendly messages for well-known HTTP status codes. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "The request couldn't be completed. Please check your input and try again.",
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that.",
  404: 'The requested item could not be found.',
  409: 'This action is not allowed in the current state.',
  422: 'Some of the provided data is invalid.',
  429: "You're doing that too fast. Please wait a moment and try again.",
  500: 'Something went wrong on our end. Please try again.',
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again later.',
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_MESSAGE =
  'No internet connection. Please check your network and try again.'

/** Returns true for plain objects (JSON response bodies). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Extracts a detail message from a backend Detail body if present.
 * Never returns a raw technical message — only content suitable for display.
 */
function extractDetailMessage(data: unknown): string | null {
  if (!isPlainObject(data)) return null
  const body = data as DetailBody
  const raw = body.detail ?? body.message
  if (typeof raw === 'string' && raw.length > 0 && raw.length < 300) {
    return raw
  }
  return null
}

/**
 * Checks whether the value looks like an Axios error (duck-typed to avoid
 * importing axios here, which would create a circular dependency risk).
 */
function isAxiosError(
  error: unknown,
): error is { isAxiosError: true; response?: { status: number; data: unknown }; request?: unknown; message?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Record<string, unknown>).isAxiosError === true
  )
}

export function normalizeError(error: unknown): AppError {
  // --- Axios error with a server response ---
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response

    // Use friendly copy for 409 unless the backend provides a specific message.
    // For 4xx, prefer the backend's detail if it is concise and display-safe.
    const detailMessage = extractDetailMessage(data)
    const friendlyMessage =
      detailMessage ?? STATUS_MESSAGES[status] ?? FALLBACK_MESSAGE

    return { message: friendlyMessage, status }
  }

  // --- Axios error with no response (network/offline) ---
  if (isAxiosError(error) && error.request) {
    return { message: NETWORK_MESSAGE, status: 0 }
  }

  // --- Axios error before the request was sent ---
  if (isAxiosError(error)) {
    return { message: FALLBACK_MESSAGE, status: 0 }
  }

  // --- Native Error objects (e.g. thrown by guards or utilities) ---
  if (error instanceof Error) {
    // Never expose the raw error message as it may contain technical details.
    return { message: FALLBACK_MESSAGE, status: 0 }
  }

  // --- Unknown / unexpected throw ---
  return { message: FALLBACK_MESSAGE, status: 0 }
}
