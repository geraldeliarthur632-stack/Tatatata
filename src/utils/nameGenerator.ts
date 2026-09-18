const ADJECTIVES = [
  'Focado',
  'Curioso',
  'Gênio',
  'Mestre',
  'Estudioso',
  'Brilhante',
  'Perspicaz',
  'Ágil',
  'Dedicado',
  'Sábio',
  'Veloz',
  'Criativo',
  'Campeão',
  'Super',
  'Notável',
];

const NOUNS = [
  'Aluno',
  'Estudante',
  'Cientista',
  'Explorador',
  'Leitor',
  'Gamer',
  'Astronauta',
  'Detetive',
  'Pensador',
  'Guerreiro',
  'Coruja',
  'Águia',
  'Raposa',
  'Leão',
  'Falcão',
];

export function generateUniqueNames(count: number = 4): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    names.add(`${noun} ${adj} ${num}`);
  }
  return Array.from(names);
}
