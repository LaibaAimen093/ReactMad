import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator,Image } from 'react-native';
import { getFirestore, collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import UserContext from './UserContext';
import { Audio } from 'expo-av';

export default function ProgressScreen({ navigation }) {
    const [audiobooksWithProgress, setAudiobooksWithProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    const { userId } = useContext(UserContext);

    const fetchPlaylistId = async (playlistName, userId) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userId);
            const playlistsCollectionRef = collection(userDocRef, 'playlists');

            const playlistQuery = query(playlistsCollectionRef, where('name', '==', playlistName));
            const playlistQuerySnapshot = await getDocs(playlistQuery);

            if (!playlistQuerySnapshot.empty) {
                return playlistQuerySnapshot.docs[0].id;
            } else {
                console.log('Playlist not found.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching playlist ID:', error);
            alert('Error fetching playlist ID. Please try again later.');
            return null;
        }
    };

    const getAudioDuration = async (audioUri) => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
            const status = await sound.getStatusAsync();
            const durationMillis = status.durationMillis;
            const durationSeconds = durationMillis / 1000;
            return durationSeconds;
        } catch (error) {
            console.error('Error getting audio duration:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchCurrentlyListeningPlaylist = async () => {
            try {
                const db = getFirestore();
                const playlistId = await fetchPlaylistId('Currently Listening', userId);

                if (playlistId) {
                    const playlistDocRef = doc(collection(db, 'users', userId, 'playlists'), playlistId);
                    const playlistDocSnapshot = await getDoc(playlistDocRef);
                    const playlistData = playlistDocSnapshot.data();

                    if (playlistData) {
                        const booksQuerySnapshot = await getDocs(collection(playlistDocRef, 'books'));
                        const booksData = booksQuerySnapshot.docs.map(doc => doc.data());

                        const audiobooks = booksData || [];
                        const audiobooksWithProgress = await Promise.all(
                            audiobooks.map(async (audiobook) => {
                                const progressDocRef = doc(db, `users/${userId}/audiobookProgress`, `${audiobook.title}_${audiobook.author}`);
                                const progressDocSnapshot = await getDoc(progressDocRef);
                                const progressData = progressDocSnapshot.data();

                                const duration = await getAudioDuration(audiobook.audioUrl);
                                const progressPercentage = progressData ? (progressData.position / duration) * 100 : 0;

                                return { ...audiobook, progressPercentage };
                            })
                        );
                        setAudiobooksWithProgress(audiobooksWithProgress);
                    }
                }
            } catch (error) {
                console.error('Error fetching progress data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentlyListeningPlaylist();
    }, [userId]);

    const renderItem = ({ item }) => {
        if (!item || item.progressPercentage === undefined) {
            return null;
        }

        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.progressText}>Progress: {item.progressPercentage.toFixed(2)}%</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${item.progressPercentage}%` }]} />
                </View>
            </View>
        );
    };

    const CustomLoader = () => (
        <View style={styles.loaderContainer}>
          <Image source={require('./assets/loader2.gif')} style={styles.loaderImage} />
        </View>
      );
    
      if (loading) {
        return (
          <CustomLoader />
        );
      }

    return (
        <View style={styles.container}>
            {/* {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={audiobooksWithProgress}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )} */}
            <FlatList
                    data={audiobooksWithProgress}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      marginTop:50,
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    itemContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    progressText: {
        fontSize: 16,
        color: '#666',
    },
    itemContent: {
        flex: 1,
        marginRight: 8,
    },
    progressBar: {
        height: 8,
        width: '50%',
        backgroundColor: '#ddd',
        borderRadius: 4,
        marginTop: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#673987',
        borderRadius: 4,
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
      }
});
