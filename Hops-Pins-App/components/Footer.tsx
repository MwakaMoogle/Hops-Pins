import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/global';

const Footer: React.FC = () => (
  <View style={[globalStyles.footer, styles.container]}>
    <Text style={styles.text}>© Hops Pins</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { height: 48, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#666' },
});

export default Footer;