import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js"

export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'NETWORK_ERROR'
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: ErrorCode
  override readonly cause?: unknown

  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
  }
}

interface SupabaseLikeError {
  code?: string
  status?: number
  message?: string
}

export function toAppError(error: unknown, fallbackMessage = 'Une erreur inattendue est survenue.'): AppError {
  if (error instanceof AppError) {
    return error
  }

  // HTTP errors
  if (error instanceof FunctionsHttpError) {
    const status = error.context.status

    if (status === 404) {
      return new AppError('NOT_FOUND', fallbackMessage, error)
    }
    if (status === 401) {
      return new AppError('UNAUTHORIZED', 'Votre session a expiré. Veuillez vous reconnecter.', error)
    }
    if (status === 403) {
      return new AppError('FORBIDDEN', 'Vous n\'avez pas les droits pour cette action.', error)
    }
    if (status === 400) {
      return new AppError('UNKNOWN', fallbackMessage, error)
    }
  }

  // Network errors
  if (
    error instanceof FunctionsFetchError ||
    error instanceof FunctionsRelayError ||
    (error instanceof TypeError && !navigator.onLine) 
  ) {
    return new AppError(
      'NETWORK_ERROR',
      'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
      error,
    )
  }

  // PostgREST errors or Supabase Auth errors
  if (typeof error === 'object' && error != null) {
    const sbError = error as SupabaseLikeError

    if (sbError.code === 'PGRST116' || sbError.status === 404) {
      return new AppError('NOT_FOUND', fallbackMessage, error)
    }
    if (sbError.code === 'PGRST301' || sbError.status === 401) {
      return new AppError('UNAUTHORIZED', 'Votre session a expiré. Veuillez vous reconnecter.', error)
    }
    if (sbError.code === '42501' || sbError.status === 403) {
      return new AppError('FORBIDDEN', 'Vous n\'avez pas les droits pour cette action.', error)
    }
  }

  return new AppError('UNKNOWN', fallbackMessage, error)
}

export function getErrorMessage(error: unknown, fallbackMessage = 'Une erreur inattendue est survenue.'): string {
  return toAppError(error, fallbackMessage).message
}