import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        // marginTop: 10,
        flex: 1,
        backgroundColor: "white",
        // paddingTop: 20,
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
      authorImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        alignSelf: 'center',
      },
      authorName: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
      },
      heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      listContent: {
        paddingBottom: 20,
      },
      itemContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        elevation: 2,
      },
      bookImage: {
        width: 100,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
      },
      bookDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
      },
      bookImageContainer: {
        marginRight: 10,
      },
      titleContainer: {
        alignItems: 'center',
      },
      bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
      },
      audioIcon: {
        width: 20,
        height: 20,
        marginTop: 5,
        tintColor: '#673987',
      },
      aboutText: {
        fontSize: 16,
        textAlign: 'left',
        marginHorizontal: 20,
      },
      showMoreText: {
        fontSize: 16,
        color: '#673987',
        textAlign: 'left',
        marginVertical: 10,
        marginLeft: 22,
      },
      aboutContainer: {
        backgroundColor: 'lightgrey',
        padding: 20,
        marginBottom: 20,
        borderRadius: 30,
        marginLeft: 20,
        marginRight: 20,
      },
      backButtonContainer: {
        position: 'absolute',
        top: 30,
        left: 20,
      },
      backButton: {
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      backButtonImage: {
        width: 30,
        height: 30,
        tintColor: '#673987',
      },
      ratingText: {
        fontSize: 16,
        color: 'grey',
        marginBottom: 5,
        marginRight:20,
        // marginLeft:20,
        paddingRight:30,
      }
});

export default styles;