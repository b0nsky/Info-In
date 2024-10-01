import { ApolloClient, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apolloClient = new ApolloClient({
    uri: 'https://info-in.ronnybons.space/',
    cache: new InMemoryCache(),
    request: async (operation) => {
        const token = await AsyncStorage.getItem('userData');
        operation.setContext({
            headers: {
                authorization: token ? `Bearer ${token}` : '',
            },
        });
    },
});


export default apolloClient