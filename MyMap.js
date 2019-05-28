import React, { Component } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardText, Button } from 'reactstrap';

import userLocationURL from './blue_mtb.svg';
import messageLocationURL from './red_bike.svg';

import MessageCardForm from './MessageCardForm';
import { getMessages, getLocation, sendMessage } from './API';

import mapStyles from './map.module.scss';

const myIcon = L.icon({
  iconUrl: userLocationURL,
  iconSize: [50, 82]
});

const messageIcon = L.icon({
  iconUrl: messageLocationURL,
  iconSize: [50, 82]
});

export default class MyMap extends Component {
    state = {
        location: {
          lat: 52.52437,
          lng: 13.41053,
        },
        haveUsersLocation: false,
        zoom: 11.5,
        userMessage: {
          name: '',
          message: ''
        },
        showMessageForm: false,
        sendingMessage: false,
        sentMessage: false,
        messages: []
      }
    
      componentDidMount() {
        getMessages()
          .then(messages => {
            this.setState({
              messages
            });
          });
      }

      showMessageForm = () => {
        this.setState({
          showMessageForm: true
        });
        getLocation()
        .then(location => {
          this.setState({
            location,
            haveUsersLocation: true,
            zoom: 13
          });
        });
      }
    
      cancelMessage = () => {
        this.setState({
          showMessageForm: false
        });
      }
    
      formIsValid = () => {
        let { name, message } = this.state.userMessage;
        name = name.trim();
        message = message.trim();
    
        const validMessage =
          name.length > 0 && name.length <= 500 &&
          message.length > 0 && message.length <= 500;
    
        return validMessage && this.state.haveUsersLocation ? true : false;
      }
    
      formSubmitted = (event) => {
        event.preventDefault();
        
        if (this.formIsValid()) {
          this.setState({
            sendingMessage: true
          });
    
          const message = {
            name: this.state.userMessage.name,
            message: this.state.userMessage.message,
            latitude: this.state.location.lat,
            longitude: this.state.location.lng,
          };
    
          sendMessage(message)
            .then((result) => {
              setTimeout(() => {
                this.setState({
                  sendingMessage: false,
                  sentMessage: true
                });
              }, 4000);
            });
        }
      }
    
      valueChanged = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
          userMessage: {
            ...prevState.userMessage,
            [name]: value
          }
        }))
      }

    render() {
        
     const position = [this.state.location.lat, this.state.location.lng]
  
      if (typeof window !== 'undefined') {
              return (
                <div className={mapStyles.map}>
        <Map
          className={mapStyles.map}
          worldCopyJump={true}
          center={position}
          zoom={this.state.zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            this.state.haveUsersLocation ? 
            <Marker
              position={position}
              icon={myIcon}>
            </Marker> : ''
          }
          {this.state.messages.map(message => (
            <Marker
              key={message._id}
              position={[message.latitude, message.longitude]}
              icon={messageIcon}>
              <Popup>
                <p><em>{message.name}:</em> {message.message}</p>
                { message.otherMessages ? message.otherMessages.map(message => <p key={message._id}><em>{message.name}:</em> {message.message}</p>) : '' }
              </Popup>
            </Marker>
          ))}
          
        </Map>
        {
          !this.state.showMessageForm ?
          <Button className={mapStyles.messageForm} onClick={this.showMessageForm} color="info">Add a Message</Button> :
          !this.state.sentMessage ?
          <MessageCardForm
            cancelMessage={this.cancelMessage}
            showMessageForm={this.state.showMessageForm}
            sendingMessage={this.state.sendingMessage}
            sentMessage={this.state.sentMessage}
            haveUsersLocation={this.state.haveUsersLocation}
            formSubmitted={this.formSubmitted}
            valueChanged={this.valueChanged}
            formIsValid={this.formIsValid}
          /> :
          <Card body id={mapStyles.thanksForm}>
            <CardText>Thanks for submitting a message!</CardText>
          </Card>
        }
        
        </div>
      )
      }
      return null
    }
  }