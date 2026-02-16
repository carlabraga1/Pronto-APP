// Definição das categorias do app — fonte da verdade.
// O frontend envia isso para o backend via POST /categories/sync.
// Os nomes dos ícones correspondem a componentes do lucide-react-native.

export type CategoryDefinition = {
  name: string;
  icon: string;
  subcategories: { name: string; icon: string }[];
};

export const CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Emergência',
    icon: 'Siren',
    subcategories: [],
  },
  {
    name: 'Casa e manutenção',
    icon: 'House',
    subcategories: [
      { name: 'Pintor', icon: 'Paintbrush' },
      { name: 'Pedreiro', icon: 'BrickWall' },
      { name: 'Gesseiro', icon: 'Layers' },
      { name: 'Vidraceiro', icon: 'PanelTop' },
      { name: 'Jardinagem', icon: 'Flower2' },
      { name: 'Dedetização', icon: 'Bug' },
    ],
  },
  {
    name: 'Tecnologia',
    icon: 'Monitor',
    subcategories: [
      { name: 'Assistência celular', icon: 'Smartphone' },
      { name: 'Conserto de computador', icon: 'Laptop' },
      { name: 'Instalação de internet', icon: 'Wifi' },
    ],
  },
  {
    name: 'Beleza e bem-estar',
    icon: 'Scissors',
    subcategories: [
      { name: 'Manicure/Pedicure', icon: 'Hand' },
      { name: 'Cabeleireiro', icon: 'Scissors' },
      { name: 'Maquiagem', icon: 'Palette' },
      { name: 'Massagem', icon: 'Heart' },
    ],
  },
  {
    name: 'Aulas e educação',
    icon: 'GraduationCap',
    subcategories: [
      { name: 'Reforço escolar', icon: 'BookOpen' },
      { name: 'Inglês particular', icon: 'Languages' },
      { name: 'Música', icon: 'Music' },
      { name: 'Personal trainer', icon: 'Dumbbell' },
    ],
  },
  {
    name: 'Automotivo',
    icon: 'Car',
    subcategories: [
      { name: 'Mecânico', icon: 'Wrench' },
      { name: 'Guincho', icon: 'Truck' },
      { name: 'Lava-jato delivery', icon: 'Droplets' },
      { name: 'Troca de bateria', icon: 'BatteryCharging' },
    ],
  },
  {
    name: 'Eventos',
    icon: 'PartyPopper',
    subcategories: [
      { name: 'Fotógrafo', icon: 'Camera' },
      { name: 'DJ', icon: 'Disc3' },
      { name: 'Buffet', icon: 'UtensilsCrossed' },
      { name: 'Decoração', icon: 'Gift' },
    ],
  },
  {
    name: 'Limpeza',
    icon: 'Sparkles',
    subcategories: [
      { name: 'Faxina residencial', icon: 'Home' },
      { name: 'Limpeza pós-obra', icon: 'Hammer' },
      { name: 'Lavagem de estofados', icon: 'Armchair' },
    ],
  },
];
