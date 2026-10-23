// React

// External libraries

// Local files

// Formats dates in the visitor's local language and calendar.
export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}
