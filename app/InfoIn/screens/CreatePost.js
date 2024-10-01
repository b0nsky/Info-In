import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADD_POST_MUTATION = gql`
mutation Mutation($content: String!, $tags: [String], $imgUrl: String) {
  addPost(content: $content, tags: $tags, imgUrl: $imgUrl) {
    _id
    content
  }
}
`;

const GET_POSTS = gql`
query GetPosts {
    getPosts {
        _id
        content
        tags
        imgUrl
        author {
            _id
            username
        }
        comments {
            content
        }
        likes {
            username
        }
    }
}`;

export default function CreatePostScreen({ navigation }) {
  const [postContent, setPostContent] = useState('');
  const [tags, setTags] = useState(''); 
  const [imgUrl, setImgUrl] = useState('');
  const [addPost] = useMutation(ADD_POST_MUTATION, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const handleSubmit = async () => {
    try {
      const tagList = tags.split(',').map(tag => tag.trim()); 
      const storedData = await AsyncStorage.getItem('userData')
      const parsedData = storedData ? JSON.parse(storedData) : null

      const token = parsedData?.token || null
      
      const { data } = await addPost({
        variables: { content: postContent, tags: tagList, imgUrl },
        context: {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        },
      });

      if (data.addPost) {
        Alert.alert("Post Created", "Your post has been created successfully.");
        navigation.navigate('Home'); 
      }
    } catch (error) {
      console.error('Error saat submit:', error); 
      Alert.alert("Error", "Gagal menambahkan post. Silakan coba lagi.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Post</Text>
      <TextInput
        placeholder="Apa yang ada di pikiranmu?"
        value={postContent}
        onChangeText={setPostContent}
        style={styles.input}
      />
      <TextInput
        placeholder="Tag (pisahkan dengan koma)"
        value={tags}
        onChangeText={setTags}
        style={styles.input}
      />
      <TextInput
        placeholder="URL Gambar"
        value={imgUrl}
        onChangeText={setImgUrl}
        style={styles.input}
      />
      <Button title="Submit" onPress={handleSubmit} color="blue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
