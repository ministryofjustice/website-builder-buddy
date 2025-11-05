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
            text: `Hello! I'm Builder Buddy, your friendly assistant. You can chat with me here.`,
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

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input.trim();
    
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsTyping(true);
    
        try {
            // Send to WordPress AJAX
            const res = await fetch(builderBuddyData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: new URLSearchParams({
                    action: 'ask_builder_buddy',
                    nonce: builderBuddyData.nonce,
                    message: userMessage,
                }),
            });
    
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const result = await res.json();

            if (!result.success || !result.data) {
                throw new Error('Invalid response from API');
            }

            const data = result.data;
    
            // Check if response structure is valid
            if (!data || typeof data !== 'object') throw new Error('Invalid response format');
    
            const answer = data.answer || 'I wasn’t able to find an answer for that.';
            const sources = Array.isArray(data.sources) ? data.sources : [];
    
            const messageElements = [];
    
            // Main assistant answer
            messageElements.push(
                <div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
                </div>
            );
    
            // Add sources if provided
            if (sources.length > 0) {
                const sourceList = sources.map((src, i) => (
                    <div key={i} className="builder-buddy-source">
                        <a href={src.url} target="_blank" rel="noopener noreferrer">
                            {src.title || 'Untitled source'}
                        </a>
                    </div>
                ));
    
                messageElements.push(
                    <div style={{ marginTop: '10px' }}>
                        <strong>Sources:</strong>
                        <div>{sourceList}</div>
                    </div>
                );
            }
    
            // Append the final assistant message
            setMessages((prev) => [
                ...prev,
                { sender: 'assistant', text: messageElements },
            ]);
        } catch (error) {
            console.error('Builder Buddy request failed:', error);
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'assistant',
                    text: 'Sorry, I had trouble reaching the Builder Buddy service. Please try again.',
                },
            ]);
        }
    
        setIsTyping(false);
    };
  /*  
    const customIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" id="mdi-clippy" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15,15.5A2.5,2.5 0 0,1 12.5,18A2.5,2.5 0 0,1 10,15.5V13.75A0.75,0.75 0 0,1 10.75,13A0.75,0.75 0 0,1 11.5,13.75V15.5A1,1 0 0,0 12.5,16.5A1,1 0 0,0 13.5,15.5V11.89C12.63,11.61 12,10.87 12,10C12,8.9 13,8 14.25,8C15.5,8 16.5,8.9 16.5,10C16.5,10.87 15.87,11.61 15,11.89V15.5M8.25,8C9.5,8 10.5,8.9 10.5,10C10.5,10.87 9.87,11.61 9,11.89V17.25A3.25,3.25 0 0,0 12.25,20.5A3.25,3.25 0 0,0 15.5,17.25V13.75A0.75,0.75 0 0,1 16.25,13A0.75,0.75 0 0,1 17,13.75V17.25A4.75,4.75 0 0,1 12.25,22A4.75,4.75 0 0,1 7.5,17.25V11.89C6.63,11.61 6,10.87 6,10C6,8.9 7,8 8.25,8M10.06,6.13L9.63,7.59C9.22,7.37 8.75,7.25 8.25,7.25C7.34,7.25 6.53,7.65 6.03,8.27L4.83,7.37C5.46,6.57 6.41,6 7.5,5.81V5.75A3.75,3.75 0 0,1 11.25,2A3.75,3.75 0 0,1 15,5.75V5.81C16.09,6 17.04,6.57 17.67,7.37L16.47,8.27C15.97,7.65 15.16,7.25 14.25,7.25C13.75,7.25 13.28,7.37 12.87,7.59L12.44,6.13C12.77,6 13.13,5.87 13.5,5.81V5.75C13.5,4.5 12.5,3.5 11.25,3.5C10,3.5 9,4.5 9,5.75V5.81C9.37,5.87 9.73,6 10.06,6.13M14.25,9.25C13.7,9.25 13.25,9.59 13.25,10C13.25,10.41 13.7,10.75 14.25,10.75C14.8,10.75 15.25,10.41 15.25,10C15.25,9.59 14.8,9.25 14.25,9.25M8.25,9.25C7.7,9.25 7.25,9.59 7.25,10C7.25,10.41 7.7,10.75 8.25,10.75C8.8,10.75 9.25,10.41 9.25,10C9.25,9.59 8.8,9.25 8.25,9.25Z"/>
        </svg>
    );*/

    const customIcon = (
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
        width="300.000000pt" height="333.000000pt" viewBox="0 0 300.000000 333.000000"
        preserveAspectRatio="xMidYMid meet">
       
       <g transform="translate(0.000000,333.000000) scale(0.100000,-0.100000)"
       fill="currentColor" stroke="none">
       <path d="M436 3295 c-58 -20 -104 -71 -122 -132 -14 -48 -14 -58 0 -106 26
       -89 93 -139 189 -141 l60 -2 41 -64 c23 -36 50 -79 60 -96 l18 -31 -50 -62
       c-116 -144 -201 -355 -218 -539 l-7 -71 -45 -3 -46 -3 -13 -50 c-21 -82 -44
       -259 -41 -311 l3 -49 72 -3 72 -3 -39 -52 c-52 -69 -70 -124 -70 -218 l0 -77
       -99 -4 c-107 -3 -132 -13 -175 -72 -20 -26 -21 -40 -21 -336 0 -296 1 -310 21
       -336 43 -58 67 -68 173 -72 l99 -4 4 -112 c3 -96 8 -118 30 -161 49 -93 134
       -156 240 -175 36 -7 370 -10 964 -8 l909 3 62 29 c72 33 135 95 166 164 16 36
       22 73 25 153 l4 107 97 4 c108 4 138 16 172 71 18 30 19 48 17 349 l-3 316
       -25 27 c-38 42 -80 55 -173 55 l-85 0 -4 93 c-5 103 -28 164 -83 222 l-32 34
       56 3 56 3 -3 105 c-1 63 -11 145 -25 205 l-22 100 -46 3 -46 3 -7 71 c-16 171
       -82 348 -187 497 l-38 54 23 31 c13 17 42 64 66 104 l42 72 52 0 c177 0 268
       196 153 327 -102 116 -302 66 -335 -84 -11 -49 -2 -112 22 -147 9 -14 16 -30
       16 -35 0 -10 -85 -157 -101 -175 -4 -5 -41 19 -82 53 -89 73 -213 150 -293
       180 l-59 22 3 68 4 68 -69 17 c-37 9 -99 21 -138 26 -134 19 -278 10 -428 -26
       l-69 -17 4 -68 3 -68 -59 -22 c-71 -27 -205 -106 -268 -159 l-46 -40 -55 86
       -55 86 24 52 c26 57 30 96 12 147 -19 55 -55 95 -108 118 -56 24 -89 26 -144
       6z m107 -107 c33 -17 46 -39 46 -78 0 -54 -38 -90 -94 -90 -38 0 -85 50 -85
       90 0 64 76 109 133 78z m2035 -54 c51 -58 12 -144 -66 -144 -67 0 -107 59 -82
       121 26 61 103 74 148 23z m-913 -25 l75 -11 0 -47 c0 -26 -11 -199 -25 -386
       -14 -187 -27 -378 -30 -425 -3 -47 -8 -109 -11 -137 l-5 -53 -190 0 c-104 0
       -189 3 -189 8 0 4 -9 124 -20 267 -30 405 -50 695 -50 736 l0 37 63 10 c88 13
       293 14 382 1z m-521 -211 c5 -34 41 -540 53 -735 l6 -113 -357 0 -358 0 7 63
       c31 269 175 520 390 680 69 51 223 137 247 137 4 0 9 -15 12 -32z m781 -11
       c97 -48 175 -105 255 -186 159 -160 260 -368 285 -588 l7 -63 -356 0 -356 0 0
       44 c0 25 4 100 10 168 5 68 16 224 25 348 8 124 18 247 21 273 7 55 7 55 109
       4z m665 -974 c6 -27 14 -81 17 -120 l6 -73 -1133 0 -1133 0 6 73 c3 39 11 93
       17 120 l12 47 1098 0 1098 0 12 -47z m-133 -367 c36 -17 60 -38 80 -67 l28
       -43 3 -558 c2 -375 -1 -572 -8 -598 -13 -49 -63 -108 -107 -126 -48 -21 -1858
       -20 -1906 0 -41 17 -88 66 -104 108 -16 45 -18 1115 -2 1173 13 47 75 110 122
       124 19 5 409 10 937 10 l905 1 52 -24z m-2159 -673 l2 -273 -80 0 -80 0 0 268
       c0 148 3 272 7 276 4 4 39 5 78 4 l70 -3 3 -272z m2560 0 l2 -273 -80 0 -80 0
       0 268 c0 148 3 272 7 276 4 4 39 5 78 4 l70 -3 3 -272z"/>
       <path d="M970 1271 c-72 -22 -138 -79 -164 -143 -9 -21 -16 -65 -16 -98 0
       -138 104 -240 245 -240 137 0 239 102 240 240 0 114 -64 204 -169 235 -53 16
       -96 18 -136 6z m128 -147 c46 -30 61 -111 29 -154 -64 -85 -190 -55 -204 46
       -13 99 90 162 175 108z"/>
       <path d="M1887 1266 c-170 -63 -221 -279 -96 -405 111 -111 301 -90 383 42 74
       120 28 285 -97 348 -52 27 -140 34 -190 15z m117 -130 c42 -18 76 -61 76 -98
       0 -88 -91 -144 -169 -103 -29 14 -61 68 -61 102 0 31 39 83 73 98 40 18 41 18
       81 1z"/>
       <path d="M1155 495 c-52 -51 -17 -103 90 -134 96 -27 236 -43 315 -36 84 9
       222 40 261 60 36 19 52 55 39 89 -16 44 -38 47 -130 19 -153 -45 -342 -42
       -489 8 -30 11 -56 19 -58 19 -2 0 -15 -11 -28 -25z"/>
       </g>
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
