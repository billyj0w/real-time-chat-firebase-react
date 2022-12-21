import './App.css';
// import SignIn from './components/SignIn';
// import ChatRoom from './components/ChatRoom'

// OLD
// import firebase from 'firebase/app'
// import 'firebase/firestore'
// import 'firebase/auth'
import React, { useRef, useState } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({

})
const auth = firebase.auth();
const firestore = firebase.firestore();
let user = auth.currentUser;

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <div className="wrapper">
        <header>
          <h3>Real Time Chat</h3>
          <div className='currentUser'>
            {user ? <UserInfo user={user} /> : ''}
            <SignOut />
          </div>
        </header>
        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>
      </div>
    </div>
  );
}

function UserInfo(props) {
  const { photoURL, displayName } = props.user;
  return (
    <>
      <img src={photoURL} />
      <p>Bem Vindo {displayName}!</p>
    </>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div className="sign-in">
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='btn btn-signout' onClick={() => auth.signOut()}>Sign out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', "desc").limit(30);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const sendMessage = async (e) => {
    e.preventDefault();
    if (formValue == '') {
      return
    }
    const { uid, photoURL, displayName } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <div className='chat-room'>
      <div className='messages'>
        {messages && messages.map(msg => {
          return (
            <div className='msg'>
              {/* {new Date(msg.createdAt.nanoseconds).toLocaleString()} */}
              <ChatMessage key={msg.id} message={msg} name={msg.displayName} />
            </div>
          )
        }).reverse()}
        <div ref={dummy}></div>
      </div>
      <div className='sent-message'>
        <form onSubmit={sendMessage}>
          <input
            maxlength="30"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)} />
          <button className='btn btn-sent' type='submit'>submit</button>
        </form>
      </div>
    </div>
  )
}
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`msg-text message-${messageClass}`}>
        <img src={photoURL} />
        <div className='text'>
          <p>{text}</p>
          <p className='text-name'>{displayName}</p>
        </div>
    </div>
  )
}
export default App;
