from flask import Flask, request, jsonify, send_from_directory, send_file, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
import sqlite3
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# Create uploads folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Delete existing database file if it exists
if os.path.exists('blog.db'):
    os.remove('blog.db')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create Flask app with static folder configuration
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key

# Admin credentials
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = generate_password_hash('admin123')  # Change this to a secure password

db = SQLAlchemy(app)

# Article Model
class Article(db.Model):
    __tablename__ = 'articles'  # Explicitly set table name
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    thumbnail = db.Column(db.String(200))  # This will store just the filename
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'thumbnail': url_for('serve_upload', filename=self.thumbnail, _external=True) if self.thumbnail else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if data['username'] != ADMIN_USERNAME:
                return jsonify({'message': 'Invalid token'}), 401
        except:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    auth = request.json
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    
    if auth.get('username') != ADMIN_USERNAME or not check_password_hash(ADMIN_PASSWORD, auth.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'username': ADMIN_USERNAME,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({'token': token})

# Upload image endpoint
@app.route('/upload', methods=['POST'])
@token_required
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to filename to make it unique
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Ensure upload directory exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            # Save the file
            file.save(file_path)
            
            # Return the relative path for the file
            return jsonify({
                "location": filename,
                "url": url_for('serve_upload', filename=filename, _external=True)
            })
            
        return jsonify({"error": "File type not allowed"}), 400
        
    except Exception as e:
        print(f"Upload error: {str(e)}")  # Log the error
        return jsonify({"error": "Failed to upload file"}), 500

# Create database tables
with app.app_context():
    db.drop_all()  # Drop all existing tables
    db.create_all()  # Create new tables

# Root route to serve index.html
@app.route('/')
@app.route('/index.html')
def home():
    return send_file('index.html')

# Serve admin page
@app.route('/admin')
@app.route('/admin.html')
def admin():
    return send_file('admin.html')

# API Routes without trailing slashes
@app.route('/articles', methods=['GET'])
def get_articles():
    articles = Article.query.all()
    return jsonify([article.to_dict() for article in articles])

@app.route('/articles', methods=['POST'])
@token_required
def create_article():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({"error": "Title and content are required"}), 400

    article = Article(
        title=data['title'],
        content=data['content'],
        thumbnail=data.get('thumbnail')  # Optional thumbnail
    )
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict()), 201

@app.route('/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    article = Article.query.get_or_404(article_id)
    return jsonify(article.to_dict())

@app.route('/articles/<int:article_id>', methods=['PUT'])
@token_required
def update_article(article_id):
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    article = Article.query.get_or_404(article_id)
    data = request.json
    
    if not data or ('title' not in data and 'content' not in data and 'thumbnail' not in data):
        return jsonify({"error": "Title, content or thumbnail is required"}), 400

    if 'title' in data:
        article.title = data['title']
    if 'content' in data:
        article.content = data['content']
    if 'thumbnail' in data:
        article.thumbnail = data['thumbnail']
    
    db.session.commit()
    return jsonify(article.to_dict())

@app.route('/articles/<int:article_id>', methods=['DELETE'])
@token_required
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted successfully'})

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000) 
    app.run(debug=True, port=8000) 