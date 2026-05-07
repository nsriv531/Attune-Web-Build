import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, Colors, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAvatarCustomizationStore, SHOP_ITEMS, type ShopItem } from '@/stores/avatarCustomizationStore';

const RARITY_COLORS = {
  common: { bg: '#e8e8e8', text: '#4b5563', border: '#b0b0b0' },
  rare: { bg: '#4a90e2', text: '#ffffff', border: '#2e5cc4' },
  epic: { bg: '#9b59b6', text: '#ffffff', border: '#7d3fa3' },
  legendary: { bg: '#f39c12', text: '#ffffff', border: '#d68910' },
};

function RarityBadge({ rarity }: { rarity: ShopItem['rarity'] }) {
  const colors = RARITY_COLORS[rarity];
  return (
    <View style={[styles.rarityBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.rarityText, { color: colors.text }]}>
        {rarity.toUpperCase()}
      </Text>
    </View>
  );
}

function CoinIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={Colors.amber} strokeWidth={2} />
      <Path d="M12 8v8M10 10h4" stroke={Colors.amber} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

interface AvatarCustomizationShopProps {
  visible: boolean;
  onClose: () => void;
}

export function AvatarCustomizationShop({ visible, onClose }: AvatarCustomizationShopProps) {
  const C = useThemeColors();
  const { coins, ownedItems, purchaseItem, hasItem, equippedItems, equipItem, unequipItem } = useAvatarCustomizationStore();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [justPurchased, setJustPurchased] = useState<string | null>(null);

  const handlePurchase = (item: ShopItem) => {
    if (hasItem(item.id)) {
      Alert.alert('Already Owned', 'You already own this item!');
      return;
    }

    if (coins < item.price) {
      Alert.alert('Insufficient Coins', `You need ${item.price - coins} more coins to purchase this.`);
      return;
    }

    if (purchaseItem(item.id)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setJustPurchased(item.id);
      setTimeout(() => setJustPurchased(null), 2000);
      Alert.alert('Success!', `You purchased ${item.name}!`);
    }
  };

  const handleEquip = (item: ShopItem) => {
    const isEquipped = equippedItems[item.type] === item.id;
    if (isEquipped) {
      unequipItem(item.type);
      Haptics.selectionAsync();
    } else {
      equipItem(item.type, item.id);
      Haptics.selectionAsync();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: C.purple }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: C.textPrimary }]}>Avatar Shop</Text>
          <View style={styles.coinDisplay}>
            <CoinIcon size={18} />
            <Text style={[styles.coinText, { color: C.amber }]}>{coins}</Text>
          </View>
        </View>

        {/* Shop Items */}
        <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
          {SHOP_ITEMS.map((item) => {
            const owned = hasItem(item.id);
            const equipped = equippedItems[item.type] === item.id;
            const isPurchaseHighlight = justPurchased === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.shopCard,
                  {
                    backgroundColor: C.bgCard,
                    borderColor: equipped ? C.purple : isPurchaseHighlight ? C.green : C.border,
                    borderWidth: equipped || isPurchaseHighlight ? 2 : 0.5,
                  },
                ]}
                onPress={() => setSelectedItem(item)}
              >
                {/* Item header */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleSection}>
                    <Text style={[styles.itemName, { color: C.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.itemType, { color: C.textTertiary }]}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                  <RarityBadge rarity={item.rarity} />
                </View>

                {/* Description */}
                <Text style={[styles.description, { color: C.textSecondary }]}>
                  {item.description}
                </Text>

                {/* Actions */}
                <View style={styles.actions}>
                  {owned ? (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: equipped ? C.purpleDim : C.bgInput,
                          borderColor: equipped ? C.purple : C.border,
                        },
                      ]}
                      onPress={() => handleEquip(item)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          {
                            color: equipped ? C.purple : C.textSecondary,
                            fontWeight: Typography.weight.semibold,
                          },
                        ]}
                      >
                        {equipped ? '✓ EQUIPPED' : 'EQUIP'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.priceRow}>
                      <CoinIcon size={16} />
                      <Text style={[styles.price, { color: C.amber }]}>{item.price}</Text>
                    </View>
                  )}

                  {!owned && (
                    <TouchableOpacity
                      style={[
                        styles.buyButton,
                        {
                          backgroundColor: coins >= item.price ? C.purple : C.bgInput,
                        },
                      ]}
                      onPress={() => handlePurchase(item)}
                      disabled={coins < item.price}
                    >
                      <Text style={[styles.buyButtonText, { color: '#fff' }]}>BUY</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Item Details Modal */}
        {selectedItem && (
          <TouchableOpacity
            style={styles.detailsOverlay}
            onPress={() => setSelectedItem(null)}
          >
            <View
              style={[
                styles.detailsCard,
                { backgroundColor: C.bgCard, borderColor: C.border },
              ]}
            >
              <TouchableOpacity
                style={styles.detailsClose}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={[styles.detailsCloseText, { color: C.textTertiary }]}>×</Text>
              </TouchableOpacity>

              <Text style={[styles.detailsTitle, { color: C.textPrimary }]}>
                {selectedItem.name}
              </Text>
              <RarityBadge rarity={selectedItem.rarity} />
              <Text style={[styles.detailsDesc, { color: C.textSecondary }]}>
                {selectedItem.description}
              </Text>

              {selectedItem.color && (
                <Text style={[styles.detailsColor, { color: C.textTertiary }]}>
                  Color: {selectedItem.color}
                </Text>
              )}

              <Text style={[styles.detailsType, { color: C.textTertiary }]}>
                Type: {selectedItem.type}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    paddingHorizontal: Spacing.base,
  },
  closeText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  coinText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  grid: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  shopCard: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.base,
  },
  titleSection: {
    flex: 1,
    gap: Spacing.xs,
  },
  itemName: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  itemType: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  rarityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  rarityText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  description: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  price: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  buyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  buyButtonText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },

  // Details modal
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  detailsCard: {
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.base,
    maxWidth: 400,
    width: '100%',
  },
  detailsClose: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCloseText: {
    fontSize: 28,
    fontWeight: Typography.weight.semibold,
  },
  detailsTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  detailsDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  detailsColor: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  detailsType: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
});
