export function calculateTimeInDays(dataEntrada: Date, ativo: boolean): number {
  if (!ativo) return 0;
  const hoje = new Date();
  const diffMs = hoje.getTime() - new Date(dataEntrada).getTime();
  // Retorna a diferença em dias com casas decimais.
  return diffMs / (1000 * 3600 * 24);
  // Opcional: para limitar a 2 casas decimais, use:
  // return parseFloat((diffMs / (1000 * 3600 * 24)).toFixed(2));
}

export function formatDuration(tempoEmDias: number): string {
  // Se o tempo for zero, retornamos "0 dias"
  if (tempoEmDias === 0) return "0 dias";

  // Se for menor que 1 hora (1 dia = 24 horas)
  if (tempoEmDias < 1 / 24) {
    const minutes = Math.round(tempoEmDias * 24 * 60);
    return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  // Se for menor que 1 dia
  else if (tempoEmDias < 1) {
    const hours = Math.round(tempoEmDias * 24);
    return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  // Se for menor que 7 dias
  else if (tempoEmDias < 7) {
    const days = Math.round(tempoEmDias);
    return `há ${days} dia${days !== 1 ? 's' : ''}`;
  }
  // Se for menor que 30 dias, exibe em semanas (aproximadamente)
  else if (tempoEmDias < 30) {
    const weeks = Math.floor(tempoEmDias / 7);
    return `há ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }
  // Se for 30 dias ou mais, exibe em meses (aproximadamente)
  else {
    const months = Math.floor(tempoEmDias / 30);
    return `há ${months} mês${months !== 1 ? 'es' : ''}`;
  }
}