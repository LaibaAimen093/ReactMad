import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TouchableOpacity, Modal, ScrollView, RefreshControl  } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, addDoc, query, where, getDoc } from "firebase/firestore";
import { FlatList } from 'react-native-gesture-handler';
import UserContext from './UserContext';
import StarRating from 'react-native-star-rating-widget';
import StarRatingDisplay from 'react-native-star-rating-widget';

export default function Books({ navigation }) {
  const [books, setBooks] = useState([]);
  const { userId } = useContext(UserContext);
  const [currentBook, setCurrentBook] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = async () => {
    try {
      const dbFS = getFirestore();

      // Subscribe to changes in the 'books' collection
      const unsubscribe = onSnapshot(collection(dbFS, 'books'), snapshot => {
        const fetchedBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(fetchedBooks);
        setLoading(false);
      });

      // Fetch all books from the 'books' collection
      const booksSnapshot = await getDocs(collection(dbFS, 'books'));
      console.log("booksSnapshot", booksSnapshot);
      
      // Map the fetched books to include the 'userHasRated' property
      const allBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const updatedBooks = allBooks.map(book => ({
        ...book,
        userHasRated: !!(book.rating && book.rating.userRatings && book.rating.userRatings[userId])
      }));

      // Update the state with the updated books
      setBooks(updatedBooks);
      console.log("updatedBooks",updatedBooks);

      console.log("books",books);

      // Return the unsubscribe function to clean up the subscription
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
      // Handle error
    }
  };

  useEffect(() => {  
    // Call the fetchBooks function
    fetchBooks();
  }, []);

  const dummyFunction = () => {
    console.log("This is a dummy function");
  };

  const onRefresh = async () => { // Add this function
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };
  

  const handleRating = async (audiobookId, rating) => {
    try {
      const db = getFirestore();
      const audiobookRef = doc(db, 'books', audiobookId);
      const audiobookDoc = await getDoc(audiobookRef);
      const currentRating = audiobookDoc.data().rating || { value: 0, count: 0, userRatings: {} };
  
      const userHasRated = currentRating.userRatings && currentRating.userRatings[userId];
      const previousUserRating = userHasRated ? currentRating.userRatings[userId] : 0;
  
      const totalRatings = currentRating.count || 0;
      console.log("totalRatings", totalRatings);
  
      // Calculate total rating value correctly, handling the initial rating case
      let totalRatingValue = totalRatings ? currentRating.value * totalRatings : 0;
      if (userHasRated) {
        totalRatingValue -= previousUserRating;
      }
      totalRatingValue += rating;
      console.log("totalRatingValue", totalRatingValue);
  
      const newTotalRatings = userHasRated ? totalRatings : totalRatings + 1;
      console.log("newTotalRatings", newTotalRatings);
  
      const newAverageRating = newTotalRatings ? totalRatingValue / newTotalRatings : 0;
      console.log("newAverageRating", newAverageRating);
  
      await setDoc(audiobookRef, {
        rating: {
          value: newAverageRating,
          count: newTotalRatings,
          userRatings: {
            ...currentRating.userRatings,
            [userId]: rating
          }
        }
      }, { merge: true });
  
      // setAudiobooks(prevAudiobooks =>
      //   prevAudiobooks.map(book =>
      //     book.id === audiobookId ? { ...book, rating: { value: newAverageRating, count: newTotalRatings }, userHasRated: true } : book
      //   )
      // );
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again later.');
    }
  };
  

  const handleRatingSelection = (bookId, rating) => {
    setSelectedBookId(bookId);
    setSelectedRating(rating);
  };

  const handleRatingSubmission = async () => {
    if (selectedBookId !== null) {
      await handleRating(selectedBookId, selectedRating);
      setSelectedBookId(null);
      setSelectedRating(0);
    }
  };


  const renderItem = ({ item }) => (      
      <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('BookInfo', { books, currentIndex: books.findIndex(book => book.title === item.title) })}>
    
    <View style={styles.bookInfo}>      
        {/* <View style={{backgroundColor:'red',width:'100%'}}> */}
          <Image source={{ uri: item.coverUrl }} style={styles.image} resizeMode="cover" />
          <View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>By {item.author}</Text>
          </View>

          <View style={styles.ratingContainer}>
          {item.rating && item.rating.value !== undefined ? (
          <>
            <Text style={styles.ratingText}>
              Rating: {item.rating.value.toFixed(1)} ({item.rating.count} ratings)
            </Text>
            <StarRatingDisplay starSize={25} color='#673987' starStyle={{marginRight:0,}} rating={item.rating.value.toFixed(1)} onChange={dummyFunction} />
          </>
        ) : (
          <Text style={styles.ratingText}>No ratings yet</Text>
        )}

        {!item.userHasRated && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => 
              setSelectedBookId(item.id)}
          >
            <Text style={styles.rateButtonText}>Rate This Book</Text>
          </TouchableOpacity>
        )}

        {selectedBookId === item.id && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={true}
            onRequestClose={() => setSelectedBookId(null)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalContainer}>
                <Text style={{color:'grey',marginBottom:3}}>Please rate {item.title}</Text>
                <StarRating
                  starSize={30} color='#673987' 
                  rating={selectedRating}
                  onChange={(rating) => handleRatingSelection(item.id, rating)}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRatingSubmission}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
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


  return (
    <View style={styles.container}>
      {/* <View>
        <Text style={{fontSize:30,marginLeft:20,fontWeight:'bold'}}>
          E-BOOKS
        </Text>
      </View> */}
      <FlatList
        style={styles.flatList}
        data={books}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
    flex: 1,
    marginTop: 30,
    // paddingHorizontal: 10,
  },
  itemContainer: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9', // Light background color
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spread items horizontally
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    // marginLeft: 10,
    marginTop:20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  author: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 5,
  },
  image: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginRight: 10,
  },
  ratingContainer: {
    alignItems: 'flex-start', // Align ratings to the left
    marginRight: 60,
    marginBottom:20,
  },
  ratingText: {
    fontSize: 16,
    color: 'grey',
    marginBottom: 5,
  },
  rateButton: {
    backgroundColor: '#673987',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    marginTop: 280,
  },
  submitButton: {
    backgroundColor: '#673987',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
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
