import React, { useState, useEffect,useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal,Alert  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";


import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, addDoc, query, where, getDoc } from "firebase/firestore";
import UserContext from './UserContext';
// import { useAudiobook } from './AudiobookContext';
// import { AirbnbRating } from 'react-native-ratings';
import StarRating from 'react-native-star-rating-widget';
import StarRatingDisplay from 'react-native-star-rating-widget';

export default function AudioBooks({ navigation }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [activeSections, setActiveSections] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  // const [userId, setUserId] = useState(route.params.userId);
  const { userId } = useContext(UserContext);
  const [audiobooks, setAudiobooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  // const { progressPercentage } = useAudiobook();
  const [bookToAdd, setBookToAdd] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  
  

  // useEffect(() => {
  //   setUserId(route.params.userId);
  // }, [route.params.userId]);

  // Update loading state when data fetching is complete
useEffect(() => {
  if (audiobooks.length > 0) {
    setLoading(false);
  }
}, [audiobooks]);

// useEffect(() => {
//   setUserId(route.params.userId);
// }, [route.params.userId]);

// useEffect(() => {
//   const dbFS = getFirestore();
//   const unsubscribe = onSnapshot(collection(dbFS, 'audiobooks'), snapshot => {
//     const fetchedAudiobooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     setAudiobooks(fetchedAudiobooks);
//   });

//   return unsubscribe;
// }, []);

const handleAddSignClick = () => {
  setShowAddModal(true); // Show the add modal
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



useEffect(() => {
  // setUserId(route.params.userId);

  const fetchAudiobooks = async () => {
    try {
      const db = getFirestore();
      const playlistId = await fetchPlaylistId('favorites', userId);
      console.log("playlistId", playlistId);

      if(playlistId){
        const playlistDocRef = doc(collection(db, 'users', userId, 'playlists'), playlistId);
        const playlistDocSnapshot = await getDoc(playlistDocRef);
        const playlistData = playlistDocSnapshot.data();

        if (playlistData) {
          const booksQuerySnapshot = await getDocs(collection(playlistDocRef, 'books'));
          console.log("Here");
          const booksData = booksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log("booksData", booksData);

          // Create an object to store book IDs that are favorites
          const favoriteBookIds = {};
          booksData.forEach(playlistBook => {
            favoriteBookIds[playlistBook.title] = true;
          });

          // Fetch all audiobooks
          const audiobooksSnapshot = await getDocs(collection(db, 'audiobooks'));
          console.log("audiobooksSnapshot", audiobooksSnapshot);
          const allAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Update the audiobooks with the isFavorite property
          const updatedAudiobooks = allAudiobooks.map(book => ({
            ...book,
            isFavorite: !!favoriteBookIds[book.title], // Set isFavorite based on the existence in favoriteBookIds
            userHasRated: !!(book.rating && book.rating.userRatings && book.rating.userRatings[userId])
          }));

          // Set the state only once after all updates
          setAudiobooks(updatedAudiobooks);
          setLoading(false); // Set loading to false once data fetching is complete
        }
      } else {
        // If playlist doesn't exist, fetch all audiobooks directly
        const audiobooksSnapshot = await getDocs(collection(db, 'audiobooks'));
        const fetchedAudiobooks = audiobooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAudiobooks(fetchedAudiobooks);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching audiobooks:', error);
      alert('Error fetching audiobooks. Please try again later.');
      setLoading(false); // Set loading to false in case of error
    }
  };

  fetchAudiobooks();
}, [userId]);

const handleRating = async (audiobookId, rating) => {
  try {
    const db = getFirestore();
    const audiobookRef = doc(db, 'audiobooks', audiobookId);
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

    setAudiobooks(prevAudiobooks =>
      prevAudiobooks.map(book =>
        book.id === audiobookId ? { ...book, rating: { value: newAverageRating, count: newTotalRatings }, userHasRated: true } : book
      )
    );
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
  

  const goToPlaylist = () =>{
    navigation.navigate("PlaylistScreen", {userId});
  }
  const goToProgress = () =>{
    navigation.navigate("ProgressScreen");
  }

  // useEffect(() => {
  //   const fetchPlaylistDetails = async () => {
  //     try {
  //       const db = getFirestore();
  //       const playlistDocRef = doc(collection(db, 'users', userId, 'playlists'), playlistId);
  //       const playlistDocSnapshot = await getDoc(playlistDocRef);
  //       const playlistData = playlistDocSnapshot.data();
  //       if (playlistData) {
  //         setPlaylistName(playlistData.name);
  //         const booksQuerySnapshot = await getDocs(collection(playlistDocRef, 'books'));
  //         const booksData = booksQuerySnapshot.docs.map(doc => doc.data());
  //         setUserBooks(booksData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching playlist details:', error);
  //       alert('Error fetching playlist details. Please try again later.');
  //     }
  //   };

  //   fetchPlaylistDetails();
  // }, [playlistId, userId]);

  
 const addToPlaylist = async (bookId, playlistName, userId, bookDetails) => {
  try {
     setBookToAdd(bookDetails);
      const db = getFirestore();
      setShowAddModal(true);
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

// const handleAddToPlaylist = () => {
//   // Check if a playlist is selected
//   if (selectedPlaylist) {
//     // Add the book to the selected playlist
//     addToPlaylist(item.id, selectedPlaylist, userId, {
//       bookId: item.id,
//       title: item.title,
//       author: item.author,
//       coverUrl: item.coverUrl,
//       audioUrl: item.audioUrl
//     });

//     // Display the name of the selected playlist
//     console.log("Selected Playlist:", selectedPlaylist);

//     // Optionally, you can display a confirmation message or perform other actions here
//   } else {
//     console.log("no playlist selected")
//   }
// };



const removeFromPlaylist = async (bookId, playlistName, userId) => {
  try {
    const db = getFirestore();
    const playlistId = await fetchPlaylistId(playlistName, userId); // Fetch the playlistId asynchronously
    console.log("bookId.title", bookId.title);

    if (!playlistId) {
      console.log('Playlist not found.');
      alert('Playlist not found.');
      return; // Exit the function if playlist not found
    }

    const playlistDocRef = doc(collection(db, 'users', userId, 'playlists'), playlistId);

    // Get the snapshot of books in the playlist
    const booksQuerySnapshot = await getDocs(collection(playlistDocRef, 'books'));
    const booksData = booksQuerySnapshot.docs.map(doc => doc.data());
    console.log("booksData", booksData);

    // Check each book in the playlist to see if it matches the book to be removed
    for (const bookData of booksData) {
      if (bookData.author === bookId.author && bookData.title === bookId.title) {
        // Book found, get its document reference and delete it
        const bookDocRef = booksQuerySnapshot.docs.find(doc => doc.data().author === bookId.author && doc.data().title === bookId.title).ref;
        await deleteDoc(bookDocRef);
        console.log('Book removed from playlist successfully.');
        return; // Exit the function after removing the book
      }
    }

    // If the loop completes without finding the book, log and alert that the book was not found in the playlist
    console.log('Book not found in the playlist.');
    alert('Book not found in the playlist.');
  } catch (error) {
    console.error('Error removing book from playlist:', error);
    alert('Error removing book from playlist. Please try again later.');
  }
};



const toggleFavorite = async (book) => {
  try {
    const bookId = book.id;
    const isFavorite = !book.isFavorite;

    console.log("Before toggling - isFavorite:", book.isFavorite);

    if (isFavorite) {
      await addToPlaylist(bookId, 'favorites', userId, {
        bookId: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        audioUrl: book.audioUrl
      });
    } else {
      await removeFromPlaylist(book, 'favorites', userId);
    }

    console.log("After toggling - isFavorite:", isFavorite);

    // Update the audiobook's isFavorite property directly in the state
    setAudiobooks(prevAudiobooks =>
      prevAudiobooks.map(prevBook =>
        prevBook.title === book.title ? { ...prevBook, isFavorite } : prevBook
      )
    );

    console.log("Updated audiobooks:", audiobooks);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    alert('Error toggling favorite. Please try again later.');
  }
};


const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={() => {
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
    }}
  >
    <View style={styles.bookContainer}>
      <Image
        source={{ uri: item.coverUrl }}
        style={styles.image}
        resizeMode="cover"
      />

<View style={styles.bookInfoContainer}>
  <Text style={styles.title}>{item.title}</Text>
  <Text style={styles.author}>Author: {item.author}</Text>
  <View style={styles.ratingContainer}>
          {item.rating && item.rating.value !== undefined ? (
          <>
            <Text style={styles.ratingText}>
              Rating: {item.rating.value.toFixed(1)} ({item.rating.count} ratings)
            </Text>
            <StarRatingDisplay starSize={25} color='#673987' starStyle={{marginRight:0,}} rating={item.rating.value.toFixed(1)} />
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
  <View style={styles.iconContainer}>
    <TouchableOpacity
      style={styles.addToPlaylistButton}
      onPress={() => toggleFavorite(item)}
    >
      <Image
        source={item.isFavorite ? require('./assets/redHeart.png') : require('./assets/greyHeart.png')}
        style={styles.heartIcon}
      />
    </TouchableOpacity>


    {/* <TouchableOpacity>
          <Picker
            selectedValue={selectedPlaylist}
            style={{ 
              height: 50,
              width: 200,
              backgroundColor: '#f0f0f0', // Background color
              borderRadius: 10, // Border radius
              marginBottom: 10, // Spacing
             }}
             itemStyle={styles.pickerItem}
            onValueChange={(itemValue, itemIndex) => setSelectedPlaylist(itemValue)}
          >
            <Picker.Item label="Select Playlist" value="" />
            <Picker.Item label="Heard" value="Heard" />
            <Picker.Item label="Want to Listen" value="Want to Listen" />
          </Picker>
    </TouchableOpacity> */}



          <Collapse>
            <CollapseHeader>
              <View style={styles.collapseHeader}>
                <Text style={styles.collapseHeaderText}>Add to Playlist</Text>
              </View>
            </CollapseHeader>
            <CollapseBody>
              <TouchableOpacity
                onPress={()=>{
                  addToPlaylist(item.id,'Heard',userId,{
                    bookId: item.id,
                    title: item.title,
                    author: item.author,
                    coverUrl: item.coverUrl,
                    audioUrl: item.audioUrl
                  })
                }}
                style={styles.playlistOption}
              >
                <Text>Heard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={()=>{
                  addToPlaylist(item.id,'Want to Listen',userId,{
                    bookId: item.id,
                    title: item.title,
                    author: item.author,
                    coverUrl: item.coverUrl,
                    audioUrl: item.audioUrl
                  })
                }}
                style={styles.playlistOption}
              >
                <Text>Want to Listen</Text>
              </TouchableOpacity>
            </CollapseBody>
          </Collapse>

  </View>
</View>
    </View>

{/* <TouchableOpacity onPress={()=>{
        addToPlaylist(item.id,selectedPlaylist,userId,{
          bookId: item.id,
          title: item.title,
          author: item.author,
          coverUrl: item.coverUrl,
          audioUrl: item.audioUrl
        })
      }}>
        <Text style={{fontSize:16,marginLeft:180}}>Add to Playlist</Text>
      </TouchableOpacity> */}

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
      {/* {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={audiobooks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )} */}
      <View>
        <Text style={{fontSize:30,marginLeft:10,fontWeight:'bold',marginTop:20,}}>
          AudioBooks:
        </Text>
      </View>
       <FlatList
          data={audiobooks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />

        

    {/* <View>
    <Picker
        selectedValue={selectedPlaylist}
        style={{ height: 50, width: 200 }}
        onValueChange={(itemValue, itemIndex) => setSelectedPlaylist(itemValue)}
      >
        <Picker.Item label="Select Playlist" value="" />
        <Picker.Item label="Heard" value="Heard" />
        <Picker.Item label="Want to Listen" value="Want to Listen" />
     
      </Picker>
     
      <TouchableOpacity onPress={()=>{
        addToPlaylist(item.id,selectedPlaylist,userId,{
          bookId: item.id,
          title: item.title,
          author: item.author,
          coverUrl: item.coverUrl,
          audioUrl: item.audioUrl
        })
      }}>
        <Text>Add to Playlist</Text>
      </TouchableOpacity>
    </View> */}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 90,
    height: 140,
    borderRadius: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  author: {
    fontSize: 16,
    color: '#666666',
  },
  rating: {
    fontSize: 16,
    color: 'grey',
  },
  rateButton: {
    marginTop: 10,
    backgroundColor: '#673987',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    width:160,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  heartIcon: {
    width: 30,
    height: 30,
    marginTop: 10,
  },
  goToPlaylist: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addToPlaylistText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  addIconImage:{
    height:30,
    width:30,
    marginLeft:140,
    marginTop:10,
  },
  addOption: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth:1,
    borderColor:'#673987',
  },
  addOptionText: {
    color: '#673987',
    fontSize: 20,
  },
  closeModalButton: {
    // backgroundColor: '#FF0000', 
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginLeft:120,
    marginBottom:10,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row', // Lay out the icons horizontally
    alignItems: 'center', // Center the icons vertically
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
  closeModalImage: {
    width: 15, // Adjust the width of the close image as needed
    height: 15, // Adjust the height of the close image as needed
    tintColor: 'black', // You can change the color of the close image if needed
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    width: '80%', // Adjust the width of the line as needed
  },
  pickerItem: {
    fontSize: 16, // Font size of picker items
    color: '#333', // Text color
  },
  collapseHeader: {
    padding: 10,
    backgroundColor: '#673987',
    borderRadius: 5,
    marginTop: 10,
    marginLeft:50,
  },
  collapseHeaderText: {
    fontSize: 16,
    color:'white',
    fontWeight: 'bold',
  },
  playlistOption: {
    width:120,
    padding: 10,
    marginLeft:50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  }
});