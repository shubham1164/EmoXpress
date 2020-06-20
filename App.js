/* eslint-disable no-alert */
/* eslint-disable radix */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
} from 'react-native';

const App = () => {
  const [ip, setIp] = useState('192.168.1.5');
  const [port, setPort] = useState('8000');
  const [delay, setDelay] = useState('2000');
  const [time, setTime] = useState();
  const [emotionsData, setEmotionsData] = useState([]);
  const [timerRef, setTimerRef] = useState();

  const getDataFromServer = async () => {
    try {
      const url = `http://${ip}:${port}/api/output`;
      const {data} = await axios.get(url);
      const keys = Object.keys(data.emotion);
      let dataArray = [];
      keys.map(k => {
        dataArray.push({
          name: k,
          value: data.emotion[k],
        });
      });
      setEmotionsData(dataArray);
      setTime(new Date().toTimeString().substring(0, 8));
    } catch (e) {
      setEmotionsData([]);
      clearInterval(timerRef);
    }
  };

  const onStart = () => {
    // This will try to refresh the data from the server after every delay time
    if (
      (ip?.length || port?.length || delay?.length) &&
      !isNaN(parseInt(delay))
    ) {
      const ref = setInterval(() => getDataFromServer(), parseInt(delay));
      setTimerRef(ref);
    } else {
      alert('All 3 values are required');
    }
  };

  const onStop = () => {
    // This will stop the server
    setEmotionsData([]);
    clearInterval(timerRef);
  };

  const getPercent = v => Math.floor((parseFloat(v) * 100) / 5);

  const renderOutput = ({item}) => {
    // This is the UI for individual list row item
    return (
      <View style={{marginHorizontal: 20}}>
        <View style={styles.emotion}>
          <Text style={{fontSize: 20}}>{item.name}</Text>
          <Text>
            {parseFloat(item.value).toFixed(2) +
              ' (' +
              getPercent(item.value) +
              '%)'}
          </Text>
        </View>
        <Progress.Bar
          progress={getPercent(item.value) / 100}
          width={null}
          height={10}
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>EmoXpress</Text>
          <View style={{flex: 1}} />
          {emotionsData.length > 0 && (
            <Button onPress={onStop} title="Stop" color={'red'} />
          )}
        </View>
        {/* Settings */}
        {emotionsData.length === 0 && (
          <View>
            <TextInput
              style={styles.textInputIP}
              onChangeText={text => setIp(text)}
              placeholder={'IP = 192.168.1.1'}
              value={ip}
            />
            <TextInput
              style={styles.textInputPort}
              onChangeText={text => setPort(text)}
              placeholder={'Port = 8000'}
              value={port}
            />
            <TextInput
              style={styles.textInputTimer}
              onChangeText={text => setDelay(text)}
              placeholder={'Time in ms'}
              value={delay}
            />
            <Button onPress={onStart} title="Start" />
          </View>
        )}
        {/* Status */}
        <Text style={styles.error}>{`Status: ${
          emotionsData.length ? `Connected\nRefreshed at ${time}` : 'Not connected'
        }`}</Text>
        {/* Output */}
        <FlatList
          data={emotionsData}
          renderItem={renderOutput}
          keyExtractor={item => item.name}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingLeft: 20,
    paddingRight: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 28,
  },
  textInputIP: {
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 250,
    marginTop: 100,
  },
  textInputPort: {
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 150,
    marginTop: 20,
  },
  textInputTimer: {
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 150,
    marginTop: 20,
    marginBottom: 10,
  },
  error: {
    marginTop: 20,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
  },
  emotion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
});

export default App;
