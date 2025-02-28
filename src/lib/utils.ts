export function calculateTimeInDays(dataEntrada: Date, ativo: boolean): number {
  if (!ativo) return 0;
  const hoje = new Date();
  const diffMs = hoje.getTime() - new Date(dataEntrada).getTime();
  return Math.floor(diffMs / (1000 * 3600 * 24));
}