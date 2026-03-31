from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import Schema, fields, ValidationError, validates, validate
from config import Config
from models import db, Squad, Player, Application, Admin
from datetime import datetime, timedelta
import os
import secrets
import smtplib
from datetime import timedelta
from email.mime.text import MIMEText
import re

# Validation Schemas
class SquadSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    age_group = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    formation = fields.Str(validate=validate.Length(max=20))
    head_coach = fields.Str(validate=validate.Length(max=100))
    assistant_coach = fields.Str(validate=validate.Length(max=100))

class PlayerSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    age = fields.Int(validate=validate.Range(min=0, max=100))
    position = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    squad_id = fields.Int(required=True)
    stats_goals = fields.Int(validate=validate.Range(min=0))
    stats_assists = fields.Int(validate=validate.Range(min=0))
    stats_matches = fields.Int(validate=validate.Range(min=0))
    image_url = fields.Str(validate=validate.Length(max=500))
    is_spotlight = fields.Bool()
    quote = fields.Str(validate=validate.Length(max=1000))

class ApplicationSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    date_of_birth = fields.Date(required=True)
    position = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    previous_club = fields.Str(validate=validate.Length(max=100))
    email = fields.Email(required=True)
    phone = fields.Str(validate=validate.Length(max=20))
    message = fields.Str(validate=validate.Length(max=2000))

class AdminLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

class AdminSignupSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
limiter = Limiter(key_func=get_remote_address, app=app)

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    if Config.FLASK_ENV == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    return response

# Admin security config - removed hardcoded values
ADMIN_RESET_TOKENS = {}
RESET_TOKEN_TTL_MINUTES = 30

RESET_TOKEN_TTL_MINUTES = 30

# Auth decorator
def admin_required(f):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        admin = Admin.query.filter_by(email=current_user).first()
        if not admin:
            return jsonify({'error': 'Admin access required'}), 403
        g.current_admin = admin
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Helpers

def send_email(to_email, subject, body):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    from_email = os.environ.get('EMAIL_FROM', smtp_user)

    if not smtp_host or not smtp_user or not smtp_password:
        raise ValueError('SMTP server is not configured')

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, [to_email], msg.as_string())


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(ValidationError)
def validation_error(error):
    return jsonify({'error': 'Validation failed', 'details': error.messages}), 400

# ==================== SQUAD ROUTES ====================

@app.route('/api/squads', methods=['GET'])
def get_squads():
    try:
        squads = Squad.query.all()
        return jsonify([squad.to_dict() for squad in squads])
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/squads/<int:id>', methods=['GET'])
def get_squad(id):
    try:
        squad = Squad.query.get_or_404(id)
        return jsonify(squad.to_dict())
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/squads', methods=['POST'])
@admin_required
@limiter.limit("20/minute")
def create_squad():
    try:
        schema = SquadSchema()
        data = schema.load(request.get_json())
        
        new_squad = Squad(**data)
        
        db.session.add(new_squad)
        db.session.commit()
        
        return jsonify(new_squad.to_dict()), 201
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/squads/<int:id>', methods=['PUT'])
@admin_required
@limiter.limit("20/minute")
def update_squad(id):
    try:
        squad = Squad.query.get_or_404(id)
        schema = SquadSchema()
        data = schema.load(request.get_json())
        
        for key, value in data.items():
            setattr(squad, key, value)
        
        db.session.commit()
        return jsonify(squad.to_dict())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/squads/<int:id>', methods=['DELETE'])
