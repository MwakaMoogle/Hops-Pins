import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/global';

type HeaderProps = {
  title?: string;
  right?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ title, right }) => (
    <View style={[globalStyles.header, styles.container]}>
        <Text style={styles.title}>{title}</Text>
        {right && <View style={styles.right}>{right}</View>}
    </View>
);

const styles = StyleSheet.create({
  container: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  right: { marginLeft: 8 },
});

export default Header;