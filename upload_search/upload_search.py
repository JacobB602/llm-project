import os
from sentence_transformers import SentenceTransformer
import psycopg2
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from docx import Document  # To handle docx files
import PyPDF2  # To handle pdf files
from flask_cors import CORS  # To handle cross-origin requests (if needed)


import numpy as np
from psycopg2.extensions import register_adapter, AsIs
from pgvector.psycopg2 import register_vector

'''
def adapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)

def adapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)

def adapt_numpy_float32(numpy_float32):
    return AsIs(numpy_float32)

def adapt_numpy_int32(numpy_int32):
    return AsIs(numpy_int32)

def adapt_numpy_array(numpy_array):
    return AsIs(tuple(numpy_array))

register_adapter(np.float64, adapt_numpy_float64)
register_adapter(np.int64, adapt_numpy_int64)
register_adapter(np.float32, adapt_numpy_float32)
register_adapter(np.int32, adapt_numpy_int32)
register_adapter(np.ndarray, adapt_numpy_array)
'''

# Database connection (using local PostgreSQL with your credentials)
DATABASE_URL = "postgresql://postgres:projectllm@localhost:5432/llm"
conn = psycopg2.connect(DATABASE_URL)
register_vector(conn)
cursor = conn.cursor()

app = Flask(__name__)
CORS(app)  # Enable CORS if needed
app.config['UPLOAD_FOLDER'] = 'uploads'

#/////////////////////////////////

model = SentenceTransformer("multi-qa-mpnet-base-cos-v1")

#//////////////////////////////////////

# Function to extract text embedding using OpenAI
def get_embedding(text, model):
    embedding = model.encode(text)
    return embedding

'''
def get_embedding(text):
    response = openai.Embedding.create(
        model="text-embedding-ada-002", 
        input=text
    )
    embedding = response['data'][0]['embedding']
    return embedding
'''

# Function to extract text from docx files
def extract_text_from_docx(filepath):
    doc = Document(filepath)
    return '\n'.join([para.text for para in doc.paragraphs])

# Function to extract text from pdf files
def extract_text_from_pdf(filepath):
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in range(len(reader.pages)):
            text += reader.pages[page].extract_text()
    return text

# Route to render HTML page (for file upload and search)
@app.route('/')
def index():
    return render_template('index.html')

# Route to upload a file
@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No selected file'})

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Extract file type (file extension)
            filetype = os.path.splitext(filename)[1]  # e.g., .txt, .pdf, etc.

            # Read file content based on the file type
            if filename.endswith('.docx'):
                content = extract_text_from_docx(filepath)
            elif filename.endswith('.pdf'):
                content = extract_text_from_pdf(filepath)
            else:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

            # Generate embedding for the content
            embedding = get_embedding(content, model)

            # Insert filename, content, filetype, and embedding into PostgreSQL
            cursor.execute("""
                INSERT INTO documents (filename, content, filetype, embedding) 
                VALUES (%s, %s, %s, %s)
            """, (filename, content, filetype, embedding))
            conn.commit()

            return jsonify({'message': f'File {filename} uploaded and indexed successfully'})
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback in case of error
        return jsonify({'error': 'File upload failed'})

# Route to search for keywords
@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({'error': 'No query provided'})

    # Generate embedding for the query
    query_embedding = get_embedding(query, model)

    # Search for similar embeddings in the database (use pgvector or FLOAT8[] similarity)
    cursor.execute("""
        SELECT filename, content, embedding <-> %s::vector AS distance
        FROM documents
        ORDER BY distance ASC
        LIMIT 5
    """, (query_embedding,))
    
    results = cursor.fetchall()

    return jsonify({
        'results': [
            {'filename': row[0], 'content': row[1], 'distance': row[2]} for row in results
        ]
    })

# Start the Flask app
if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True, host='0.0.0.0')