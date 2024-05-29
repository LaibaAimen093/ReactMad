import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import StarRatingDisplay from 'react-native-star-rating-widget';
import styles from './styles'; 


export default function AuthorDetails({ route, navigation }) {
  const { author } = route.params;
  const [authorName, setAuthorName] = useState(author.name);
  const [authorId, setAuthorId] = useState(author.id);
  const [aboutAuthor, setAboutAuthor] = useState(author.about);
  const [books, setBooks] = useState([]);
  const [showFullText, setShowFullText] = useState(false);
  const [audiobooks, setAudiobooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooksAndAudiobooks = async () => {
      try {
        const db = getFirestore();

        // Query books and audiobooks by the author
        const booksQuery = query(collection(db, 'books'), where('author', '==', authorName));
        const audiobooksQuery = query(collection(db, 'audiobooks'), where('author', '==', authorName));

        const [booksSnapshot, audiobooksSnapshot] = await Promise.all([
          getDocs(booksQuery),
          getDocs(audiobooksQuery),
        ]);

        const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setBooks(fetchedBooks);
        setAudiobooks(fetchedAudiobooks);
      } catch (error) {
        console.error('Error fetching books and audiobooks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksAndAudiobooks();
  }, [authorId]);

  const dummyFunction = () => {
    console.log("This is a dummy function");
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}
    onPress={() => navigation.navigate('BookInfo', { books, currentIndex: books.findIndex(book => book.title === item.title) })}>
      <View style={styles.bookDetailsContainer}>
        <View style={styles.bookImageContainer}>
          <Image source={{ uri: item.coverUrl }} style={styles.bookImage} />
        </View>
        <View style={styles.bookInfoContainer}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          {item.type === 'audiobook' && (
            <Image source={require('./assets/audiobooks.png')} style={styles.audioIcon} />
          )}
          {item.rating && item.rating.value !== undefined ? (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                Rating: {item.rating.value.toFixed(1)} ({item.rating.count} ratings)
              </Text>
              <StarRatingDisplay starSize={25} color='#673987' starStyle={{marginRight:0,}} rating={item.rating.value.toFixed(1)} onChange={dummyFunction} />
            </View>
          ) : (
            <Text style={styles.ratingText}>No ratings yet</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  

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

  const aboutText = showFullText ? aboutAuthor : `${aboutAuthor.substring(0, 100)}...`;

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ backgroundColor: '#673987', height: 300 }}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image source={require('./assets/back.png')} style={styles.backButtonImage} />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 250, backgroundColor: "white", borderRadius: 50, width: "100%", paddingTop: 20 }}>
            <Image source={{ uri: author.picture }} style={styles.authorImage} />
            <Text style={styles.authorName}>{author.name}</Text>
          </View>
        </View>

        <View style={{ marginTop: 140 }}>
          <View style={styles.aboutContainer}>
            <Text style={{ fontSize: 20, marginLeft: 20, fontWeight: "bold" }}>About {authorName} </Text>
            <Text style={styles.aboutText}>{aboutText}</Text>
            <Text style={styles.showMoreText} onPress={() => setShowFullText(!showFullText)}>
              {showFullText ? 'Show Less' : 'Show More'}
            </Text>
          </View>
          <Text style={styles.heading}>Available Books by {authorName}</Text>
          <FlatList
            data={[...books, ...audiobooks]}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            // numColumns={2}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </ScrollView>
  );
}
