import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useAvatarCustomizationStore, type ClothingItem } from '@/backend/stores/avatarCustomizationStore';
import * as Haptics from 'expo-haptics';

export function useShopService() {
  const { isSignedIn } = useAuth();
  const purchaseMutation = useMutation(api.users.purchaseAvatarItem);
  const equipMutation = useMutation(api.users.equipAvatarItem);
  const unequipMutation = useMutation(api.users.unequipAvatarItem);

  const purchaseItem = async (itemId: string, price: number) => {
    const store = useAvatarCustomizationStore.getState();

    if (isSignedIn) {
      try {
        await purchaseMutation({ itemId, price });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Convex automatically updates the query state!
        return { success: true };
      } catch (error) {
        console.error('Failed to purchase item:', error);
        return { success: false, error };
      }
    } else {
      const result = store.purchaseItem(itemId);
      if (result) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return { success: result };
    }
  };

  const equipItem = async (type: ClothingItem, itemId: string) => {
    const store = useAvatarCustomizationStore.getState();

    if (isSignedIn) {
      try {
        await equipMutation({ type, itemId });
        Haptics.selectionAsync();
        return { success: true };
      } catch (error) {
        console.error('Failed to equip item:', error);
        return { success: false, error };
      }
    } else {
      store.equipItem(type, itemId);
      Haptics.selectionAsync();
      return { success: true };
    }
  };

  const unequipItem = async (type: ClothingItem) => {
    const store = useAvatarCustomizationStore.getState();

    if (isSignedIn) {
      try {
        await unequipMutation({ type });
        Haptics.selectionAsync();
        return { success: true };
      } catch (error) {
        console.error('Failed to unequip item:', error);
        return { success: false, error };
      }
    } else {
      store.unequipItem(type);
      Haptics.selectionAsync();
      return { success: true };
    }
  };

  return {
    purchaseItem,
    equipItem,
    unequipItem,
  };
}
