import { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

type User = {
  id: number;
  nombre: string;
  email: string;
  role: string;
};

type Subject = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  docente?: User;
};

type Enrollment = {
  id: number;
  subjectId: number;
  studentId: number;
};

type Student = {
  id: number;
  nombre: string;
  email: string;
};

export default function MateriasScreen() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380; // responsive para pantallas chicas

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [subjectStudents, setSubjectStudents] = useState<Record<number, Student[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar lista de materias desde el backend
  const fetchSubjects = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Cargar inscripciones solo para estudiantes
  const fetchEnrollments = async () => {
    if (!token || user?.role !== 'ESTUDIANTE') return;
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
  };

  // Cargar docentes para el admin
  const fetchTeachers = async () => {
    if (!token || user?.role !== 'ADMIN') return;
    try {
      const response = await fetch(`${API_URL}/users?role=DOCENTE`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('No se pudieron cargar los docentes');
      }
      const data = await response.json();
      setTeachers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Cargar materias asignadas al docente
  const fetchAssignedSubjects = async () => {
    if (!token || user?.role !== 'DOCENTE') return;
    try {
      const response = await fetch(`${API_URL}/subjects/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('No se pudieron cargar las materias asignadas');
      }
      const data = await response.json();
      setAssignedSubjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchSubjectStudents = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/enrollments/subject/${id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('No se pudieron cargar los estudiantes de la materia');
      }
      const data = await response.json();
      setSubjectStudents((prev) => ({ ...prev, [id]: data }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchSubjects();
    if (user?.role === 'ESTUDIANTE') fetchEnrollments();
    if (user?.role === 'ADMIN') fetchTeachers();
    if (user?.role === 'DOCENTE') fetchAssignedSubjects();
  }, [token, user?.role]);

  // Enviar solicitud para inscribirse en una materia
  const handleEnroll = async () => {
    if (!token || !subjectId) return;
    setError(null);
    setLoading(true);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subjectId: Number(subjectId) }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo inscribir');
      }
      await fetchEnrollments();
      setSubjectId('');
      setSuccessMessage('Inscripción realizada correctamente');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo docente (solo admin)
  const createTeacher = async () => {
    if (!token || !newTeacherName || !newTeacherEmail || !newTeacherPassword) return;
    setError(null);
    setLoading(true);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: newTeacherName,
          email: newTeacherEmail,
          password: newTeacherPassword,
          role: 'DOCENTE',
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo crear el docente');
      }
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherPassword('');
      setSuccessMessage('Docente creado correctamente');
      fetchTeachers();
      fetchSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear una materia nueva (solo admin)
  const createSubject = async () => {
    if (!token || !newSubjectName || !newSubjectCode) return;
    setError(null);
    setLoading(true);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: newSubjectName,
          codigo: newSubjectCode,
          descripcion: newSubjectDescription,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo crear la materia');
      }
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectDescription('');
      setSuccessMessage('Materia creada correctamente');
      fetchSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Asignar un docente a una materia (solo admin)
  const assignTeacher = async () => {
    if (!token || !assignSubjectId || !assignTeacherId) return;
    setError(null);
    setLoading(true);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_URL}/subjects/${assignSubjectId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ docenteId: Number(assignTeacherId) }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo asignar el docente');
      }
      setAssignSubjectId('');
      setAssignTeacherId('');
      setSuccessMessage('Docente asignado correctamente');
      fetchSubjects();
      fetchAssignedSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token, mostrar mensaje simple y no renderizar el resto
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Inicia sesión primero</Text>
        <Text style={styles.subtitle}>Usa la pantalla de inicio para conectarte al backend.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleRow}>
              <Ionicons name="book-outline" size={24} color="#2563eb" />
              <Text style={[styles.title, isCompact && styles.titleSmall]}>Materias</Text>
            </View>
            <Text style={styles.subtitle}>Administra tu carga y revisa tus asignaciones.</Text>
          </View>
          <View style={styles.logoutButton}>
            <Button title="Cerrar sesión" onPress={() => { logout(); router.replace('/'); }} color="#d32f2f" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <MaterialIcons name="menu-book" size={20} color="#1d4ed8" />
            <Text style={styles.statsNumber}>{subjects.length}</Text>
            <Text style={styles.statsLabel}>Materias</Text>
          </View>
          {user?.role === 'ESTUDIANTE' ? (
            <View style={styles.statsCard}>
              <MaterialIcons name="check-circle" size={20} color="#059669" />
              <Text style={styles.statsNumber}>{enrollments.length}</Text>
              <Text style={styles.statsLabel}>Inscripciones</Text>
            </View>
          ) : null}
          {user?.role === 'DOCENTE' ? (
            <View style={styles.statsCard}>
              <MaterialIcons name="assignment-ind" size={20} color="#ea580c" />
              <Text style={styles.statsNumber}>{assignedSubjects.length}</Text>
              <Text style={styles.statsLabel}>Asignadas</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionSection}>
          <Button title="Actualizar materias" onPress={fetchSubjects} disabled={loading} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.subjectCard, isCompact && styles.subjectCardCompact]}>
              <View style={styles.subjectHeader}>
                <Ionicons name="school-outline" size={20} color="#2563eb" />
                <Text style={styles.subjectName}>{item.nombre}</Text>
              </View>
              <Text style={styles.subjectCode}>{item.codigo}</Text>
              <Text style={styles.subjectDescription}>{item.descripcion}</Text>
              <Text style={styles.subjectMeta}>
                {item.docente ? `Docente: ${item.docente.nombre}` : 'Docente no asignado'}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.subtitle}>No hay materias para mostrar.</Text>}
        />

        {user?.role === 'ESTUDIANTE' ? (
          <View style={styles.enrollCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="person-circle-outline" size={20} color="#0f766e" />
              <Text style={styles.sectionTitle}>Acciones de estudiante</Text>
            </View>
            <Text style={styles.label}>Inscribir materia</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={subjectId}
                onValueChange={(value: string | number) => setSubjectId(String(value))}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona una materia" value="" />
                {subjects.map((subject) => (
                  <Picker.Item
                    key={subject.id}
                    label={`${subject.nombre} (${subject.codigo})`}
                    value={subject.id}
                  />
                ))}
              </Picker>
            </View>
            <Button title={loading ? 'Inscribiendo...' : 'Inscribir'} onPress={handleEnroll} disabled={loading || !subjectId} />
            <Text style={styles.label}>Mis inscripciones</Text>
            {enrollments.length === 0 ? (
              <Text style={styles.subtitle}>No tienes inscripciones.</Text>
            ) : (
              enrollments.map((enrollment) => (
                <Text key={enrollment.id} style={styles.enrollmentItem}>
                  Inscripción {enrollment.id} - Materia {enrollment.subjectId}
                </Text>
              ))
            )}
          </View>
        ) : null}

        {user?.role === 'DOCENTE' ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="person-outline" size={20} color="#be123c" />
              <Text style={styles.sectionTitle}>Acciones de docente</Text>
            </View>
            {assignedSubjects.length === 0 ? (
              <Text style={styles.subtitle}>No tienes materias asignadas.</Text>
            ) : (
              assignedSubjects.map((subject) => (
                <View key={subject.id} style={styles.subjectCard}>
                  <Text style={styles.subjectName}>{subject.nombre}</Text>
                  <Text style={styles.subjectDescription}>{subject.descripcion}</Text>
                  <View style={styles.buttonRow}>
                    <Button title="Ver estudiantes" onPress={() => fetchSubjectStudents(subject.id)} />
                  </View>
                  {subjectStudents[subject.id]?.map((student) => (
                    <Text key={student.id} style={styles.enrollmentItem}>
                      {student.nombre} ({student.email})
                    </Text>
                  ))}
                </View>
              ))
            )}
          </View>
        ) : null}

        {user?.role === 'ADMIN' ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="settings-outline" size={20} color="#a21caf" />
              <Text style={styles.sectionTitle}>Panel de administrador</Text>
            </View>
            <Text style={styles.label}>Crear docente</Text>
            <TextInput
              style={styles.input}
              value={newTeacherName}
              onChangeText={setNewTeacherName}
              placeholder="Nombre del docente"
            />
            <TextInput
              style={styles.input}
              value={newTeacherEmail}
              onChangeText={setNewTeacherEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email del docente"
            />
            <TextInput
              style={styles.input}
              value={newTeacherPassword}
              onChangeText={setNewTeacherPassword}
              secureTextEntry
              placeholder="Contraseña"
            />
            <Button title={loading ? 'Creando...' : 'Crear docente'} onPress={createTeacher} disabled={loading} />

            <Text style={[styles.label, styles.topSpacing]}>Crear materia</Text>
            <TextInput
              style={styles.input}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              placeholder="Nombre de la materia"
            />
            <TextInput
              style={styles.input}
              value={newSubjectCode}
              onChangeText={setNewSubjectCode}
              placeholder="Código de la materia"
            />
            <TextInput
              style={styles.input}
              value={newSubjectDescription}
              onChangeText={setNewSubjectDescription}
              placeholder="Descripción de la materia (opcional)"
            />
            <Button title={loading ? 'Creando...' : 'Crear materia'} onPress={createSubject} disabled={loading} />

            <Text style={[styles.label, styles.topSpacing]}>Asignar docente</Text>
            <Text style={styles.pickerLabel}>Materia</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={assignSubjectId}
                onValueChange={(value: string | number) => setAssignSubjectId(String(value))}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona una materia" value="" />
                {subjects.map((subject) => (
                  <Picker.Item
                    key={subject.id}
                    label={`${subject.nombre} (${subject.codigo})`}
                    value={subject.id}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.pickerLabel}>Docente</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={assignTeacherId}
                onValueChange={(value: string | number) => setAssignTeacherId(String(value))}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un docente" value="" />
                {teachers.map((teacher) => (
                  <Picker.Item
                    key={teacher.id}
                    label={`${teacher.nombre} (${teacher.email})`}
                    value={teacher.id}
                  />
                ))}
              </Picker>
            </View>
            <Button title={loading ? 'Asignando...' : 'Asignar docente'} onPress={assignTeacher} disabled={loading || !assignSubjectId || !assignTeacherId} />
            <Text style={[styles.label, styles.topSpacing]}>Docentes registrados</Text>
            {teachers.length === 0 ? (
              <Text style={styles.subtitle}>No hay docentes registrados.</Text>
            ) : (
              teachers.map((teacher) => (
                <Text key={teacher.id} style={styles.enrollmentItem}>
                  {teacher.id} - {teacher.nombre} ({teacher.email})
                </Text>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  titleSmall: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 14,
    color: '#4b5563',
  },
  list: {
    marginTop: 10,
    marginBottom: 20,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  subjectCardCompact: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoutButton: {
    width: 130,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1f2937',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
  },
  subjectCode: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    marginTop: 6,
    color: '#475569',
    lineHeight: 20,
  },
  subjectMeta: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
  },
  enrollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  buttonRow: {
    marginTop: 10,
  },
  pickerLabel: {
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  error: {
    color: '#b00020',
    marginVertical: 10,
  },
  success: {
    color: '#1b5e20',
    marginVertical: 10,
  },
  enrollmentItem: {
    marginTop: 8,
    color: '#334155',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  statsLabel: {
    marginTop: 6,
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  actionSection: {
    marginBottom: 16,
  },
  topSpacing: {
    marginTop: 16,
  },
});
