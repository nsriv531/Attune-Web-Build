import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ClothingItem = 'hat' | 'cloak' | 'scarf' | 'glasses' | 'crown' | 'wings' | 'aura' | 'glow';
export type ColorVariant = 'default' | 'gold' | 'silver' | 'cosmic' | 'fire' | 'ice' | 'forest' | 'sunset';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ClothingItem;
  price: number; // in virtual currency
  color?: ColorVariant;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Common items (100-300)
  { id: 'hat-basic', name: 'Wizard Hat', description: 'A classic pointed hat', type: 'hat', price: 100, rarity: 'common' },
  { id: 'scarf-basic', name: 'Silk Scarf', description: 'A flowing silk scarf', type: 'scarf', price: 100, rarity: 'common' },
  { id: 'glasses-basic', name: 'Study Glasses', description: 'Enhance your focus look', type: 'glasses', price: 150, rarity: 'common' },
  
  // Rare items (300-800)
  { id: 'cloak-mystic', name: 'Mystic Cloak', description: 'A mysterious flowing cloak', type: 'cloak', price: 300, rarity: 'rare' },
  { id: 'crown-gold', name: 'Golden Crown', description: 'A majestic golden crown', type: 'crown', price: 500, color: 'gold', rarity: 'rare' },
  { id: 'aura-glow', name: 'Soft Glow Aura', description: 'A gentle glowing aura', type: 'aura', price: 400, rarity: 'rare' },
  
  // Epic items (800-2000)
  { id: 'wings-stellar', name: 'Stellar Wings', description: 'Majestic cosmic wings', type: 'wings', price: 1000, color: 'cosmic', rarity: 'epic' },
  { id: 'crown-cosmic', name: 'Cosmic Crown', description: 'A crown that shimmers with starlight', type: 'crown', price: 1200, color: 'cosmic', rarity: 'epic' },
  { id: 'aura-cosmic', name: 'Cosmic Aura', description: 'A swirling galaxy aura', type: 'aura', price: 900, color: 'cosmic', rarity: 'epic' },
  
  // Legendary items (2000+)
  { id: 'wings-legendary', name: 'Ethereal Wings', description: 'Wings that transcend reality', type: 'wings', price: 2500, color: 'fire', rarity: 'legendary' },
  { id: 'crown-eternal', name: 'Eternal Crown', description: 'The ultimate crown of focus mastery', type: 'crown', price: 3000, rarity: 'legendary' },
  { id: 'glow-legendary', name: 'Legendary Glow', description: 'An unparalleled radiant glow', type: 'glow', price: 2800, color: 'sunset', rarity: 'legendary' },
];

const CUSTOMIZATION_STORAGE_KEY = 'attune_avatar_customization_v1';

interface AvatarCustomizationState {
  // Virtual currency
  coins: number;
  
  // Owned items
  ownedItems: string[]; // IDs of shop items
  equippedItems: Partial<Record<ClothingItem, string>>; // itemId for each slot
  
  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean; // returns true if successful
  purchaseItem: (itemId: string) => boolean; // returns true if successful
  equipItem: (type: ClothingItem, itemId: string) => void;
  unequipItem: (type: ClothingItem) => void;
  hasItem: (itemId: string) => boolean;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useAvatarCustomizationStore = create<AvatarCustomizationState>((set, get) => ({
  coins: 500, // Starting currency
  ownedItems: [],
  equippedItems: {},

  addCoins: (amount: number) => {
    set((state) => ({
      coins: state.coins + amount,
    }));
    get().saveToStorage();
  },

  spendCoins: (amount: number) => {
    const state = get();
    if (state.coins < amount) return false;
    set((state) => ({
      coins: state.coins - amount,
    }));
    get().saveToStorage();
    return true;
  },

  purchaseItem: (itemId: string) => {
    const state = get();
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return false;
    if (state.ownedItems.includes(itemId)) return false; // Already own it
    if (!get().spendCoins(item.price)) return false; // Not enough coins
    
    set((state) => ({
      ownedItems: [...state.ownedItems, itemId],
    }));
    get().saveToStorage();
    return true;
  },

  equipItem: (type: ClothingItem, itemId: string) => {
    const state = get();
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || !state.ownedItems.includes(itemId)) return;
    
    set((state) => ({
      equippedItems: {
        ...state.equippedItems,
        [type]: itemId,
      },
    }));
    get().saveToStorage();
  },

  unequipItem: (type: ClothingItem) => {
    set((state) => {
      const newEquipped = { ...state.equippedItems };
      delete newEquipped[type];
      return { equippedItems: newEquipped };
    });
    get().saveToStorage();
  },

  hasItem: (itemId: string) => {
    return get().ownedItems.includes(itemId);
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          coins: parsed.coins ?? 500,
          ownedItems: parsed.ownedItems ?? [],
          equippedItems: parsed.equippedItems ?? {},
        });
      }
    } catch (err) {
      console.error('Failed to load avatar customization:', err);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify({
        coins: state.coins,
        ownedItems: state.ownedItems,
        equippedItems: state.equippedItems,
      }));
    } catch (err) {
      console.error('Failed to save avatar customization:', err);
    }
  },
}));
