import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiClock, FiX, FiTrash2 } from 'react-icons/fi';
import './App.css';

function App() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeConversation, setActiveConversation] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [selectedModel, setSelectedModel] = useState('model1');
    const [confirmedModel, setConfirmedModel] = useState(selectedModel);
    const [loadingModel, setLoadingModel] = useState(false);
    const [pastConversations, setPastConversations] = useState([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(null);

    const historyRef = useRef(null);

    useEffect(() => {
        const storedConversations = JSON.parse(localStorage.getItem('conversations')) || [];
        setPastConversations(storedConversations);
    }, []);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [activeConversation]);

    useEffect(() => {
        const newConversationId = new Date().toISOString();
        setCurrentConversationId(newConversationId);
        setActiveConversation([]);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setTimeout(() => {
            const mockResponse = 'This is a mock response from the LLM.';
            const newMessage = { input, response: mockResponse };

            const updatedConversation = [...activeConversation, newMessage];
            setActiveConversation(updatedConversation);
            updateCurrentConversationInLocalStorage(updatedConversation);

            setLoading(false);
            setInput('');
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen((prevState) => !prevState);
    };

    const toggleSettings = () => {
        setSettingsOpen((prevState) => !prevState);
        setSpinning(true);
        setTimeout(() => setSpinning(false), 500);
    };

    // File handling functions
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (file) {
            setUploadedFiles((prevFiles) => [...prevFiles, file]);
            setFile(null);
            console.log("File uploaded:", file.name);
        }
    };

    const handleDownload = (fileName) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(uploadedFiles.find(f => f.name === fileName));
        link.download = fileName;
        link.click();
    };

    const confirmModelChange = () => {
        const userConfirmed = window.confirm(`Are you sure you want to switch to ${selectedModel}?`);
        if (userConfirmed) {
            setLoadingModel(true);
            setTimeout(() => {
                setConfirmedModel(selectedModel);
                setLoadingModel(false);
                console.log(`Switched to ${selectedModel}`);
            }, 3000);
        }
    };

    const toggleHistory = () => {
        setHistoryOpen((prev) => !prev);
    };

    const loadConversation = (conversation) => {
        setActiveConversation(conversation);
        setHistoryOpen(false);
    };

    const deleteConversation = (index) => {
        const updatedConversations = pastConversations.filter((_, i) => i !== index);
        setPastConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    };

    const updateCurrentConversationInLocalStorage = (conversation) => {
        const conversationEntry = { id: currentConversationId, conversation };
        const existingConversations = JSON.parse(localStorage.getItem('conversations')) || [];
        const existingEntryIndex = existingConversations.findIndex(entry => entry.id === currentConversationId);

        if (existingEntryIndex !== -1) {
            existingConversations[existingEntryIndex].conversation = conversation;
        } else {
            existingConversations.push(conversationEntry);
        }

        setPastConversations(existingConversations);
        localStorage.setItem('conversations', JSON.stringify(existingConversations));
    };

    return (
        <div className="App">
            {loadingModel && (
                <div className="loading-overlay">
                    <div className="loading-message">
                        <p>Switching to {selectedModel}</p>
                        <p>Please wait...</p>
                    </div>
                </div>
            )}

            <header className="App-header">
                <button onClick={toggleSidebar} className="Sidebar-toggle">
                    <span className="Sidebar-icon"></span>
                    <span className="Sidebar-icon"></span>
                    <span className="Sidebar-icon"></span>
                </button>
                <h1>LLM Chat Website</h1>
                <FiSettings
                    className={`settings-icon ${spinning ? 'spin' : ''}`}
                    size={24}
                    onClick={toggleSettings}
                    title="Settings"
                />
                <FiClock
                    className="history-icon"
                    size={24}
                    onClick={toggleHistory}
                    title="Conversation History"
                />
            </header>

            <div className="App-container">
                {sidebarOpen && (
                    <aside className="Sidebar">
                        <h2>Upload Documents</h2>
                        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                        <button className="Upload-button" onClick={handleUpload}>Upload</button>
                        <h3>Uploaded Files</h3>
                        <ul>
                            {uploadedFiles.map((file, index) => (
                                <li key={index} className="uploaded-file">
                                    <span className="file-name">{file.name}</span>
                                    <div className="file-actions">
                                        <button onClick={() => handleDownload(file.name)}>Download</button>
                                        <button onClick={() => window.open(URL.createObjectURL(file), '_blank')}>View</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {settingsOpen && (
                    <div className="settings-panel">
                        <h3>Choose LLM Model</h3>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                            <option value="model1">Model 1</option>
                            <option value="model2">Model 2</option>
                            <option value="model3">Model 3</option>
                        </select>
                        <button onClick={confirmModelChange} className="confirm-button">Confirm</button>
                    </div>
                )}

                {historyOpen && (
                    <>
                        <div className="history-overlay" onClick={() => setHistoryOpen(false)} />
                        <div className="history-modal">
                            <div className="history-modal-header">
                                <h3>Past Conversations</h3>
                                <FiX className="close-history-button" onClick={() => setHistoryOpen(false)} />
                            </div>
                            <ul>
                                {pastConversations.map((item, index) => (
                                    <li key={index} className="conversation-item" onClick={() => loadConversation(item.conversation)}>
                                        Conversation from {new Date(item.id).toLocaleString()}
                                        <FiTrash2
                                            className="delete-icon"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent loading the conversation when clicking the delete icon
                                                deleteConversation(index);
                                            }}
                                            title="Delete conversation"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                <main className="Main-content">
                    <div className="history" ref={historyRef}>
                        <h3>Active Conversation:</h3>
                        <ul>
                            {activeConversation.map((item, index) => (
                                <li key={index}>
                                    <strong>Q:</strong> {item.input} <br />
                                    <strong>A:</strong> {item.response}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <form onSubmit={handleSubmit} className="input-form">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question..."
                            rows="4"
                            cols="50"
                        />
                        <br />
                        <button type="submit" disabled={loading} className="Submit-button">
                            {loading ? 'Loading...' : 'Submit'}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default App;
