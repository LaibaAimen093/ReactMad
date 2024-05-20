import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function PlaylistDetailsScreen({ route, navigation }) {
  const { playlistId, userId } = route.params;
  const [playlistName, setPlaylistName] = useState('');
  const [userBooks, setUserBooks] = useState([]);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const db = getFirestore();
        const playlistDocRef = doc(collection(db, 'users', userId, 'playlists'), playlistId);
        const playlistDocSnapshot = await getDoc(playlistDocRef);
        const playlistData = playlistDocSnapshot.data();
        if (playlistData) {
          setPlaylistName(playlistData.name);
          const booksQuerySnapshot = await getDocs(collection(playlistDocRef, 'books'));
          const booksData = booksQuerySnapshot.docs.map(doc => doc.data());
          setUserBooks(booksData);
        }
      } catch (error) {
        console.error('Error fetching playlist details:', error);
        alert('Error fetching playlist details. Please try again later.');
      }
    };

    fetchPlaylistDetails();
  }, [playlistId, userId]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.coverUrl }} style={styles.image} resizeMode="cover" />
      <Text>Title: {item.title}</Text>
      <Text>Author: {item.author}</Text>
      {/* Add more details of the book here if needed */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.playlistName}>{playlistName}</Text>
      <FlatList
        data={userBooks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  playlistName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  image: {
    width: 90,
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
});
