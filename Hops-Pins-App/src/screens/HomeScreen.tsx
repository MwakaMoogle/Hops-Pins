import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TemplateScreen from '../components/templateScreen';

const HomeScreen: React.FC = () => {
  return (
    <TemplateScreen title="Hops Pins" showFooter={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen - Welcome to Hops Pins! 🍻</Text>
      </View>
    </TemplateScreen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16 },
});

export default HomeScreen;