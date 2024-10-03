import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files
    const [file, setFile] = useState(null); // State for selected file
    const historyRef = useRef(null);

    useEffect(() => {
        document.title = "LLM Demo";
    }, []);

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

    const toggleSidebar = () => {
        setSidebarOpen((prevState) => !prevState);
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the selected file
    };

    // Handle file upload
    const handleUpload = () => {
        if (file) {
            // Add the file to the uploaded files state
            setUploadedFiles((prevFiles) => [...prevFiles, file]);
            // Reset the file input
            setFile(null);
            // Optionally, you can also handle the actual file upload logic here (e.g., send it to a server)
            console.log("File uploaded:", file.name);
        }
    };

    // Handle file download
    const handleDownload = (fileName) => {
        // Create a link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(uploadedFiles.find(f => f.name === fileName)); // Create an object URL for the file
        link.download = fileName; // Set the file name for the download
        link.click(); // Trigger the download
    };

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={toggleSidebar} className="Sidebar-toggle">
                    <span className="Sidebar-icon"></span>
                    <span className="Sidebar-icon"></span>
                    <span className="Sidebar-icon"></span>
                </button>
                <h1>LLM Chat Website</h1>
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
