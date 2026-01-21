export const MASSAGENS_CATALOGO = [
  { value: "MACA", label: "Maca", duracaoMin: 60, valor: 120.0 },
  { value: "RAPIDA", label: "Rápida", duracaoMin: 30, valor: 70.0 },
  { value: "REFLEXOLOGIA", label: "Reflexologia", duracaoMin: 45, valor: 95.0 },
  { value: "FLEX", label: "Flex", duracaoMin: 60, valor: 140.0 },
];

export function findMassagem(tipo) {
  return MASSAGENS_CATALOGO.find((m) => m.value === tipo) || null;
}