import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import UserContext from './UserContext';

export default function SearchScreen({ navigation }) {
    const { userId } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [audiobooks, setAudiobooks] = useState([]);

    const fixedGenres = [
        { id: '1', name: 'Fiction' },
        { id: '2', name: 'Fantasy' },
        { id: '3', name: 'Science Fiction' },
        { id: '4', name: 'Mystery' },
        { id: '5', name: 'Thriller' },
        { id: '6', name: 'Romance' },
    ];

    useEffect(() => {
        fetchBooksAndAudiobooks();
    }, []);

    const fetchPlaylistId = async (playlistName, userId) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userId);
            const playlistsCollectionRef = collection(userDocRef, 'playlists');
            console.log("playlistsCollectionRef",playlistsCollectionRef);
      
            // Query the playlists collection to find the playlist with the specified name
            const playlistQuery = query(playlistsCollectionRef, where('name', '==', playlistName));
            const playlistQuerySnapshot = await getDocs(playlistQuery);
      
            if (!playlistQuerySnapshot.empty) {
                // Playlist with the specified name found, return its ID directly
                return playlistQuerySnapshot.docs[0].id;
            } else {
                // Playlist not found
                console.log('Playlist not found.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching playlist ID:', error);
            alert('Error fetching playlist ID. Please try again later.');
            return null;
        }
      };

    const addToPlaylist = async (bookId, playlistName, userId, bookDetails) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userId);
            const playlistsCollectionRef = collection(userDocRef, 'playlists');
      
            // Check if the playlist already exists
            const playlistQuery = query(playlistsCollectionRef, where('name', '==', playlistName));
            const playlistQuerySnapshot = await getDocs(playlistQuery);
      
            let playlistDocRef;
      
            if (playlistQuerySnapshot.empty) {
                // Playlist doesn't exist, create a new one
                const newPlaylistRef = await addDoc(playlistsCollectionRef, { name: playlistName });
                playlistDocRef = newPlaylistRef;
            } else {
                // Playlist exists, use the first document
                playlistDocRef = playlistQuerySnapshot.docs[0].ref;
            }
      
            // Get a reference to the books collection under the playlist document
            const booksCollectionRef = collection(playlistDocRef, 'books');
      
            // Check if the book already exists in the playlist
            const bookQuery = query(booksCollectionRef, where('title', '==', bookDetails.title), where('author', '==', bookDetails.author));
            const bookQuerySnapshot = await getDocs(bookQuery);
      
            if (bookQuerySnapshot.empty) {
                // Book doesn't exist in the playlist, add it
                const bookDocRef = await addDoc(booksCollectionRef, {
                    title: bookDetails.title,
                    author: bookDetails.author,
                    coverUrl: bookDetails.coverUrl,
                    audioUrl: bookDetails.audioUrl,
                    // Add any other book details here
                });
      
                console.log('Book added to playlist successfully with ID:', bookDocRef.id);
            } else {
                // Book already exists in the playlist
                console.log('Book already exists in the playlist.');
                alert('Book already exists in the playlist.');
            }
      
            const playlistId = await fetchPlaylistId(playlistName, userId);
            console.log("playlistId", playlistId);
        } catch (error) {
            console.error('Error adding book to playlist:', error);
            alert('Error adding book to playlist. Please try again later.');
        }
      };

    const fetchBooksAndAudiobooks = async () => {
        try {
            const db = getFirestore();
            const booksRef = collection(db, 'books');
            const audiobooksRef = collection(db, 'audiobooks');

            const booksSnapshot = await getDocs(booksRef);
            const audiobooksSnapshot = await getDocs(audiobooksRef);

            const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'book' }));
            const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'audiobook' }));

            setBooks(fetchedBooks);
            setAudiobooks(fetchedAudiobooks);
        } catch (error) {
            console.error('Error fetching books and audiobooks:', error);
            alert('Error fetching books and audiobooks. Please try again later.');
        }
    };

    const fetchBooksByQuery = async () => {
        try {
            const db = getFirestore();
            const booksRef = collection(db, 'books');
            const audiobooksRef = collection(db, 'audiobooks');

            const booksSnapshot = await getDocs(booksRef);
            const audiobooksSnapshot = await getDocs(audiobooksRef);

            const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'book' }));
            const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'audiobook' }));

            setBooks(fetchedBooks);
            setAudiobooks(fetchedAudiobooks);

            const filteredBooks = [...fetchedBooks, ...fetchedAudiobooks].filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            console.log("filteredBooks",filteredBooks);
            setBooks(filteredBooks);
        } catch (error) {
            console.error('Error fetching books and audiobooks:', error);
            alert('Error fetching books and audiobooks. Please try again later.');
        }
    };

    const fetchBooksByGenre = async (genre) => {
        try {
            console.log('Fetching books by genre:', genre);
    
            const db = getFirestore();
            const booksRef = collection(db, 'books');
            const audiobooksRef = collection(db, 'audiobooks');
    
            const booksQuery = query(booksRef, where('genres', 'array-contains', genre));
            const audiobooksQuery = query(audiobooksRef, where('genres', 'array-contains', genre));
    
            console.log('Books query:', booksQuery);
            console.log('Audiobooks query:', audiobooksQuery);
    
            const [booksSnapshot, audiobooksSnapshot] = await Promise.all([
                getDocs(booksQuery),
                getDocs(audiobooksQuery)
            ]);
    
            console.log('Books snapshot:', booksSnapshot);
            console.log('Audiobooks snapshot:', audiobooksSnapshot);
    
            const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'book' }));
            const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'audiobook' }));
    
            console.log('Fetched books:', fetchedBooks);
            console.log('Fetched audiobooks:', fetchedAudiobooks);
    
            // Combine books and audiobooks before setting the state
            const combinedItems = [...fetchedBooks, ...fetchedAudiobooks];
            console.log('Combined items:', combinedItems);
    
            setBooks(combinedItems);
        } catch (error) {
            console.error('Error fetching books by genre:', error);
            alert('Error fetching books by genre. Please try again later.');
        }
    };
    
    

    const handleSearch = () => {
        fetchBooksByQuery();
    };

    const handleCategoryPress = (genre) => {
        console.log("genre",genre);
        setSelectedGenre(genre);
        fetchBooksByGenre(genre);
    };
    
    const clearGenreFilter = () => {
        setSelectedGenre(null);
        fetchBooksAndAudiobooks(); // Re-fetch all books and audiobooks when clearing the genre filter
    };

    const renderBookItem = ({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            if (item.type === 'audiobook') {
              const index = audiobooks.findIndex(book => book.audioUrl === item.audioUrl);
              navigation.navigate('Player', {
                audiobooks: audiobooks,
                currentIndex: index,
              });
      
              addToPlaylist(item.id, 'Currently Listening', userId, {
                bookId: item.id,
                title: item.title,
                author: item.author,
                coverUrl: item.coverUrl,
                audioUrl: item.audioUrl
              });
            } else {
              const index = books.findIndex(book => book.title === item.title);
              navigation.navigate('BookInfo', {
                books: books,
                currentIndex: index,
              });
            }
          }}
        >
          <View style={styles.bookContainer}>
            <Image
              source={{ uri: item.coverUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.bookDetails}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>Author: {item.author}</Text>
            {item.genres && item.genres.length > 0 && (
              <View style={styles.genreContainer}>
                {item.genres.map((genre, index) => (
                  <Text key={index} style={styles.genreText}>{genre}</Text>
                ))}
              </View>
            )}
            {item.type === 'audiobook' && <Text style={styles.audiobookLabel}>Audiobook</Text>}
          </View>
        </TouchableOpacity>
      );
      

    const renderGenreItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedGenre === item.name && styles.selectedCategoryButton
            ]}
            onPress={() => handleCategoryPress(item.name)}
        >
            {/* console.log("item",item); */}
            <Text
                style={[
                    styles.categoryText,
                    selectedGenre === item.name && styles.selectedCategoryText,
                ]}
                >
                {item.name}
                </Text>
            {selectedGenre === item.name && (
                <TouchableOpacity onPress={clearGenreFilter} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>x</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title or author"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    onSubmitEditing={handleSearch}
                    placeholderTextColor="#888"
                />
            </View>
            <View style={styles.genreContainer}>
                <FlatList
                    data={fixedGenres}
                    renderItem={renderGenreItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                />
            </View>
            <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={(item) => item.id}
                style={styles.bookList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 20,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'white',
        height: 50,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 25,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    clearButton: {
        position: 'absolute',
        right: 20, // Adjust this value as needed
        top: 10, // Adjust this value as needed
    },
    clearButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
      },
      genreText: {
        backgroundColor: 'lightgrey',
        padding: 5,
        borderRadius: 30,
        marginRight: 10,
        marginBottom: 5,
      },
    categoryButton: {
        backgroundColor: 'white',
        borderWidth:1,
        borderStyle:'solid',
        borderColor:'#673987',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: 150,
        marginRight: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedCategoryButton: {
        backgroundColor: '#673987',
    },
    selectedCategoryText:{
        fontSize: 16,
        color: 'white',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    bookList: {
        flex: 1,
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bookContainer: {
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 160,
        borderRadius: 10,
        marginRight: 15,
    },
    bookDetails: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    author: {
        fontSize: 16,
        color: '#666',
    },
    audiobookLabel: {
        fontSize: 14,
        color: '#007bff',
        marginTop: 5,
    },
});
