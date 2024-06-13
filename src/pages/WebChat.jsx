import React, { useContext, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { RiRobot2Line } from "react-icons/ri";
import { LuSendHorizonal } from "react-icons/lu";
import { VscClearAll } from "react-icons/vsc";
import axios from 'axios';
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";
import { useParams } from "react-router-dom";

const ChatContainer = styled.div`
 display: flex;
 flex-direction: column;
 height: 500px;
 margin: 15px auto 0px auto;
 border: 1px solid #ccc;
 border-radius: 8px;
 overflow: hidden;
 background-color: #ffffff;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
 width: 100%;
 max-width:400px;
 position: fixed;
 bottom: 20px;
 right: 20px;


`;

const Header = styled.div`
 background-color: white;
 color: black;
 padding: 10px;
 display: flex;
 justify-content: space-between;
 align-items: center;
 font-family: Arial, Helvetica, sans-serif;
 border-bottom: 1px solid #ccc;
`;

const MessageList = styled.div`
 flex: 1;
 overflow-y: auto;
 padding: 10px;
`;

const MessageItem = styled.div`
display: flex;
align-items: flex-start;
margin-bottom: 10px;
${(props) =>
    props.isUser ? "justify-content: ;" : "justify-content: flex-end;"}
flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")}; /* Adjust direction based on user */
`;


const MessageContent = styled.div`
background-color: ${(props) => (props.isUser ? "#e0e0e0" : "#0000")};
color: #333;
padding: 10px;
border-radius: 18px;
max-width: 80%;
display: flex;
align-items: center;
/*box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);*/
margin-right:30px;
`;


const Avatar = styled.div`
 width: 32px;
 height: 32px;
 background-color: #6f6f6f;
 border-radius: 50%;
 display: flex;
 justify-content: center;
 align-items: center;
 color: #fff;
 font-weight: bold;
 margin-right: 10px;
 margin-top: 10px;
`;

const InputContainer = styled.div`
 display: flex;
 align-items: center;
 padding: 10px;
 border-top: 1px solid #ccc;
`;

const MessageInput = styled.input`
 flex: 1;
 padding: 10px;
 border: none;
 outline: none;
 font-size: 14px;
 background-color: white;
 border-radius: 18px;
 padding-left: 15px;
`;

const SendButton = styled.button`
 background-color: transparent;
 border: none;
 cursor: pointer;
 padding: 5px 10px;
`;

const SendIcon = styled.span`
 font-size: 18px;
 color: grey;
`;

const TypingLoader = styled.div`
 display: flex;
 justify-content: center;
 align-items: center;
 height: 20px;
 margin: 5px 0;

 div {
   width: 8px;
   height: 8px;
   margin: 0 2px;
   background-color: #b1092a;
   border-radius: 50%;
   animation: bounce 1.5s infinite ease-in-out;
 }

 div:nth-child(1) {
   animation-delay: -0.32s;
 }
 div:nth-child(2) {
   animation-delay: -0.16s;
 }
 @keyframes bounce {
   0%, 80%, 100% {
     transform: scale(0);
   }
   40% {
     transform: scale(1);
   }
 }
`;

const ClearChatDialog = styled.div`
 position: fixed;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 background: white;
 border: 1px solid #ccc;
 padding: 20px;
 z-index: 1000;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
`;

const DialogButton = styled.button`
 margin: 5px;
 padding: 10px 20px;
 border: none;
 border-radius: 5px;
 cursor: pointer;
 ${(props) => (props.confirm ? 'background-color: #b1092a; color: white;' : 'background-color: #393939; color: white;')}
`;

const Launcher = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #b1092a;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 1px 0 4px hsla(0, 0%, 9%, .3);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 999;
`;

const GreetingMessage = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  background-color: #b1092a;
  color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: fixed;
  bottom: 180px;
  right: 20px;
  background: white;
  right: 0;
  border: 1px solid transparent;
  padding: 3px 7px 3px 3px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: #161616;
  font-size: 13px;
  margin-bottom: 5px;
  margin-right:10px;
  
`;

const WebChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);
//   const { addNewNotifcation, user } = useContext(Context)
  const { subOragID } = useParams()

  useEffect(() => {
    // const greetingShown = sessionStorage.getItem('greetingShown');
    // if (!greetingShown) {
    const timer = setTimeout(() => {
      setShowGreeting(true);
      // sessionStorage.setItem('greetingShown', 'true');
    }, 5000);
    return () => clearTimeout(timer);
    // }
  }, []);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const MessageConstructor = (messages) => {
    let constructedMessage = messages.map(message => `${message.role === "user" ? "<|user|>" : "<|assistant|>"}\n${message.content}`).join("\n");

    console.log(constructedMessage + "\n");
    return constructedMessage
  };

  //Rag 
  const handleQuery = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('organization_id', '64f9f31ab8f2b3a65cbfc48d');
    formData.append('sub_organization_id', '6639b5b112bba60113cde5c0');
    formData.append('query', inputMessage);

    try {
      let fromRag = ""
      const res = await axios.post(`https://app.coolriots.ai/projecto/api/v1/embedding_api_service/query_data/`, formData);

      for (const passage of res.data.data.documents) {
        fromRag += passage.page_content + '\n'
      }
      console.log('RAG Query response', fromRag);
      return fromRag
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage = {
      content: inputMessage,
      role: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const relatedPassages = await handleQuery() // Assume relatedPassages is derived from context
    //Prompting 

    let prompt =
      `<|system|>
 You are an assistant for Web Engagement, a specialized Retrieval Augmented Generation (RAG) assistant. You respond to questions that the user is asking about a RAG document.You respond to greetings such as "Hi", "Hello", "Good day!" and etc with "Hi, I am BeX Assistant Digital Concierge. How can I help you today?". Please do not say anything else and do not start a conversation.${relatedPassages ? `\n[Document]\n${relatedPassages}` : ""}
 ${messages.length > 0 ? `${MessageConstructor(messages)}\n` : ""}<|user|>
 ${inputMessage}
 <|assistant|>
 `;
    console.log(prompt);

    //LLM 

    try {
      const llmResp = await axios.post(
        "https://app.coolriots.ai/projecto/api/v1/model/foundationModel/experiment?mode=freeMode",
        {
          prompt: prompt,
          modelId: "ibm/granite-13b-chat-v2",
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 800,
            min_new_tokens: 0,
            repetition_penalty: 1,
          },
          query: "",
        }
      );

      const newMessage = {
        content: llmResp.data.prediction,
        role: "assistant",
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterPressed = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChatClick = () => {
    setShowClearChatDialog(true);
  };

  const handleClearChat = () => {
    setShowClearChatDialog(false);
    setMessages([]);
  };

  const handleContinueChat = () => {
    setShowClearChatDialog(false);
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleChat = () => {
    setShowChat(!showChat);
    setShowGreeting(false);
  };

  const closeChat = () => {
    setShowChat(false);
  };

  const closeGreeting = () => {
    setShowGreeting(false);
  };

  return (
    <>
      {showGreeting && (
        <>

          <GreetingMessage>
            <CloseButton onClick={closeGreeting}>
              <AiOutlineClose size={10} />Close
            </CloseButton>


            <span>Hi, I am BeX Assistant <br></br>Digital Concierge.<br></br> How can I help you?</span>
            <SendButton onClick={toggleChat}>
            </SendButton>
          </GreetingMessage>
        </>
      )}
      {!showChat && !showGreeting && (
        <Launcher onClick={toggleChat}>
          <HiArrowTopRightOnSquare size={24} />
        </Launcher>
      )}
      {showChat && (
        <ChatContainer>
          <Header>
            <span>Bex Assistant</span>
            <button onClick={closeChat} style={{ background: 'none', marginLeft: '65%', border: 'none', cursor: 'pointer', color: 'black' }}>
              <AiOutlineClose /></button>
            <button onClick={handleClearChatClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'black', textDecoration: 'none' }}><VscClearAll /></button>
          </Header>
          <MessageList ref={messageListRef}>
            {messages.map((message, index) => (
              <MessageItem key={index} isUser={message.role === "user"}>
                {message.role !== "user" && <Avatar><RiRobot2Line /></Avatar>}
                <MessageContent isUser={message.role === "user"}>
                  {message.content}
                </MessageContent>
              </MessageItem>
            ))}
            {isLoading && (
              <MessageItem>
                <TypingLoader>
                  <div></div>
                  <div></div>
                  <div></div>
                </TypingLoader>
              </MessageItem>
            )}
          </MessageList>
          <InputContainer>
            <MessageInput
              ref={inputRef}
              type="text"
              placeholder="Type something..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleEnterPressed}
            />
            <SendButton onClick={handleSendMessage}>
              <SendIcon><LuSendHorizonal /></SendIcon>
            </SendButton>
          </InputContainer>
        </ChatContainer>
      )}
      {showClearChatDialog && (
        <ClearChatDialog>
          <h3>End Chat</h3>
          <p>Are you sure you want to clear the chat?</p>
          <div>
            <DialogButton confirm onClick={handleClearChat}>
              Yes
            </DialogButton>
            <DialogButton onClick={handleContinueChat}>
              No
            </DialogButton>
          </div>
        </ClearChatDialog>
      )}
    </>
  );
};

export default WebChat;