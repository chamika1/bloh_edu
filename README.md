# TechStudy Hub Blog

A modern, interactive blog platform for sharing technical articles and tutorials. Built with Python Flask backend and vanilla JavaScript frontend.

## Features

- Modern, responsive UI with glass morphism design
- Real-time article editing with TinyMCE integration
- Syntax highlighting for code blocks
- Image upload functionality
- Loading animations and smooth transitions
- Admin panel for content management

## Tech Stack

- Frontend:
  - Vanilla JavaScript
  - TailwindCSS
  - TinyMCE for rich text editing
  - Prism.js for syntax highlighting
  - Three.js for background effects

- Backend:
  - Python Flask
  - SQLite database
  - RESTful API

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/chamika1/bloh_edu.git
   cd bloh_edu
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add required environment variables

4. Run the application:
   ```bash
   python main.py
   ```

5. Access the application:
   - Main blog: http://localhost:8000
   - Admin panel: http://localhost:8000/admin.html

## Project Structure

- `main.py` - Flask application and API endpoints
- `static/` - Static assets (JS, CSS, images)
- `templates/` - HTML templates
- `instance/` - Database and instance-specific files
- `uploads/` - User uploaded images

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 