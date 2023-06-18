import { useContext, useEffect, useState, useRef } from 'react';
import './Chat.scss';
import { UserContext } from './UserContext';
import { uniqBy } from 'lodash';
import axios from 'axios';

export const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { username, id, setUsername, setId } = useContext(UserContext);
  const messagesRef = useRef(null);

  useEffect(() => {
    const handleMessage = (e) => {
      const messageData = JSON.parse(e.data);
      if ('online' in messageData) {
        showOnlineUsers(messageData.online);
      } else {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };
  
    const ws = new WebSocket('ws://localhost:3001');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
  
    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, messages]);

  const showOnlineUsers = (users) => {
    const people = {};
    users.map((user) => {
      people[user.userId] = user.username;
    });
    setOnlineUsers(people);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUser,
        text: textMessage,
      })
    );
    setTextMessage('');
    setMessages((prev) => [
      ...prev,
      {
        text: textMessage,
        isOur: true,
        sender: id,
        recipient: selectedUser,
        _id: Date.now(),
      },
    ]);
  };

    const messagesWithoutDupes = uniqBy(
      messages.filter((message) => message.sender === selectedUser || message.recipient === selectedUser),
      '_id'
    );

    function scrollToBottom() {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }
  
    useEffect(() => {
      const fetchMessages = async () => {
        if (selectedUser) {
          try {
            const response = await axios.get('/messages/' + selectedUser);
            setMessages(response.data);
          } catch (error) {
            console.error(error);
          }
        }
      };
  
      fetchMessages();
    }, [selectedUser]);
  
    const onlineUsersExUs = { ...onlineUsers };
    delete onlineUsersExUs[id];

    const handleSubmit = (e) => {
      e.preventDefault()
      axios.post('/logout').then(() => {
        setWs(null)
        setId(null)
        setUsername(null)
      })
    }

    return (
        <div className="chat">
            <div className="contacts">
                <h1>My CHAT APP</h1>
                {Object.keys(onlineUsersExUs).map(userId => (<div className='user' onClick={() => {setSelectedUser(userId); scrollToBottom()}} style={userId === selectedUser ? {backgroundColor: '#4267B2'} : null} key={userId}><hr/>
                    <h3>{onlineUsers[userId]}</h3>
                </div>))}
                <hr/>
                <form onSubmit={handleSubmit}>
                  <button type='submit' className='logout'>Logout</button>
                </form>
            </div>
            <form onSubmit={sendMessage} className="messages">
              <div className='top'>
                <h3 className='selectedUser'>{onlineUsers[selectedUser]}</h3>
              </div>
              <div className='bottom'>
              {selectedUser === '' ? <h1>Select a Contact to chat with them</h1> : 
                <div className='userChat'>
                    
                    <div className='chats'  ref={messagesRef}>
                    {messagesWithoutDupes.map(message => (
                            <div className={message.sender === id ? 'sender' : 'recipient'}>
                                {message.text}
                            </div>
                        ))}
                </div>
                </div>
                }
              </div>

                <input type="text" value={textMessage} onChange={e => setTextMessage(e.target.value)} placeholder='Message...'/>
                <button type='submit'>Send</button>
            </form>
        </div>
    )
}