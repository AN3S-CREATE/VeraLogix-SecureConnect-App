import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  Text,
  Button,
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Door = { id: string; name: string; state: string };

/**
 * Optional resident mobile scaffold — uses DEV auth bypass against a local API.
 * Replace with Keycloak / BFF cookie bridge before any production build.
 */
export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [doors, setDoors] = useState<Door[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginDev = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/dev-session`, {
        method: 'POST',
        headers: { 'x-dev-bypass': '1' },
      });
      if (!res.ok) throw new Error(`dev-session ${res.status}`);
      const body = (await res.json()) as { accessToken: string };
      setToken(body.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }, []);

  const loadDoors = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/doors?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(token === 'dev-bypass' ? { 'x-dev-bypass': '1' } : {}),
        },
      });
      if (!res.ok) throw new Error(`doors ${res.status}`);
      const body = (await res.json()) as { data: Door[] };
      setDoors(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setBusy(false);
    }
  }, [token]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <Text style={styles.title}>SecureConnect Mobile</Text>
      <Text style={styles.sub}>Optional Expo scaffold · {API_URL}</Text>
      <View style={styles.row}>
        <Button title="Dev session" onPress={() => void loginDev()} />
        <Button title="List doors" onPress={() => void loadDoors()} disabled={!token} />
      </View>
      {busy ? <ActivityIndicator color="#B6FF2E" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={doors}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.name} · {item.state}
          </Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#373435', padding: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 24 },
  sub: { color: '#A8CF45', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  error: { color: '#f87171', marginBottom: 8 },
  item: { color: '#e5e5e5', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#555' },
});
