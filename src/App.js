import React, { useState, useEffect, useRef } from 'react';
import { FiSettings } from 'react-icons/fi'; // Import settings icon
import './App.css';

function App() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files
    const [file, setFile] = useState(null); // State for selected file
    const [settingsOpen, setSettingsOpen] = useState(false); // State for settings panel
    const [spinning, setSpinning] = useState(false); // State to trigger spin animation
    const [selectedModel, setSelectedModel] = useState('model1'); // Default model
    const [confirmedModel, setConfirmedModel] = useState(selectedModel); // Confirmed model state
    const [loadingModel, setLoadingModel] = useState(false); // Loading state for model switching
    const historyRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const mockResponse = 'This is a mock response from the LLM.';
            setResponse(mockResponse);
            setHistory((prevHistory) => [
                ...prevHistory,
                { input, response: mockResponse },
            ]);
            setLoading(false);
            setInput('');

            if (historyRef.current) {
                historyRef.current.scrollTop = historyRef.current.scrollHeight;
            }
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (input.trim() === '') { // If the input is empty
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent new line
            }
        } else if (e.key === 'Enter' && !e.shiftKey) { // Check for Enter key and not Shift key
            e.preventDefault(); // Prevent new line
            handleSubmit(e); // Call the submit handler
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen((prevState) => !prevState);
    };

    const toggleSettings = () => {
        setSettingsOpen((prevState) => !prevState);
        setSpinning(true); // Trigger the spin animation
        setTimeout(() => setSpinning(false), 500); // Stop spinning after 0.5s
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the selected file
    };

    // Handle file upload
    const handleUpload = () => {
        if (file) {
            setUploadedFiles((prevFiles) => [...prevFiles, file]);
            setFile(null);
            console.log("File uploaded:", file.name);
        }
    };

    // Handle file download
    const handleDownload = (fileName) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(uploadedFiles.find(f => f.name === fileName));
        link.download = fileName;
        link.click();
    };

    // Confirm model change
    const confirmModelChange = () => {
        setLoadingModel(true); // Start loading
        setTimeout(() => {
            setConfirmedModel(selectedModel);
            setLoadingModel(false); // End loading
            console.log(`Switched to ${selectedModel}`); // Placeholder for actual model switching logic
        }, 2000); // Simulate loading time
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

                <main className="Main-content">
                    <div className="history" ref={historyRef}>
                        <h3>History:</h3>
                        <ul>
                            {history.map((item, index) => (
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
                            onKeyDown={handleKeyDown} // Add key down event handler
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
