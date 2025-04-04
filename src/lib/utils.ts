export function calculateTimeInDays(dataEntrada: Date, ativo: boolean): number {
  if (!ativo) return 0;
  const hoje = new Date();
  const diffMs = hoje.getTime() - new Date(dataEntrada).getTime();
  // Retorna a diferença em dias com casas decimais.
  return diffMs / (1000 * 3600 * 24);
  // Opcional: para limitar a 2 casas decimais, use:
  // return parseFloat((diffMs / (1000 * 3600 * 24)).toFixed(2));
}

export function formatDuration(entryDate: string): string {
  const entry = new Date(entryDate);
  const now = new Date();
  const diffMs = now.getTime() - entry.getTime();
  const tempoEmDias = diffMs / (1000 * 60 * 60 * 24);

  if (tempoEmDias < 1 / 24) {
    const minutes = Math.round(tempoEmDias * 24 * 60);
    return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else if (tempoEmDias < 1) {
    const hours = Math.round(tempoEmDias * 24);
    return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  } else if (tempoEmDias < 7) {
    const days = Math.round(tempoEmDias);
    return `há ${days} dia${days !== 1 ? 's' : ''}`;
  } else if (tempoEmDias < 30) {
    const weeks = Math.floor(tempoEmDias / 7);
    return `há ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  } else if (tempoEmDias < 365) {
    const months = Math.floor(tempoEmDias / 30);
    return `há ${months} mês${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(tempoEmDias / 365);
    return `há ${years} ano${years !== 1 ? 's' : ''}`;
  }
}

