export interface BotInstruction {
  _id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BotInstructionFormData {
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}
