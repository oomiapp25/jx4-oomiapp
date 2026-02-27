import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShoppingCart, MessageCircle, Search } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>JX4 PARACOTOS</Text>
        <TouchableOpacity style={styles.iconButton}>
          <ShoppingCart size={24} color="#1c1917" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchBar}>
          <Search size={20} color="#a8a29e" />
          <Text style={styles.searchText}>Buscar productos...</Text>
        </View>

        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Bienvenido a JX4</Text>
          <Text style={styles.heroSubtitle}>Calidad y servicio en Paracotos</Text>
        </MotiView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.card}>
                <View style={styles.imagePlaceholder} />
                <Text style={styles.productTitle}>Producto {i}</Text>
                <Text style={styles.productPrice}>$99.99</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <MessageCircle size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f4',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    margin: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  searchText: {
    color: '#a8a29e',
    fontSize: 14,
  },
  hero: {
    margin: 20,
    padding: 30,
    backgroundColor: '#1c1917',
    borderRadius: 24,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#a8a29e',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  card: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  imagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f4',
    borderRadius: 12,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
