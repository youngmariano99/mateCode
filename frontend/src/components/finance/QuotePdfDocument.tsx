import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 40 },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#4F46E5', paddingBottom: 10 },
  title: { fontSize: 24, color: '#1E293B', fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 5 },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 8 },
  itemTitle: { fontSize: 12, color: '#334155' },
  itemPrice: { fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  totalBox: { marginTop: 20, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 4, alignItems: 'flex-end' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' }
});

export const QuotePdfDocument = ({ profileName, items, total }: { profileName: string, items: any[], total: number }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Propuesta Técnica y Comercial</Text>
        <Text style={styles.subtitle}>Emitido por: {profileName}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 10, color: '#475569' }}>Alcance del Proyecto a Implementar:</Text>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
             <Text style={styles.itemTitle}>{item.translatedName}</Text>
             <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalBox}>
         <Text style={styles.totalText}>Inversión Total: ${total}</Text>
      </View>
    </Page>
  </Document>
);
