export function env(key: string): string | undefined {
  return (import.meta as { env?: Record<string, string | undefined> }).env?.[key];
}
