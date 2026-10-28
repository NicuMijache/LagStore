import axios from 'axios';

type ErrorBody =
  | string
  | string[]
  | { errors?: Record<string, string[]>; title?: string }
  | undefined;

/** Transformă o eroare Axios într-un mesaj afișabil, în română. */
export function getErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'A apărut o eroare neașteptată.';
  if (!err.response) return 'Serverul nu răspunde. Verifică conexiunea.';

  const status = err.response.status;
  const data = err.response.data as ErrorBody;

  if (status === 403) return 'Nu ai permisiunea să efectuezi această acțiune.';
  if (status === 401) return 'Sesiunea a expirat. Te rugăm să te autentifici din nou.';

  if (typeof data === 'string' && data.trim().length > 0) return data;
  if (Array.isArray(data) && data.length > 0) return data.join(' ');

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.errors) {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(' ');
    }
    if (data.title) return data.title;
  }

  return `Eroare ${status}: cererea nu a putut fi procesată.`;
}
