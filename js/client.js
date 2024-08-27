// Initialize Ably with your API key
const ably = new Ably.Realtime('XMmWCg.dqs2Hg:yNquQFQjTSeHiJqoeA_XWN_Xr8ygyQyneBP6tW2RNpM');
const channel = ably.channels.get('chat');

const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    const [name, ...msg] = message.split(':');
    const nameElement = `<span class="username">${name}:</span>`;
    const messageContent = msg.join(':').trim();
    messageElement.innerHTML = `${nameElement} ${messageContent}`;
    document.querySelector(".container").append(messageElement);
    document.querySelector(".container").scrollTop = document.querySelector(".container").scrollHeight;
    if (position === 'left') {
        new Audio('messageringtone.mp3').play();
    }
};

let name;
do {
    name = prompt('Enter your name to join');
} while (!name);

channel.publish('user-joined', { name });

// Handle incoming messages
channel.subscribe('message', (message) => {
    // Check if the message is not sent by the current user
    if (message.data.name !== name) {
        append(`${message.data.name}: ${message.data.message}`, 'left');
    }
});

// Handle user join

channel.subscribe('user-joined', (event) => {
    // Check if the join event is not for the current user
    if (event.data.name !== name) {
        append(`${event.data.name} joined the chat`, 'right');
    }
});


// Handle user leave
channel.subscribe('leave', (event) => {
    append(`${event.data.name} left the chat`, 'right');
});

document.getElementById('send-container').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('messageInp').value;
    append(`You: ${message}`, 'right');
    channel.publish('message', { name, message });
    document.getElementById('messageInp').value = '';
});

window.addEventListener('beforeunload', () => {
    channel.publish('leave', { name });
});
