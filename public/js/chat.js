const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild


    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom )
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages conteiner
    const conteinerHeight = $messages.scrollHeight

    //How long have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(conteinerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageHeight);
}
 
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment (message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        username: location.username, 
        url: location.url,
        createdAt: moment (location .createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll( )
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const text = e.target.elements.message.value;

    socket.emit('sendMessage', text, (message) => { 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //eable
         console.log('The message was delivered!', message);
    })
})


$messageLocation.addEventListener('click', (e) => {
   if(!navigator.geolocation) {
       return alert('It is not supported for u browser ')
   }

   $messageLocation.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position) => {
    //    console.log(position);
       socket.emit('sendLocation', {
           lat: position.coords.latitude,
           long: position.coords.longitude
       },  () => {
            $messageLocation.removeAttribute('disabled')
           console.log('location shared exalent')
       })
   })
})

socket.emit('join', {username, room }, (error) => {
     if(error) {
         alert(error)
         location.href = '/'
     }
})

// socket.on('countUpdated', (count) => {
//     console.log('chang updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')

//     socket.emit('increment')
// })