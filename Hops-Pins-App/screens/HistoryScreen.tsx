// History Screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TemplateScreen from '../components/TemplateScreen';
import { globalStyles } from '../styles/global';

const HistoryScreen: React.FC = () => {
  return (
    <TemplateScreen title="History">
      <View style={globalStyles.container}>
        <Text style={styles.title}>History Screen - Your past hops pins! 📜</Text>
      </View>
    </TemplateScreen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16 },
});

export default HistoryScreen;
