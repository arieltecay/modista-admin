export interface IPeriod {
  inicio: string;
  fin: string;
}

export interface IContacto {
  email: string;
  nota: string;
}

export interface ITariffMetadata {
  titulo: string;
  organizacion: string;
  periodo: IPeriod;
  descripcion: string;
  nota_precios: string;
  nota_adicional: string;
  moneda: string;
  ultimaActualizacion?: string;
  version?: string;
  notas?: string[];
}

export interface Tariff {
  _id: string;
  type: string;
  periodIdentifier: string;
  startDate: string;
  status: 'active' | 'inactive';
  metadata: ITariffMetadata;
  content: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailableTariffMeta {
  _id: string;
  type: string;
  title: string;
  status: 'active' | 'inactive';
  periodIdentifier: string;
  periodDescription?: string;
  startDate: string;
}

export type TariffFormData = Omit<Tariff, '_id' | 'createdAt' | 'updatedAt'>;
