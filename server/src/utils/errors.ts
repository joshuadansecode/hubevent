export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} non trouvé`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès interdit') {
    super(403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}
