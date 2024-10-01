import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Navbar from '../components/Bar';
import { useQuery, useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const LIKE_POST_MUTATION = gql`
mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
        _id
        likes {
            username
        }
    }
}`;

const COMMENT_POST_MUTATION = gql`
mutation Mutation($postId: ID!, $content: String!) {
    commentPost(postId: $postId, content: $content) {
        _id
        comments {
            content
            author {
                username
            }
        }
    }
}`;

export default function HomeScreen({ navigation }) {
    
    const { loading, error, data } = useQuery(GET_POSTS);

    const [likePost] = useMutation(LIKE_POST_MUTATION, {
        update(cache, { data: { likePost } }) {
            const { getPosts } = cache.readQuery({ query: GET_POSTS });

            const updatedPosts = getPosts.map(post => {
                if (post._id === likePost._id) {
                    return {
                        ...post,
                        likes: likePost.likes,
                    };
                }
                return post;
            });

            cache.writeQuery({
                query: GET_POSTS,
                data: { getPosts: updatedPosts },
            });
        },
    });

    const handleLike = async (postId) => {
        try {
            const storedData = await AsyncStorage.getItem('userData');
            const parsedData = storedData ? JSON.parse(storedData) : null;
            
            const token = parsedData?.token || null;

            if (!token) {
                throw new Error('Token tidak ditemukan, silakan login ulang.');
            }

            const { data } = await likePost({
                variables: { postId },
                context: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            });

            if (data.likePost) {
                console.log(`Liked post with ID: ${postId}`);
            }
        } catch (error) {
            console.error('Error saat melakukan like:', error);
        }
    };

    const handleComment = async (getPostId) => {
        navigation.navigate('PostDetail', { getPostId });
    };
    
    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10 }}>Loading ....</Text>
        </View>
    );

    if (error) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{error.message}</Text>
        </View>
    );

    const handleImagePress = (getPostId) => {
        navigation.navigate('PostDetail', { getPostId });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={data.getPosts}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        <View style={styles.profileContainer}>
                            <Image
                                source={require('../assets/user.png')}
                                style={styles.profileImage}
                            />
                            <Text style={styles.author}>Posted by: {item.author.username}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleImagePress(item._id)}>
                            <Image source={{ uri: item.imgUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <Text style={styles.postContent}>{item.content}</Text>
                        
                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, index) => (
                                <Text key={index} style={styles.tag}>
                                    #{tag}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => handleLike(item._id)}>
                                <Image source={require('../assets/like.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleComment(item._id)}>
                                <Image source={require('../assets/comment.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 60,
        backgroundColor: '#f0f4f8'
    },
    postContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#B3B3B3',
        borderRadius: 5,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    postContent: {
        fontSize: 16,
        marginVertical: 5,
    },
    author: {
        fontSize: 14,
        color: '#555',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    tag: {
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        padding: 5,
        margin: 2,
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    buttonImage: {
        width: 30,
        height: 30,
    },
});
