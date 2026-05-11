import { apiClient } from '../config/apiClient';
import { BotInstruction, BotInstructionFormData } from '../../pages/bot-message/types';

export const botInstructionService = {
  getInstructions: () => 
    apiClient.get<BotInstruction[]>('/chat/instructions'),
    
  createInstruction: (data: BotInstructionFormData) => 
    apiClient.post<BotInstruction>('/chat/instructions', data),
    
  updateInstruction: (id: string, data: BotInstructionFormData) => 
    apiClient.put<BotInstruction>(`/chat/instructions/${id}`, data),
    
  deleteInstruction: (id: string) => 
    apiClient.delete(`/chat/instructions/${id}`)
};
