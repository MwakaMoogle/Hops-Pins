// Profile Screen
import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/global';

const ProfileScreen: React.FC = () => {
    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.text}>This is the Profile Screen</Text>
        </View>
    );
};

export default ProfileScreen;
