import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import UserContext from './UserContext';

export default function PlaylistScreen({ route, navigation }) {
    const { userId } = useContext(UserContext);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPlaylists = async () => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userId);
            const playlistsCollectionRef = collection(userDocRef, 'playlists');
            const playlistsSnapshot = await getDocs(playlistsCollectionRef);
            const playlistsData = playlistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlaylists(playlistsData);
            console.log("Fetched playlists: ", playlistsData);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            alert('Error fetching playlists. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
      React.useCallback(() => {
          const fetchAndSetPlaylists = async () => {
              setRefreshing(true);
              await fetchPlaylists();
          };
          fetchAndSetPlaylists();
      }, [])
  );

    const navigateToPlaylistDetailsScreen = (playlistId) => {
        navigation.navigate("PlaylistDetailsScreen", { playlistId, userId });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigateToPlaylistDetailsScreen(item.id)}
        >
            <Text style={styles.playlistName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPlaylists();
    };

    const CustomLoader = () => (
        <View style={styles.loaderContainer}>
            <Image source={require('./assets/loader2.gif')} style={styles.loaderImage} />
        </View>
    );

    if (loading && !refreshing) {
        return (
            <CustomLoader />
        );
    }

    return (
        <View style={styles.container}>
            {playlists.length === 0 ? (
                <Text style={styles.noPlaylistsText}>No playlists available</Text>
            ) : (
                <FlatList
                    data={playlists}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#673987']}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        backgroundColor: '#fff',
    },
    itemContainer: {
        flex: 1,
        backgroundColor: '#673987',
        margin: 5,
        borderRadius: 10,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    playlistName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderImage: {
        width: 150,
        height: 150,
        tintColor: '#673987',
    },
    noPlaylistsText: {
        fontWeight: 'bold',
        fontSize: 25,
        color: '#673987',
        textAlign: 'center',
        marginTop: 20,
    },
});
