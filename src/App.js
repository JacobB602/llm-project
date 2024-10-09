import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios'; // Import Axios

function App() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState(''); // This is where the API response is stored
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // New state to store error
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files
    const [file, setFile] = useState(null); // State for selected file
    const historyRef = useRef(null);

    useEffect(() => {
        document.title = "LLM Demo";
    }, []);

    // Updated handleSubmit to call the C# API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset error state before new request

        try {
            // Call the C# API with the user input
            const apiResponse = await axios.post("http://localhost:5288/generate", {
                prompt: input,
            });

            const apiResponseText = apiResponse.data.generated_text;
            setResponse(apiResponseText); // Set the response to be shown
            setHistory((prevHistory) => [
                ...prevHistory,
                { input, response: apiResponseText },
            ]);

            setInput(''); // Clear input field

            if (historyRef.current) {
                historyRef.current.scrollTop = historyRef.current.scrollHeight;
            }
        } catch (error) {
            console.error("Error calling the API:", error);
            
            // Check if the error has a response and handle the detailed message
            if (error.response && error.response.data && error.response.data.details) {
                setError(error.response.data.details); // Set detailed error message
            } else {
                setError("An unexpected error occurred."); // Default error message
            }
            setResponse('Error calling the API.');
        } finally {
            setLoading(false);
        }
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
            setUploadedFiles((prevFiles) => [...prevFiles, file]);
            setFile(null); // Reset the file input
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

                    {/* Display the current response below the form */}
                    {response && (
                        <div className="response-box">
                            <h4>Response:</h4>
                            <p>{response}</p>
                        </div>
                    )}

                    {/* Display error message if exists */}
                    {error && (
                        <div className="error-box">
                            <h4>Error:</h4>
                            <p>{error}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
