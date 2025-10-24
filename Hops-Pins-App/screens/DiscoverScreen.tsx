// Discover Screen Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TemplateScreen from '../components/TemplateScreen';
import { globalStyles } from '../styles/global';

const DiscoverScreen: React.FC = () => {
  return (
    <TemplateScreen title="Discover">
      <View style={globalStyles.container}>
        <Text style={styles.title}>Discover Screen - Explore new hops pins! 🔍</Text>
      </View>
    </TemplateScreen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16 },
});

export default DiscoverScreen;