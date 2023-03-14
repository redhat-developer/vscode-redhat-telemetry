export function toErrorMessage(error: any = null, verbose: boolean = false): string {
  if (error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }
  }
  return "An unknown error occurred. Please consult the log for more details.";
}