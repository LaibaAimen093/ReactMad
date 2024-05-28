import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import UserContext from './UserContext';
import firebase from './firebase';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';

export default function Player({ route, navigation }) {
    const { audiobooks, currentIndex } = route.params;
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const { userId } = useContext(UserContext);
    const db = getFirestore();

    useEffect(() => {
        const loadProgress = async (userId, audiobookTitle, audiobookAuthor) => {
            try {
                const docRef = doc(collection(db, `users/${userId}/audiobookProgress`), `${audiobookTitle}_${audiobookAuthor}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const progress = docSnap.data();
                    return progress ? progress.position : 0;
                }
                return 0;
            } catch (error) {
                console.error('Error loading progress:', error);
                return 0;
            }
        };

        const loadProgressAndPlay = async () => {
            const lastPosition = await loadProgress(userId, audiobooks[currentIndex].title, audiobooks[currentIndex].author);
            setPosition(lastPosition);
            playSound(audiobooks[currentIndex].audioUrl, lastPosition);
        };

        if (currentIndex !== null && audiobooks.length > 0) {
            loadProgressAndPlay();
        }

        return () => {
            if (sound) {
                saveProgress(userId, audiobooks[currentIndex].title, audiobooks[currentIndex].author, position);
                sound.unloadAsync();
            }
        };
    }, [currentIndex]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async () => {
            if (sound) {
                await saveProgress(userId, audiobooks[currentIndex].title, audiobooks[currentIndex].author, position);
                await sound.pauseAsync();
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
        });

        return unsubscribe;
    }, [navigation, sound, position]);

    const playSound = async (uri, lastPosition) => {
        setLoading(true);
        try {
            if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                    return;
                } else if (status.isLoaded) {
                    await sound.playAsync();
                    setIsPlaying(true);
                    setLoading(false);
                    return;
                }
            }

            const { sound: newSound } = await Audio.Sound.createAsync({ uri });
            setSound(newSound);

            newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

            const initialStatus = {
                shouldPlay: true,
                positionMillis: lastPosition * 1000,
            };

            await newSound.setStatusAsync(initialStatus);
            setIsPlaying(true);
            setLoading(false);
        } catch (error) {
            console.error('Error playing audio:', error);
            setLoading(false);
        }
    };

    const pauseSound = async () => {
        try {
            if (sound) {
                await sound.pauseAsync();
                setIsPlaying(false);
            }
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    };

    const stopSound = async () => {
        try {
            if (sound) {
                await sound.pauseAsync();
                await sound.setPositionAsync(0);
                setIsPlaying(false);
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    };

    const saveProgress = async (userId, audiobookTitle, audiobookAuthor, position) => {
        try {
            const docRef = doc(collection(db, `users/${userId}/audiobookProgress`), `${audiobookTitle}_${audiobookAuthor}`);
            await setDoc(docRef, {
                position,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            console.log('Playback status updated:', status);
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis / 1000);

            if (status.didJustFinish) {
                playNext();
            }
        } else {
            if (status.error) {
                console.error(`Playback error: ${status.error}`);
            }
        }
    };

    const onSliderValueChange = (value) => {
        setPosition(value);
    };

    const onSlidingComplete = async (value) => {
        if (sound) {
            await sound.setPositionAsync(value * 1000);
        }
    };

    const playNext = () => {
        const nextIndex = (currentIndex + 1) % audiobooks.length;
        navigation.replace('Player', { audiobooks, currentIndex: nextIndex });
    };
    
    const playPrevious = () => {
        const prevIndex = (currentIndex - 1 + audiobooks.length) % audiobooks.length;
        navigation.replace('Player', { audiobooks, currentIndex: prevIndex });
    };
    

    const formatTime = (timeInSeconds) => {
        console.log("timeInSeconds",timeInSeconds);
        const hours = Math.floor(timeInSeconds / 3600);
        console.log("hours",hours);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        console.log("minutes",minutes);
        const seconds = Math.floor(timeInSeconds % 60);
        console.log("seconds",seconds);
    
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
    
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (sound && isPlaying) {
                sound.getStatusAsync().then(status => {
                    if (status.isLoaded) {
                        setPosition(status.positionMillis / 1000);
                        setDuration(status.durationMillis / 1000);
                    }
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [sound, isPlaying]);

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
            <>
                <Image source={{ uri: audiobooks[currentIndex].coverUrl }} style={styles.coverImage} />
                <Text style={styles.title}>{audiobooks[currentIndex].title}</Text>
                <Slider
                    style={{ width: '80%' }}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onValueChange={onSliderValueChange}
                    onSlidingComplete={onSlidingComplete}
                    minimumTrackTintColor="#007bff"
                    maximumTrackTintColor="#000000"
                />
                <View style={styles.timeContainer}>
                    <Text>{formatTime(position)}</Text>
                    <Text>{audiobooks[currentIndex].duration !== 0 ? formatTime(audiobooks[currentIndex].duration - position) : '00:00:00'}</Text>
                </View>
                <View style={styles.controlsContainer}>
                    <TouchableOpacity onPress={playPrevious} style={styles.iconButton}>
                        <Image source={require('./assets/previous.png')} style={{
                            width: 30,
                            height: 30,
                            tintColor: '#673987',
                        }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={isPlaying ? pauseSound : () => playSound(audiobooks[currentIndex].audioUrl, position)} style={styles.playButton}>
                        <Image source={isPlaying ? require('./assets/pause.png') : require('./assets/play.png')} style={styles.iconImage} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playNext} style={styles.iconButton}>
                        <Image source={require('./assets/next.png')} style={{
                            width: 30,
                            height: 30,
                            tintColor: '#673987',
                        }} />
                    </TouchableOpacity>
                </View>
            </>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverImage: {
        width: 300,
        height: 300,
        borderRadius: 20,
        marginBottom: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        padding: 15,
        borderRadius: 50,
        marginHorizontal: 10,
    },
    iconButton: {
        padding: 10,
    },
    iconImage: {
        width: 50,
        height: 50,
        tintColor: '#673987',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 10,
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
