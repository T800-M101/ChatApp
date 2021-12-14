//////////////////// IMPORTS /////////////////////////////////////////////
const socket = io();

/////////////////////// SELECTORS ///////////////////////////////////////
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages');



//////////////////////////// TEMPLATES ///////////////////////////////////////
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


///////////////////// OPTIONS ///////////////////////////////////////////////////
// Getting the query strings from the url
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });



////////////////// SENDING VALUE FROM INPUT TO SERVER ///////////////////////////////////////////
// Listening event from html form
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Disable the submit button
  $messageFormButton.setAttribute('disabled','disabled');


  
  // Getting values from input
  const message = e.target.elements.message.value;
 /* Emiting value to the server
    socket.emit receives 3 arguments:
    1. The identidier 
    2. The object to emit 
    3. A callback to notify the delivering.
 */
  socket.emit('sendMessage', message, (profanity) => {

  // Reenable the submit button
  $messageFormButton.removeAttribute('disabled');
  $messageFormInput.value = "";
  $messageFormInput.focus();


    if(profanity){
        return console.log(profanity);
    }
      console.log('The message was delivered!');

  });

});


const autoscroll = () => {
   // Get new message element
   const $newMessage = $messages.lastElementChild;


   // Get the hight of the new message
   const newMessageStyles = getComputedStyle($newMessage);
   const newMessageMargin = parseInt(newMessageStyles.marginBottom);
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

   // Get visible hight
   const visibleHeight = $messages.offsetHeight;
   
   // Get height of messages container
   const containerHeight = $messages.scrollHeight;

   // How far have I scroll?
   const scrollOffset = $messages.scrollTop + visibleHeight;

   if(containerHeight - newMessageHeight <= scrollOffset){
       $messages.scrollTop = $messages.scrollHeight;
   }

   
};

// Listening value from the server using the ifentifier and receiving the object to work with
socket.on('message', ({ username, text, createdAt }) => {
    
    // Rendering messages in the application
    const html = Mustache.render(messageTemplate,{
        user:username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});




///////////////////////// SENDING LOCATION //////////////////////////////////////////////////
// Getting position from browser
$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    
    $sendLocationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition( (position) => {
       
    // Sending position to server
       socket.emit('sendLocation', {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
           
       }, () => {
           console.log('Location shared!');
           $sendLocationButton.removeAttribute('disabled');

       });

        
   });
    
});

// Listening position from the server bradcasting
socket.on('coords', ({username, url, createdAt}) => {
   
    const html = Mustache.render(locationTemplate,{
        
        user:username,
        url:url,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

//////////////// PUPULATING SIDEBAR /////////////////////////////////////
socket.on('roomData', ({room, usersList}) => {
    console.log(usersList);
    console.log(room);
  const html = Mustache.render(sidebarTemplate,{
      room,
      usersList
  });
  document.querySelector('#sidebar').innerHTML = html;
});


//////////////////////////////////////////////////////////////////////////////////////////////////
// Sending userand room to the server
socket.emit('join', { username, room},(error) => {
   if(error){
       alert(error);
       location.href = '/';
   }
});



