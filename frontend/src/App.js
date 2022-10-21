import {useEffect, useState} from "react";
import './App.css';
import io from "socket.io-client";
import {v4} from "uuid";

const PORT = 3001
const socket = io(`http://localhost:${PORT}`)

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState("")
  const [room, setRoom] = useState("")
  const [chatIsVisible, setChatIsVisible] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    console.log('connected', socket.connected)
    socket.on('connect', () => {
      setIsConnected(true)
    })
    socket.on('disconnect', () => {
      setIsConnected(false)
    })
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [isConnected])

  useEffect(() => {
    socket.on("receive_msg", ({ user, message }) => {
      const msg = `${user} send: ${message}`
      setMessages(prevState => [msg, ...prevState])
    })
  }, [])

  const handleEnterChatRoom = () => {
    if (user !== "" && room !== "") {
      setChatIsVisible(true)
      socket.emit("join_room", { user, room })
    }
  }

  const handleSendMessage = () => {
    const newMsgData = {
      room: room,
      user: user,
      message: newMessage
    }
    socket.emit("send_msg", newMsgData)
    const msg = `${user} send: ${newMessage}`
    setMessages(prevState => [msg, ...prevState])
    setNewMessage("")
  }

  return (
    <div style={{padding:20}}>
      {!chatIsVisible ?
      <>
        <input
            type="text"
            placeholder="user"
            value={user}
            onChange={e => setUser(e.target.value)}
        />
        <br/>
        <input
            type="text"
            placeholder="room"
            value={room}
            onChange={e => setRoom(e.target.value)}
        />
        <br/>
        <button onClick={handleEnterChatRoom}>enter</button>
      </>
      :
      <>
        <h5>Room: {room} | User: {user}</h5>
        <div style={{
          height:400,
          width:250,
          background: "silver",
          borderRadius:15,
          border:"1px solid #000",
          overflow:"hidden",
          marginBottom:10,
          padding:10
        }}
        >
          {messages.map(el => <div key={v4()}>{el}</div>)}
        </div>
        <input
          type="text"
          style={{
            height: 25,
            background: "silver",
            border: "1px solid #000",
            borderRadius:5
        }}
          placeholder="message"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button style={{ height: 25, marginLeft:5, borderRadius:5, border: "1px solid #000", }} onClick={handleSendMessage}>send message</button>
      </>
      }
    </div>
  );
}

export default App;
