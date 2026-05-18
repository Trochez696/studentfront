import { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

type Subject = {
  id: number;
  nombre: string;
};

type Enrollment = {
  id: number;
};

type User = {
  id: number;
  nombre: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }

    const load = async () => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('No se pudieron cargar las materias');
        }
        const data = await response.json();
        setSubjects(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }

      if (user?.role === 'ESTUDIANTE') {
        try {
          const response = await fetch(`${API_URL}/enrollments/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            throw new Error('No se pudieron cargar las inscripciones');
          }
          const data = await response.json();
          setEnrollments(data);
        } catch {
          setEnrollments([]);
        }
      }
    };

    void load();
  }, [token, user?.role]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Inicio</Text>
            <Text style={styles.subtitle}>Resumen rápido de tu cuenta y materias.</Text>
          </View>
          <View style={styles.logoutButton}>
            <Button title="Cerrar sesión" onPress={() => { logout(); router.replace('/'); }} />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu rol</Text>
          <Text style={styles.cardValue}>{user?.role ?? 'No definido'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Materias disponibles</Text>
          <Text style={styles.cardValue}>{subjects.length}</Text>
        </View>

        {user?.role === 'ESTUDIANTE' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inscripciones activas</Text>
            <Text style={styles.cardValue}>{enrollments.length}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button title="Ir a materias" onPress={() => router.push('/materias')} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Mi perfil" onPress={() => router.push('/perfil')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  content: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#13294b',
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    marginTop: 6,
  },
  logoutButton: {
    width: 130,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 8,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginRight: 10,
  },
  error: {
    color: '#b00020',
    marginBottom: 16,
  },
});
