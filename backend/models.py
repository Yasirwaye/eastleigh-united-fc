from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class Squad(db.Model):
    __tablename__ = 'squads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age_group = db.Column(db.String(50), nullable=False)
    formation = db.Column(db.String(20), default='4-3-3')
    head_coach = db.Column(db.String(100))
    assistant_coach = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    players = db.relationship('Player', backref='squad', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'age_group': self.age_group,
            'formation': self.formation,
            'head_coach': self.head_coach,
            'assistant_coach': self.assistant_coach,
            'players': [player.to_dict() for player in self.players],
            'created_at': self.created_at.isoformat()
        }

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer)
    position = db.Column(db.String(20), nullable=False)
    squad_id = db.Column(db.Integer, db.ForeignKey('squads.id'), nullable=False)
    stats_goals = db.Column(db.Integer, default=0)
    stats_assists = db.Column(db.Integer, default=0)
    stats_matches = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    is_spotlight = db.Column(db.Boolean, default=False)
    quote = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'age': self.age,
            'position': self.position,
            'squad_id': self.squad_id,
            'stats': {
                'goals': self.stats_goals,
                'assists': self.stats_assists,
                'matches': self.stats_matches
            },
            'image_url': self.image_url,
            'quote': self.quote,
            'is_spotlight': self.is_spotlight,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    position = db.Column(db.String(20), nullable=False)
    previous_club = db.Column(db.String(100))
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'position': self.position,
            'previous_club': self.previous_club,
            'email': self.email,
            'phone': self.phone,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }