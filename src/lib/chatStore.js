import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: async (chatId, userId) => {
    try {
      const currentUser = useUserStore.getState().currentUser;
      
      // Fetch user data from Firestore if userId is provided
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      const user = userDoc.data();

      if (user.blocked.includes(currentUser.id)) {
        set({
          chatId,
          user: null,
          isCurrentUserBlocked: true,
          isReceiverBlocked: false,
        });
      } else if (currentUser.blocked.includes(user.id)) {
        set({
          chatId,
          user: null,
          isCurrentUserBlocked: false,
          isReceiverBlocked: true,
        });
      } else {
        set({
          chatId,
          user,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
        });
      }
    } catch (error) {
      console.error('Error changing chat:', error);
      // Handle error (optional)
    }
  },
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
