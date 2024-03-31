import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icon library

export default function Screen1 ({navigation}) {
  const [selectedTab, setSelectedTab] = useState('ebooks'); // 'ebooks' or 'audiobooks'
  const [favorites, setFavorites] = useState([]); 

  // Dummy data for e-books and audiobooks
  const ebooksData = [
    { id: 1, title: 'E-book 1', cover: require('./assets/Book a storefront of bookshop drawing in vintage style on white background.jpg'), review: 4 },
    { id: 2, title: 'E-book 2', cover: require('./assets/Book a storefront of bookshop drawing in vintage style on white background.jpg'), review: 5 },
    // Add more e-book data as needed
  ];

  const audiobooksData = [
    { id: 1, title: 'Audiobook 1', cover: require('./assets/Book a storefront of bookshop drawing in vintage style on white background.jpg'), review: 3 },
    { id: 2, title: 'Audiobook 2', cover: require('./assets/Book a storefront of bookshop drawing in vintage style on white background.jpg'), review: 4 },
    // Add more audiobook data as needed
  ];

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.bookContainer}>
        <Image
          source={item.cover}
          style={styles.bookCover}
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Icon
                name={favorites.includes(item.id) ? 'heart' : 'heart-o'}
                size={24}
                color={favorites.includes(item.id) ? 'red' : 'gray'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addToLibrary(item.id)}>
      <Image
        source={require('./assets/add.png')} // Path to your custom PNG icon
        style={styles.customIcon}
      />
    </TouchableOpacity>
          </View>
          <View style={styles.starContainer}>
            {/* Render stars based on the book's review */}
            {renderStars(item.review)}
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderStars = (review) => {
    // Logic to render stars based on review (you can customize this according to your requirements)
    // For simplicity, let's render 5 stars
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i < review ? 'star' : 'star-o'}
          size={20}
          color={i < review ? 'gold' : 'gray'}
        />
      );
    }
    return stars;
  };

  const toggleFavorite = (itemId) => {
    // Check if the item is already in favorites
    if (favorites.includes(itemId)) {
      // If yes, remove it from favorites
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      // If not, add it to favorites
      setFavorites([...favorites, itemId]);
    }
  };

  const addToLibrary = (itemId) => {
    // Add logic to add the item to user's library
    console.log('Added to library:', itemId);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'ebooks' && styles.selectedTab]}
          onPress={() => setSelectedTab('ebooks')}>
          <Text>E-books</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'audiobooks' && styles.selectedTab]}
          onPress={() => setSelectedTab('audiobooks')}>
          <Text>Audiobooks</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={selectedTab === 'ebooks' ? ebooksData : audiobooksData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Change background color for better contrast
    paddingHorizontal: 10, // Add horizontal padding for better spacing
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Spread tabs evenly
    alignItems: 'center',
    borderBottomWidth: 2, // Increase border width for better visibility
    borderBottomColor: 'blue',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Lighten border color
    backgroundColor: 'white', // Add background color to items
    borderRadius: 10, // Add border radius for rounded corners
    marginVertical: 5, // Adjust vertical margin
    elevation: 2, // Add shadow for depth effect
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', // Required for absolute positioning of icons
  },
  bookCover: {
    width: 80,
    height: 120,
    marginRight: 10,
    borderRadius: 5, // Add border radius for rounded corners
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333', // Darken text color for better readability
  },
  actionIcons: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center', // Center align icons vertically
  },
  customIcon: {
    width: 24,
    height: 24,
    marginLeft: 5,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 5, // Add margin top for spacing
  },
});