@admin_required
@limiter.limit("10/minute")
def delete_squad(id):
    try:
        squad = Squad.query.get_or_404(id)
        db.session.delete(squad)
        db.session.commit()
        return jsonify({'message': 'Squad deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

# ==================== PLAYER ROUTES ====================

@app.route('/api/players', methods=['GET'])
def get_players():
    try:
        squad_id = request.args.get('squad_id', type=int)
        position = request.args.get('position')
        is_spotlight = request.args.get('is_spotlight')
        limit = request.args.get('limit', type=int)
        
        query = Player.query
        
        if squad_id:
            query = query.filter_by(squad_id=squad_id)
        if position:
            query = query.filter_by(position=position)
        if is_spotlight is not None:
            spotlight_bool = is_spotlight.lower() in ['1', 'true', 'yes']
            query = query.filter_by(is_spotlight=spotlight_bool)

        if limit:
            query = query.limit(limit)
        
        players = query.all()
        return jsonify([player.to_dict() for player in players])
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/players/<int:id>', methods=['GET'])
def get_player(id):
    try:
        player = Player.query.get_or_404(id)
        return jsonify(player.to_dict())
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/players', methods=['POST'])
@admin_required
@limiter.limit("20/minute")
def create_player():
    try:
        schema = PlayerSchema()
        data = schema.load(request.get_json())
        
        # Verify squad exists
        squad = Squad.query.get(data['squad_id'])
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        new_player = Player(**data)
        
        db.session.add(new_player)
        db.session.commit()
        
        return jsonify(new_player.to_dict()), 201
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/players/<int:id>', methods=['PUT'])
@admin_required
@limiter.limit("20/minute")
def update_player(id):
    try:
        player = Player.query.get_or_404(id)
        schema = PlayerSchema()
        data = schema.load(request.get_json())
        
        for key, value in data.items():
            setattr(player, key, value)
        
        db.session.commit()
        return jsonify(player.to_dict())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/players/<int:id>', methods=['DELETE'])
@admin_required
@limiter.limit("10/minute")
def delete_player(id):
    try:
        player = Player.query.get_or_404(id)
        db.session.delete(player)
        db.session.commit()
        return jsonify({'message': 'Player deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/players/<int:id>/move', methods=['POST'])
@admin_required
@limiter.limit("20/minute")
def move_player(id):
    try:
        player = Player.query.get_or_404(id)
        data = request.get_json()
        new_squad_id = data.get('squad_id')
        
        if not new_squad_id:
            return jsonify({'error': 'squad_id is required'}), 400
        
        new_squad = Squad.query.get(new_squad_id)
        if not new_squad:
            return jsonify({'error': 'Target squad not found'}), 404
        
        player.squad_id = new_squad_id
        db.session.commit()
        
        return jsonify(player.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

# ==================== APPLICATION ROUTES ====================

@app.route('/api/applications', methods=['GET'])
@admin_required
def get_applications():
    try:
        status = request.args.get('status')
        query = Application.query
        
        if status:
            query = query.filter_by(status=status)
        
        applications = query.order_by(Application.created_at.desc()).all()
        return jsonify([app.to_dict() for app in applications])
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/applications', methods=['POST'])
@limiter.limit("10/minute")
def create_application():
    try:
        schema = ApplicationSchema()
        data = schema.load(request.get_json())
        
        new_application = Application(**data)
        
        db.session.add(new_application)
        db.session.commit()
        
        return jsonify(new_application.to_dict()), 201
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/applications/<int:id>/status', methods=['PUT'])
@admin_required
@limiter.limit("20/minute")
def update_application_status(id):
    try:
        application = Application.query.get_or_404(id)
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'status is required'}), 400
            
        application.status = data['status']
        db.session.commit()
        
        return jsonify(application.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/applications/<int:id>', methods=['DELETE'])
@admin_required
@limiter.limit("10/minute")
def delete_application(id):
    try:
        application = Application.query.get_or_404(id)
        db.session.delete(application)
        db.session.commit()
        return jsonify({'message': 'Application deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/signup', methods=['POST'])
@limiter.limit("5/minute")
def admin_signup():
    try:
        schema = AdminSignupSchema()
        data = schema.load(request.get_json())
        
        # Check if email already exists
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Check if username already exists
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        admin = Admin(username=data['username'], email=data['email'])
        admin.set_password(data['password'])
        
        db.session.add(admin)
        db.session.commit()
        
        access_token = create_access_token(identity=admin.email)
        return jsonify({'message': 'Admin created successfully', 'access_token': access_token}), 201
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/login', methods=['POST'])
@limiter.limit("5/minute")
def admin_login():
    try:
        schema = AdminLoginSchema()
        data = schema.load(request.get_json())
        
        admin = Admin.query.filter_by(email=data['email']).first()
        if not admin or not admin.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=admin.email)
        return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/exists', methods=['GET'])
def admin_exists():
    try:
        count = Admin.query.count()
        return jsonify({'exists': count > 0})
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/reset-password', methods=['POST'])
@limiter.limit("3/minute")
def admin_reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        admin = Admin.query.filter_by(email=email).first()
        if not admin:
            return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
        # Generate reset token
        token = secrets.token_urlsafe(32)
        ADMIN_RESET_TOKENS[token] = {
            'email': email,
            'expires': datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
        }
        
        # Send email
        reset_link = f"{request.host_url}admin/reset-password?token={token}"
        send_email(
            email,
            'Password Reset - Eastleigh FC Academy',
            f'Click here to reset your password: {reset_link}\n\nThis link expires in {RESET_TOKEN_TTL_MINUTES} minutes.'
        )
        
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/reset-password/confirm', methods=['POST'])
def admin_confirm_reset():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        reset_info = ADMIN_RESET_TOKENS.get(token)
        if not reset_info or reset_info['expires'] < datetime.utcnow():
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        admin = Admin.query.filter_by(email=reset_info['email']).first()
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        admin.set_password(new_password)
        db.session.commit()
        
        # Clean up token
        del ADMIN_RESET_TOKENS[token]
        
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/list', methods=['GET'])
@admin_required
def admin_list():
    try:
        admins = Admin.query.all()
        return jsonify([admin.to_dict() for admin in admins])
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/<int:id>', methods=['DELETE'])
@admin_required
@limiter.limit("5/minute")
def admin_delete(id):
    try:
        if g.current_admin.id == id:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        admin = Admin.query.get_or_404(id)
        db.session.delete(admin)
        db.session.commit()
        return jsonify({'message': 'Admin deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

# ==================== HEALTH & INIT ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'eastleigh-academy-api',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/init', methods=['POST'])
@admin_required
def init_database():
    try:
        db.create_all()
        
        # Seed initial data if empty
        if Squad.query.count() == 0:
            squads = [
                Squad(name='Senior Squad', age_group='18+', formation='4-3-3', 
                      head_coach='Gareth Southgate', assistant_coach='Steve Holland'),
                Squad(name='Under 23', age_group='20-23', formation='4-2-3-1', 
                      head_coach='Lee Carsley', assistant_coach='Ashley Cole'),
                Squad(name='Under 18', age_group='16-18', formation='4-3-3', 
                      head_coach='Neil Ryan', assistant_coach='Paul McGuinness')
            ]
            db.session.add_all(squads)
            db.session.commit()
            
            # Add sample players to U18
            u18 = Squad.query.filter_by(name='Under 18').first()
            if u18:
                players = [
                    Player(first_name='Marcus', last_name='Chen', age=16, position='MID', 
                           squad_id=u18.id, stats_goals=24, stats_assists=18, stats_matches=32,
                           quote='The academy transformed my game completely.'),
                    Player(first_name='James', last_name='Wilson', age=17, position='FWD', 
                           squad_id=u18.id, stats_goals=31, stats_assists=12, stats_matches=30,
                           quote='Professional coaching every single day.')
                ]
                db.session.add_all(players)
                db.session.commit()
        
        return jsonify({
            'message': 'Database initialized successfully',
            'squads': Squad.query.count(),
            'players': Player.query.count()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode)