import { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

const API_URL = 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const { token, user, error, login, logout } = useAuth();
  const [email, setEmail] = useState('admin@uni.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace('/dashboard');
    }
  }, [token]);

  const handleLogin = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setRegisterSuccess(null);
    setLocalError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: registerName, email: registerEmail, password: registerPassword }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'No se pudo crear la cuenta');
      }
      setRegisterSuccess('Cuenta creada. Inicia sesión con tus credenciales.');
      setShowRegister(false);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Accede con tu usuario o crea una cuenta para probar.</Text>

      {token && user ? (
        <View style={styles.card}>
          <Text style={styles.label}>Conectado como:</Text>
          <Text style={styles.value}>{user.nombre}</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.value}>Rol: {user.role}</Text>
          <View style={styles.buttonRow}>
            <Button title="Cerrar sesión" onPress={() => { logout(); router.replace('/'); }} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          {showRegister ? (
            <>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={registerName}
                onChangeText={setRegisterName}
                placeholder="Nombre completo"
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="usuario@correo.com"
              />
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
                placeholder="Mínimo 6 caracteres"
              />
              <View style={styles.buttonRow}>
                <Button title={loading ? 'Registrando...' : 'Registrarse'} onPress={handleRegister} disabled={loading} />
              </View>
              <View style={styles.buttonRow}>
                <Button title="Volver al inicio" onPress={() => setShowRegister(false)} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="admin@uni.com"
              />
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="admin123"
              />
              <View style={styles.buttonRow}>
                <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={handleLogin} disabled={loading} />
              </View>
              <View style={styles.buttonRow}>
                <Button title="Crear cuenta de estudiante" onPress={() => setShowRegister(true)} />
              </View>
            </>
          )}
          {localError ? <Text style={styles.error}>{localError}</Text> : null}
          {registerSuccess ? <Text style={styles.success}>{registerSuccess}</Text> : null}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Crea una cuenta como estudiante para probar inscripciones.</Text>
        <Text style={styles.infoText}>Admin: admin@uni.com / admin123</Text>
        <Text style={styles.infoText}>Docente: usa una cuenta con rol DOCENTE para ver asignaciones.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4b5563',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttonRow: {
    marginTop: 10,
  },
  error: {
    color: '#b00020',
    marginTop: 8,
  },
  success: {
    color: '#1b5e20',
    marginTop: 8,
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#eef5ff',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
});
