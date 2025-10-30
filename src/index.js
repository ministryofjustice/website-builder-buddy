const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { Button, TextareaControl, Spinner } = wp.components;
const { Fragment, useState, useRef, useEffect } = wp.element;
const { useDispatch } = wp.data;
const { createBlock } = wp.blocks;

const BuilderBuddySidebar = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: `👋 Hello! I'm Builder Buddy, your friendly Assistant Sidebar. You can chat with me here.  

To search your site, type **"please search"** followed by your query, for example:  

\`please search accessibility\`  

I’ll show you the top 3 search results.`,
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);
    const { editPost } = useDispatch('core/editor');

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    function getMockReply(userText) {
        const lower = userText.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi')) {
            return "Hey there 👋 How’s your post coming along?";
        }
        if (lower.includes('help')) {
            return "Sure! I can help. Try asking me about improving readability or SEO tips.";
        }
        const randomReplies = [
            "Interesting point 🤔",
            "Got it!",
            "That’s a good one!",
            "Tell me more about that...",
            "I’m listening 👂",
        ];
        return randomReplies[Math.floor(Math.random() * randomReplies.length)];
    }

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input.trim();
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');

        // Detect "please search"
        if (userMessage.toLowerCase().startsWith('please search')) {
            const query = userMessage.replace(/please search/i, '').trim();
            if (!query) {
                setMessages((prev) => [...prev, { sender: 'assistant', text: 'Please include a search term!' }]);
                return;
            }
            setIsTyping(true);
            try {

                if (!builderBuddyData?.searchEndpoint) {
                    setMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ No search endpoint is configured in Builder Buddy settings.' }]);
                    setIsTyping(false);
                    return;
                }
                
                const res = await fetch(`${builderBuddyData.searchEndpoint}?search=${encodeURIComponent(query)}&per_page=3`);

                const results = await res.json();
                if (!Array.isArray(results) || results.length === 0) {
                    setMessages((prev) => [...prev, { sender: 'assistant', text: `No results found for "${query}".` }]);
                } else {
                    const jsxResults = results.map((r, i) => (
                        <div key={i} className="builder-buddy-chat-search-result">
                            🔎 <strong>{r.title}</strong><br />
                            <a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a>
                        </div>
                    ));
                    setMessages((prev) => [...prev, { sender: 'assistant', text: jsxResults }]);
                }
            } catch (err) {
                console.error('Search failed:', err);
                setMessages((prev) => [...prev, { sender: 'assistant', text: 'There was an error fetching search results.' }]);
            }
            setIsTyping(false);
            return;
        }

        if (userMessage.toLowerCase().startsWith('please fetch doc')) {
            const docId = userMessage.replace(/please fetch doc/i, '').trim();
            if (!docId) {
                setMessages(prev => [...prev, { sender: 'assistant', text: 'Please include a document ID after "please fetch doc".' }]);
                return;
            }
        
            setIsTyping(true);
            try {
                const apiUrl = `${builderBuddyData.ajaxUrl}?action=fetch_doc&doc_id=${encodeURIComponent(docId)}`;
               
                const res = await fetch(apiUrl);
        
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const result = await res.json();

                if (!result.success || !result.data) {
                    throw new Error('Invalid response from API');
                }
        
                const data = result.data;
        
                const title = data?.source?.title?.trim();
                const text = data?.source?.text?.trim();
        
                if (!title || !text) {
                    throw new Error('Document data missing title or text');
                }
        
                setMessages(prev => [
                    ...prev,
                    {
                        sender: 'assistant',
                        text: (
                            <div>
                                <strong>📄 {title}</strong>
                                <p style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>{text}</p>
                            </div>
                        ),
                    },
                ]);
                
            } catch (error) {
                console.error('Doc fetch failed:', error);
                setMessages(prev => [
                    ...prev,
                    {
                        sender: 'assistant',
                        text: `⚠️ Unable to fetch document "${docId}". Please check the ID or try again later.`,
                    },
                ]);
            }
            setIsTyping(false);
            return;
        }
        

        if (userMessage.toLowerCase().startsWith('please add a section about electric shuffleboard')) {
            setIsTyping(true);
            setTimeout(() => {
                const { insertBlocks } = wp.data.dispatch('core/block-editor');

                const headingBlock = createBlock('core/heading', {
                    level: 2,
                    content: 'Electric Shuffleboard',
                });

                const paragraph1 = createBlock('core/paragraph', {
                    content:
                        'Electric shuffleboard is a modern evolution of the classic bar game, combining interactive technology with precision scoring. It transforms the traditional shuffleboard experience into a high-energy, social competition that’s perfect for groups and events.',
                });

                const paragraph2 = createBlock('core/paragraph', {
                    content:
                        'Venues love it for its sleek design and automated scoring system, which make gameplay faster and more engaging. Whether for a casual night out or competitive league play, electric shuffleboard brings fun and innovation to any setting.',
                });

                const coverBlock = createBlock('core/cover', {
                    url: 'https://www.icsc.com/images/made/c54c2b3e89d2a51d/Inline_image006_1840_1227.jpg',
                    overlayColor: 'black',
                    dimRatio: 30,
                    contentPosition: 'center center',
                }, [
                    headingBlock,
                    paragraph1,
                    paragraph2,
                ]);

                insertBlocks([coverBlock]);

                setMessages((prev) => [
                    ...prev,
                    { sender: 'assistant', text: '✅ Added an Electric Shuffleboard section to your page!' },
                ]);

                setIsTyping(false);
            }, 1200);
            return;
        }

        if (userMessage.toLowerCase().startsWith('please add text about electric shuffle board')) {
            setIsTyping(true);
            setTimeout(() => {
                const blocksToInsert = [
                    createBlock('core/paragraph', {
                        content: 'Electric shuffleboard is an innovative twist on the traditional game, combining technology with classic gameplay. Players can enjoy smoother and faster-paced matches thanks to the electric scoring system.',
                    }),
                    createBlock('core/paragraph', {
                        content: 'This modern version is perfect for indoor venues, offering a fun and competitive experience for friends, families, and enthusiasts alike. Its sleek design makes it a stylish addition to any recreational space.',
                    }),
                ];

                wp.data.dispatch('core/block-editor').insertBlocks(blocksToInsert);

                setMessages((prev) => [
                    ...prev,
                    { sender: 'assistant', text: '✅ Added content about Electric Shuffle Board to the page!' },
                ]);
                setIsTyping(false);
            }, 1200);
            return;
        }

        // Fallback to mock reply
        setIsTyping(true);
        setTimeout(() => {
            const reply = getMockReply(userMessage);
            setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
            setIsTyping(false);
        }, 1200);
    };

    const customIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" id="mdi-clippy" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15,15.5A2.5,2.5 0 0,1 12.5,18A2.5,2.5 0 0,1 10,15.5V13.75A0.75,0.75 0 0,1 10.75,13A0.75,0.75 0 0,1 11.5,13.75V15.5A1,1 0 0,0 12.5,16.5A1,1 0 0,0 13.5,15.5V11.89C12.63,11.61 12,10.87 12,10C12,8.9 13,8 14.25,8C15.5,8 16.5,8.9 16.5,10C16.5,10.87 15.87,11.61 15,11.89V15.5M8.25,8C9.5,8 10.5,8.9 10.5,10C10.5,10.87 9.87,11.61 9,11.89V17.25A3.25,3.25 0 0,0 12.25,20.5A3.25,3.25 0 0,0 15.5,17.25V13.75A0.75,0.75 0 0,1 16.25,13A0.75,0.75 0 0,1 17,13.75V17.25A4.75,4.75 0 0,1 12.25,22A4.75,4.75 0 0,1 7.5,17.25V11.89C6.63,11.61 6,10.87 6,10C6,8.9 7,8 8.25,8M10.06,6.13L9.63,7.59C9.22,7.37 8.75,7.25 8.25,7.25C7.34,7.25 6.53,7.65 6.03,8.27L4.83,7.37C5.46,6.57 6.41,6 7.5,5.81V5.75A3.75,3.75 0 0,1 11.25,2A3.75,3.75 0 0,1 15,5.75V5.81C16.09,6 17.04,6.57 17.67,7.37L16.47,8.27C15.97,7.65 15.16,7.25 14.25,7.25C13.75,7.25 13.28,7.37 12.87,7.59L12.44,6.13C12.77,6 13.13,5.87 13.5,5.81V5.75C13.5,4.5 12.5,3.5 11.25,3.5C10,3.5 9,4.5 9,5.75V5.81C9.37,5.87 9.73,6 10.06,6.13M14.25,9.25C13.7,9.25 13.25,9.59 13.25,10C13.25,10.41 13.7,10.75 14.25,10.75C14.8,10.75 15.25,10.41 15.25,10C15.25,9.59 14.8,9.25 14.25,9.25M8.25,9.25C7.7,9.25 7.25,9.59 7.25,10C7.25,10.41 7.7,10.75 8.25,10.75C8.8,10.75 9.25,10.41 9.25,10C9.25,9.59 8.8,9.25 8.25,9.25Z"/>
        </svg>
    );

    return (
        <Fragment>
            <PluginSidebarMoreMenuItem target="builder-buddy-sidebar" icon={customIcon}>
                Builder Buddy
            </PluginSidebarMoreMenuItem>

            <PluginSidebar name="builder-buddy-sidebar" title="Builder Buddy" icon={customIcon}>
                <div className="builder-buddy-sidebar">
                    <div ref={chatRef} className="builder-buddy-chat-area">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`builder-buddy-chat-message ${msg.sender === 'user' ? 'builder-buddy-user-message' : 'builder-buddy-assistant-message'}`}
                            >
                                {typeof msg.text === 'string' ? msg.text : msg.text}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="builder-buddy-typing-indicator">
                                <Spinner /> Assistant is typing…
                            </div>
                        )}
                    </div>

                    <div className="builder-buddy-input-area">
                        <TextareaControl
                            value={input}
                            onChange={setInput}
                            placeholder="Type your message..."
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button className="builder-buddy-send-button" variant="primary" onClick={handleSend}>
                            Send
                        </Button>
                    </div>
                </div>
            </PluginSidebar>
        </Fragment>
    );
};

registerPlugin('builder-buddy-sidebar', { render: BuilderBuddySidebar });
