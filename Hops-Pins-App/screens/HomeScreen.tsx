import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TemplateScreen from '../components/TemplateScreen';
import { globalStyles } from '../styles/global';

const HomeScreen: React.FC = () => {
  return (
  <TemplateScreen showHeader={false} showFooter={false}>
      <View style={globalStyles.container}>
        <Text style={styles.title}>Home Screen - Welcome to Hops Pins! 🍻</Text>
      </View>
    </TemplateScreen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16 },
});

export default HomeScreen;