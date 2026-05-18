import { SafeAreaView, StyleSheet, View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth } from '../context/AuthContext';

export default function PerfilPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mi perfil</Text>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.nombre}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.role}</Text>
        <View style={styles.buttonRow}>
          <Button title="Página de inicio" onPress={() => router.push('/dashboard')} />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Cerrar sesión" onPress={() => { logout(); router.replace('/'); }} color="#d32f2f" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f8ff',
  },
  card: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1f2937',
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  buttonRow: {
    marginTop: 16,
  },
});
