import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as OpenAnything from "react-native-openanything";


export default function BookInfo({ route, navigation }) {
    const { books, currentIndex } = route.params;
    const [showFullSummary, setShowFullSummary] = useState(false);

    // Function to toggle show more/less
    const toggleSummary = () => {
        setShowFullSummary(!showFullSummary);
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <ImageBackground
                    source={{ uri: books[currentIndex].coverUrl }}
                    style={styles.imageBackground}
                >
                    <SafeAreaView>
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Image source={require('./assets/back.png')} style={styles.backButtonImage} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{books[currentIndex].title}</Text>
                    <Text style={styles.author}>{books[currentIndex].author}</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <Text style={{ bottom:60,
                    fontSize: 16,
                    lineHeight: 24,
                    fontWeight:'bold',
                    fontSize:18,
                    }}>
                        Summary:
                    </Text>
                    <Text style={styles.summary}>
                        {showFullSummary ? books[currentIndex].summary : `${books[currentIndex].summary.substring(0, 100)}...`}
                    </Text>
                    {books[currentIndex].summary.length > 100 && (
                        <TouchableOpacity onPress={toggleSummary} style={styles.showMoreButton}>
                            <Text style={styles.showMoreText}>
                                {showFullSummary ? 'Show Less' : 'Show More'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
            <View style={{ position: "absolute", bottom: 20, width: "100%" }}>
            <TouchableOpacity style={styles.downloadButton}
                onPress={() => {
                    OpenAnything.Pdf(books[currentIndex].pdfUrl);
                }}
            >
                <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: 'white',
    },
    imageBackground: {
        width: "100%",
        height: 500,
        borderRadius:30,
    },
    backButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonImage: {
        width: 30,
        height: 30,
        tintColor:'#673987',
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 35,
        borderRadius: 50,
        bottom: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: 'black',
    },
    author: {
        fontSize: 18,
        marginBottom: 10,
        color: 'black',
    },
    summaryContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom:70,
    },
    summary: {
        bottom:60,
        fontSize: 16,
        lineHeight: 24,
    },
    showMoreButton: {
        bottom:55,
        marginTop: 10,
    },
    showMoreText: {
        // textDecorationLine: 'underline',
        color: '#673987',
    },
    downloadButton: {
        backgroundColor: '#673987',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

