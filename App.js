/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';

import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      isSigninInProgress: false,
      permissionResult: '',
      userInfo: {},
    }
  }

  componentDidMount() {
    GoogleSignin.configure();
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(JSON.stringify(userInfo));
      this.setState({ userInfo, signedIn: true });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({ userInfo: null, signedIn: false, permissionResult: '' }); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };

  _getMoviesFromApiAsync = async () => {
    if(this.state.userInfo.user === undefined){
      this.setState({
        permissionResult: `Error: no user. Try logging in.`
      });
      return;
    }
    return fetch('https://1c5w5ogswe.execute-api.us-west-2.amazonaws.com/api/',
      {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({email: this.state.userInfo.user.email})
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        console.log(this);
        if(responseJson.mac_address) {
          this.setState({
            permissionResult: `Authorized ${responseJson.mac_address}`
          });
        } else {
          this.setState({
            permissionResult: `Error: ${responseJson.error}`
          });
        }

      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
      {this.state.signedIn ? (
          <Button style={{ top: 30, height: 48 }} title="Sign Out" onPress={this._signOut}/>
        )
        :
        (
          <GoogleSigninButton
            style={{ width: 200, height: 48, top: 30 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this._signIn}
            disabled={this.state.isSigninInProgress}
          />
        )
      }

          <View style={{...styles.containerLeft, top: 35}}>
            {
              this.state.userInfo ? (
              Object.keys(this.state.userInfo).map((key) => {
                return(
                  <View key={key}>
                    <Text numberOfLines={1} style={{ textAlign: "left" }}>{key}: {String(this.state.userInfo[key])}</Text>
                  </View>
                  )
                })
              )
              :
              null
            }
          </View>

          {
            this.state.signedIn ? (
              <React.Fragment>
                <Text>{this.state.permissionResult}</Text>
                <Button title="Check MAC Authorization" onPress={this._getMoviesFromApiAsync}>test</Button>
              </React.Fragment>
            )
            :
            null
          }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#F5FCFF',
    padding: 10
  },
  containerLeft: {
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
