import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, RefreshControl  } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, getDocs, query, where, getDoc } from "firebase/firestore";
import UserContext from './UserContext';
import Svg, { Circle } from 'react-native-svg';

export default function ProgressScreen({ navigation }) {
    const [audiobooksWithProgress, setAudiobooksWithProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [audiobooks, setAudiobooks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        const dbFS = getFirestore();
        const unsubscribe = onSnapshot(collection(dbFS, 'audiobooks'), snapshot => {
            const fetchedAudiobooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAudiobooks(fetchedAudiobooks);
            console.log("Fetched audiobooks:", fetchedAudiobooks);
        });

        return unsubscribe;
    }, []);

    const onRefresh = async () => {
      setRefreshing(true);
      await fetchCurrentlyListeningPlaylist();
      setRefreshing(false);
  };

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
            return null;
        }
    };

    const getAudioDuration = async (title, author) => {
        try {
            const matchingAudiobook = audiobooks.find(audiobook => audiobook.title === title && audiobook.author === author);
            console.log("Matching audiobook for title:", title, "and author:", author, "is:", matchingAudiobook);
            if (matchingAudiobook) {
                return matchingAudiobook.duration;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting audio duration:', error);
            return null;
        }
    };

    useEffect(() => {       
        if (userId && audiobooks.length > 0) {
            fetchCurrentlyListeningPlaylist();
        }
    }, [userId, audiobooks]);

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

                  const audiobooksData = booksData || [];
                  console.log("Audiobooks in playlist:", audiobooksData);
                  const audiobooksWithProgress = await Promise.all(
                      audiobooksData.map(async (audiobook) => {
                          const progressDocRef = doc(db, `users/${userId}/audiobookProgress`, `${audiobook.title}_${audiobook.author}`);
                          const progressDocSnapshot = await getDoc(progressDocRef);
                          const progressData = progressDocSnapshot.data();

                          console.log("Audiobook progress data:", progressData);
                          const duration = await getAudioDuration(audiobook.title, audiobook.author);
                          console.log("Duration for audiobook:", duration);
                          const progressPercentage = progressData && duration ? (progressData.position / duration) * 100 : 0;

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

    const renderItem = ({ item }) => {
        if (!item || item.progressPercentage === undefined) {
            return null;
        }

        const radius = 25;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = isFinite(item.progressPercentage) ? circumference * (1 - item.progressPercentage / 100) : 0;

        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.progressText}>Progress: {item.progressPercentage.toFixed(2)}%</Text>
                </View>
                <Svg height={radius * 2} width={radius * 2}>
                    <Circle
                        stroke="#ddd"
                        fill="none"
                        strokeWidth="6"
                        cx={radius}
                        cy={radius}
                        r={radius - 6}
                    />
                    <Circle
                        stroke="#673987"
                        fill="none"
                        strokeWidth="6"
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{ strokeDashoffset }}
                        cx={radius}
                        cy={radius}
                        r={radius - 6}
                    />
                </Svg>
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
            {/* <View>
                <Text style={{ fontSize: 30, marginLeft: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>
                    Progress:
                </Text>
            </View> */}
            <FlatList
                data={audiobooksWithProgress}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={ // Add the RefreshControl component here
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#673987']} // Customize the color of the refresh spinner
                  />
              }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
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
        height: 120,
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
