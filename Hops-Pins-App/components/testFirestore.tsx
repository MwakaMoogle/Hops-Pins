// components/TestFirestore.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { addPub, getPubs, addCheckin } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export const TestFirestore = () => {
  const { user } = useAuth();
  const [pubs, setPubs] = useState<any[]>([]);

  const testAddPub = async () => {
    try {
      await addPub({
        name: 'The Test Pub',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: '123 Test Street, London'
        }
      });
      console.log('Pub added successfully!');
      loadPubs();
    } catch (error) {
      console.error('Error adding pub:', error);
    }
  };

  const testAddCheckin = async () => {
    if (!user || pubs.length === 0) return;
    
    try {
      await addCheckin({
        userId: user.uid,
        pubId: pubs[0].id,
        pubName: pubs[0].name,
        drink: 'Test Beer',
        rating: 5,
        note: 'This is a test checkin!'
      });
      console.log('Checkin added successfully!');
    } catch (error) {
      console.error('Error adding checkin:', error);
    }
  };

  const loadPubs = async () => {
    try {
      const pubsData = await getPubs();
      setPubs(pubsData);
    } catch (error) {
      console.error('Error loading pubs:', error);
    }
  };

  useEffect(() => {
    loadPubs();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Firestore Test</Text>
      <Text>Pubs in database: {pubs.length}</Text>
      
      <Button title="Add Test Pub" onPress={testAddPub} />
      <Button title="Add Test Checkin" onPress={testAddCheckin} />
      <Button title="Reload Pubs" onPress={loadPubs} />
      
      {pubs.map(pub => (
        <Text key={pub.id}>- {pub.name}</Text>
      ))}
    </View>
  );
};