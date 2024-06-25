import React, { useEffect, useRef, useState } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';
import upload from '../../lib/upload'; // Ensure the correct import path

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!chatId) return;

    const chatRef = doc(db, "chats", chatId);

    const unSub = onSnapshot(chatRef, (res) => {
      console.log("Chat snapshot:", res.data());
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;
    const chatRef = doc(db, "chats", chatId);
    const chatSnapshot = await getDoc(chatRef);

    if (!chatSnapshot.exists()) {
      await setDoc(chatRef, { messages: [] });
    }

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
      console.log("Message sent:", text);

      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(c => c.chatId === chatId);

          if (chatIndex > -1) {
            userChatData.chats[chatIndex].lastMessage = text;
            userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatData.chats[chatIndex].updatedAt = Date.now();
          } else {
            userChatData.chats.push({
              chatId,
              lastMessage: text,
              isSeen: id === currentUser.id,
              updatedAt: Date.now(),
            });
          }

          await updateDoc(userChatRef, {
            chats: userChatData.chats,
          });
          console.log("User chat updated for user:", id);
        }
      }

      setText(""); // Clear the text input after sending the message
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setImg({
      file: null,
      url: "",
    });
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username || "Unknown User"}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div key={index} className={`message ${message.senderId === currentUser.id ? 'own' : ''}`}>
            <div className="texts">
              <p>{message.text}</p>
              <span>{new Date(message.createdAt.toDate()).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Attachment" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        {isCurrentUserBlocked || isReceiverBlocked ? (
          <div className="blocked-message">
            <p>You cannot send messages because {isCurrentUserBlocked ? "you are blocked" : "the receiver is blocked"}.</p>
          </div>
        ) : (
          <>
            <div className="icons">
              <label htmlFor="file">
                <img src="./img.png" alt="Image" />
              </label>
              <input type="file" id="file" style={{ display: 'none' }} onChange={handleImg} />
              <img src="./camera.png" alt="Camera" />
              <img src="./mic.png" alt="Mic" />
            </div>
            <input
              type="text"
              value={text}
              placeholder='Type a message...'
              onChange={e => setText(e.target.value)}
            />
            <div className="emoji">
              <img src="./emoji.png" alt="Emoji" onClick={() => setOpen(open => !open)} />
              {open && (
                <div className="picker">
                  <EmojiPicker onEmojiClick={handleEmoji} />
                </div>
              )}
            </div>
            <button className='sendButton' onClick={handleSend}>Send</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
