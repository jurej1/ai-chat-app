import { create } from "zustand";
import { Chat } from "@ai-chat-app/db";

interface SelectedChatState {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat) => void;
  clearSelectedChat: () => void;
}

export const useSelectedChatStore = create<SelectedChatState>((set) => ({
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  clearSelectedChat: () => set({ selectedChat: null }),
}));
