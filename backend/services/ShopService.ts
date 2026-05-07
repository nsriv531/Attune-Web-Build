import { api } from '@/convex/_generated/api';
import { useAvatarCustomizationStore, type ClothingItem } from '@/backend/stores/avatarCustomizationStore';
import * as Haptics from 'expo-haptics';

export class ShopService {
  static async purchaseItem(params: {
    itemId: string;
    price: number;
    isSignedIn: boolean;
    purchaseMutation: any;
  }) {
    const { itemId, price, isSignedIn, purchaseMutation } = params;
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
  }

  static async equipItem(params: {
    type: ClothingItem;
    itemId: string;
    isSignedIn: boolean;
    equipMutation: any;
  }) {
    const { type, itemId, isSignedIn, equipMutation } = params;
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
  }

  static async unequipItem(params: {
    type: ClothingItem;
    isSignedIn: boolean;
    unequipMutation: any;
  }) {
    const { type, isSignedIn, unequipMutation } = params;
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
  }
}
