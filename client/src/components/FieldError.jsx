// React

// External libraries

// Local files

// Announces one API validation error beside its field.
export function FieldError({ message }) {
  return message ? (
    <p className="field-error" role="alert">
      {message}
    </p>
  ) : null;
}
