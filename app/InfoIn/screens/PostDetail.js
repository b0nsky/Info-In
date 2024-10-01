import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TextInput, Button, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { useQuery, gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GET_POST = gql`
query GetPost($getPostId: ID!) {
    getPost(id: $getPostId) {
        _id
        content
        tags
        imgUrl
        author {
            _id
            name
            username
        }
        comments {
            content
            username
        }
        likes {
            username
        }
    }
}`;

const COMMENT_POST = gql`
mutation Mutation($postId: ID!, $content: String!) {
    commentPost(postId: $postId, content: $content) {
        _id
        comments {
            username
            content
        }
    }
}
`;

export default function DetailPostScreen({ route }) {
    const { getPostId } = route.params;
    const { loading, error, data, refetch } = useQuery(GET_POST, {
        variables: { getPostId },
    });

    const [comment, setComment] = useState('');
    const [commentPost] = useMutation(COMMENT_POST, {
        onCompleted: () => {
            refetch();
        },
        update(cache, { data: { commentPost } }) {
            const { getPost } = cache.readQuery({
                query: GET_POST,
                variables: { getPostId },
            });

            const newComments = commentPost.comments;

            cache.writeQuery({
                query: GET_POST,
                data: {
                    getPost: {
                        ...getPost,
                        comments: newComments,
                    },
                },
                variables: { getPostId },
            });
        }
    });

    const handleCommentSubmit = async () => {
        if (!comment) return;

            const storedData = await AsyncStorage.getItem('userData');
            const parsedData = storedData ? JSON.parse(storedData) : null;
            
            const token = parsedData?.token || null;

        try {
            await commentPost({
                variables: { postId: getPostId, content: comment },
                context: {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                },
            });
            setComment('');
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading ....</Text>
        </View>
    );

    if (error) return (
        <View style={styles.errorContainer}>
            <Text>{error.message}</Text>
        </View>
    );

    const post = data.getPost;

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <Image source={{ uri: post.imgUrl }} style={styles.image} />
                    <Text style={styles.postContent}>{post.content}</Text>
                    <Text style={styles.author}>Posted by: {post.author.username} ({post.author.name})</Text>

                    <View style={styles.tagsContainer}>
                        {post.tags.map((tag, index) => (
                            <Text key={index} style={styles.tag}>#{tag}</Text>
                        ))}
                    </View>

                    {post.likes && post.likes.length > 0 && (
                        <View style={styles.likesContainer}>
                            <Image source={require('../assets/like.png')} style={styles.likeIcon} />
                            <Text style={styles.likesCount}>{post.likes.length}</Text>
                        </View>
                    )}

                    <Text style={styles.commentsHeader}>Comments:</Text>
                    {post.comments && post.comments.length > 0 ? (
                        <FlatList
                            data={post.comments}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Text style={styles.comment}>
                                    <Text style={styles.commentUsername}>{item.username}:</Text> {item.content}
                                </Text>
                            )}
                        />
                    ) : (
                        <Text style={styles.noComments}>No comments yet.</Text>
                    )}
                </View>
            </TouchableWithoutFeedback>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={comment}
                    onChangeText={setComment}
                />
                <TouchableOpacity onPress={handleCommentSubmit}>
                    <Image source={require('../assets/reply.png')} style={styles.submitButton} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        marginBottom: 10,
    },
    postContent: {
        fontSize: 16,
        marginVertical: 5,
    },
    author: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
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
    likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    },
    likeIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    likesCount: {
        fontSize: 14,
    },
    commentsHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    comment: {
        fontSize: 14,
        marginVertical: 5,
    },
    commentUsername: {
        fontWeight: 'bold',
    },
    noComments: {
        fontStyle: 'italic',
        color: '#888',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    submitButton: {
        width: 33,
        height: 33,
    }
});
