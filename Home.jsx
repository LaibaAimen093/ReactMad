import React, { useEffect, useState,useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, addDoc, query, where, getDoc } from "firebase/firestore";
import StarRatingDisplay from 'react-native-star-rating-widget';
import UserContext from './UserContext';

export default function Home({ navigation }) {
  const [authors, setAuthors] = useState([]);
  const [fictionBooks, setFictionBooks] = useState([]);
  const [fantasyBooks, setFantasyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audiobooks, setAudiobooks] = useState([]);
  const [books, setBooks] = useState([]);
  const { userId } = useContext(UserContext);
  


  const images = [
    require('./assets/Books as metaphors on illustrations by Jungho Lee (pictures).jpg'),
    require('./assets/Jungho Lee - Harvest.jpg'),
    require('./assets/Memoirs.jpg'),
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const db = getFirestore();
        const booksRef = collection(db, 'books');
        const audiobooksRef = collection(db, 'audiobooks');
  
        const [booksSnapshot, audiobooksSnapshot] = await Promise.all([
          getDocs(booksRef),
          getDocs(audiobooksRef)
        ]);
  
        const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'book' }));
        const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'audiobook' }));

        const fictionBooks = [...fetchedBooks, ...fetchedAudiobooks].filter(book => book.genres.some(genre => genre.trim() === 'Fiction'));
        const fantasyBooks = [...fetchedBooks, ...fetchedAudiobooks].filter(book => book.genres.some(genre => genre.trim() === 'Fantasy'));
  
        setFictionBooks(fictionBooks);
        setFantasyBooks(fantasyBooks);
        setAudiobooks(fetchedAudiobooks);
        setBooks(fetchedBooks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching books and audiobooks:', error);
        alert('Error fetching books and audiobooks. Please try again later.');
      }
    };
  
    fetchBooks();
  }, []);

  const fetchAuthors = async () => {
    try {
      const db = getFirestore();
      const authorsRef = collection(db, 'author');
      const authorsSnapshot = await getDocs(authorsRef);
      const fetchedAuthors = authorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuthors(fetchedAuthors);
    } catch (error) {
      console.error('Error fetching authors:', error);
      alert('Error fetching authors. Please try again later.');
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleAuthorPress = (author) => {
    navigation.navigate('AuthorDetails', { author: author });
  };

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

  const handleBookPress = (bookId) => {
    // Handle book press event
  };

  const changeImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(changeImage, 5000); // Change image every 5 seconds
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }

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
    <ScrollView>
      <View>
        <Text style={{fontSize:30,fontWeight:'bold',marginTop:60,marginLeft:20}}>
          Discover
        </Text>
      </View>
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={images[currentImageIndex]} style={styles.topImage} />
      </View>
      
      <View style={styles.authorSection}>
        <Text style={{
          fontSize: 25,
          // marginLeft:15,
          fontWeight: 'bold',
          marginBottom: 10,
          marginLeft:10,
          marginTop:20,
          color: '#333',
        }}>Authors</Text>
        <ScrollView horizontal contentContainerStyle={styles.authorRow}>
          {authors.map((author) => (
            <TouchableOpacity key={author.id} onPress={() => handleAuthorPress(author)}>
              <View style={styles.authorContainer}>
                <Image source={{ uri: author.picture }} style={styles.authorImage} />
                <Text style={styles.authorName}>{author.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.fictionBooksSection}>
        <Text style={styles.heading}>Fiction Books</Text>
        <ScrollView horizontal contentContainerStyle={styles.fictionBooksRow}>
        {fictionBooks.map((book) => (
    <TouchableOpacity
        key={book.id}
        onPress={() => {
            const index = audiobooks.findIndex((item) => item.audioUrl === book.audioUrl);
            if (book.type === 'audiobook') {
                navigation.navigate('Player', {
                    audiobooks: audiobooks,
                    currentIndex: index,
                });
                addToPlaylist(book.id, 'Currently Listening', userId, {
                    bookId: book.id,
                    title: book.title,
                    author: book.author,
                    coverUrl: book.coverUrl,
                    audioUrl: book.audioUrl
                });
            } else {
                const index = books.findIndex((item) => item.title === book.title);
                navigation.navigate('BookInfo', {
                    books: books,
                    currentIndex: index,
                });
            }
        }}
    >
        <View style={styles.bookContainer}>
    <Image source={{ uri: book.coverUrl }} style={styles.bookImage} />
    <View style={styles.titleContainer}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        {book.type === 'audiobook' && (
            <View style={styles.audioIconContainer}>
                <Image source={require('./assets/audiobooks.png')} style={styles.audioIcon} />
            </View>
        )}
    </View>
    <View style={styles.ratingContainer}>
          {book.rating && book.rating.value !== undefined ? (
          <>
            <Text style={styles.ratingText}>
              Rating: {book.rating.value.toFixed(1)} ({book.rating.count} ratings)
            </Text>
            <StarRatingDisplay starSize={25} color='#673987' starStyle={{marginRight:0,}} rating={book.rating.value.toFixed(1)} />
          </>
        ) : (
          <Text style={styles.ratingText}>No ratings yet</Text>
        )}
        </View>
</View>

    </TouchableOpacity>
))}

        </ScrollView>
      </View>
      
      <View style={styles.fictionBooksSection}>
        <Text style={styles.heading}>Fantasy Books</Text>
        <ScrollView horizontal contentContainerStyle={styles.fictionBooksRow}>
        {fantasyBooks.map((book) => (
    <TouchableOpacity
        key={book.id}
        onPress={() => {
            const index = audiobooks.findIndex((item) => item.audioUrl === book.audioUrl);
            if (book.type === 'audiobook') {
                navigation.navigate('Player', {
                    audiobooks: audiobooks,
                    currentIndex: index,
                });
                addToPlaylist(book.id, 'Currently Listening', userId, {
                    bookId: book.id,
                    title: book.title,
                    author: book.author,
                    coverUrl: book.coverUrl,
                    audioUrl: book.audioUrl
                });
            } else {
                const index = books.findIndex((item) => item.title === book.title);
                navigation.navigate('BookInfo', {
                    books: book,
                    currentIndex: index,
                });
            }
        }}
    >
        <View style={styles.bookContainer}>
    <Image source={{ uri: book.coverUrl }} style={styles.bookImage} />
    <View style={styles.titleContainer}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        {book.type === 'audiobook' && (
            <View style={styles.audioIconContainer}>
                <Image source={require('./assets/audiobooks.png')} style={styles.audioIcon} />
            </View>
        )}
    </View>
    <View style={styles.ratingContainer}>
          {book.rating && book.rating.value !== undefined ? (
          <>
            <Text style={styles.ratingText}>
              Rating: {book.rating.value.toFixed(1)} ({book.rating.count} ratings)
            </Text>
            <StarRatingDisplay starSize={25} color='#673987' starStyle={{marginRight:0,}} rating={book.rating.value.toFixed(1)} />
          </>
        ) : (
          <Text style={styles.ratingText}>No ratings yet</Text>
        )}
        </View>
</View>

    </TouchableOpacity>
))}

        </ScrollView>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:20,
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginHorizontal: 10,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  topImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  authorSection: {
    padding: 10,
  },
  heading: {
    fontSize: 25,
    // marginLeft:15,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop:20,
    color: '#333',
  },
  authorRow: {
    flexDirection: 'row',
  },
  authorContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  authorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  authorName: {
    marginTop: 5,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  fictionBooksSection: {
    paddingHorizontal: 10,
    marginBottom: 20,
    marginLeft:10,
  },
  fantasyBooksSection: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  fictionBooksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookContainer: {
    backgroundColor:'#f2f2f2',
    borderRadius:20,
    // marginTop:5,
    marginRight: 15,
    alignItems: 'center',
  },
  bookImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginTop:5,
  },
  bookTitle: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
  audioIcon: {
    width: 20,
    height:20,
    marginLeft:4,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioIconContainer:{
    marginLeft: 5,
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
  ratingContainer:{
    justifyContent:'center',
    alignItems:'center,'
  },
  ratingText:{
    marginLeft:35,
  },
});
