import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import  Header  from './Header';
import  Footer  from './Footer';

type LayoutProps = {
    children: React.ReactNode;
    title?: string;
    showHeader?: boolean;
    showFooter?: boolean;
    headerRight?: React.ReactNode;
    contentStyle?: object;
};

const Layout: React.FC<LayoutProps> = ({
    children,
    title,
    showHeader = true,
    showFooter = true,
    headerRight,
    contentStyle,
}) => {
    return (
        <SafeAreaView style={styles.container}>
            {showHeader && <Header title={title} right={headerRight} />}
            <View style={[styles.content, contentStyle]}>
                {children}
            </View>
            {showFooter && <Footer />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Layout;
