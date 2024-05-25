import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, View, Text } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to set the token
const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Failed to save token', error);
  }
};

// Function to get the token
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Failed to fetch token', error);
  }
};

const configureBackgroundFetch = () => {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // Fetch interval in minutes
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId) => {
      console.log('[BackgroundFetch] taskId: ', taskId);

      const token = await getToken();

      if (token) {
        // Simulate fetching messages and sending to the server
        const messages = [
          {
            sender: '+1234567890',
            body: 'Test message',
            timestamp: new Date().toISOString(),
          },
        ];

        messages.forEach((message) => {
          axios.post(
            'http://your-api-url/api/receive_message/',
            message,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          )
          .then(response => {
            console.log('Message synced:', response.data);
          })
          .catch(error => {
            console.error('Failed to sync message:', error);
          });
        });
      }

      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.error('[BackgroundFetch] failed to configure: ', error);
    }
  );

  // Start BackgroundFetch
  BackgroundFetch.start();
};

const App = () => {
  useEffect(() => {
    // Function to request necessary permissions
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          ]);
          if (
            granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('SMS permissions granted');
          } else {
            console.log('SMS permissions denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    // Request permissions and configure background fetch
    requestPermissions();
    configureBackgroundFetch();
  }, []);

  return (
    <View>
      <Text>Welcome to SMS Sync App</Text>
    </View>
  );
};

export default App;