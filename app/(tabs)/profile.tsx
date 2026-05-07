import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/');
  }, []);

  return <View />;
}
