import pymysql
pymysql.install_as_MySQLdb()   

import os
from flask import Flask
from dotenv import load_dotenv

# Extensiones y componentes de tu app
from app.extensions import db
from app.Service import email_service 
from .Controllers.routes import routes_bp
from .Controllers.AunthController import auth_bp
from .Controllers.menuController import menu_bp
from .Controllers.credentialController import credential_bp
from app.models import Usuario, Login, Local

 
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

 
class PrefixMiddleware(object):
    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        if environ['PATH_INFO'].startswith(self.prefix):
            environ['PATH_INFO'] = environ['PATH_INFO'][len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
            return self.app(environ, start_response)
        else:
            return self.app(environ, start_response)

def create_app():
    app = Flask(__name__)
    
    # Configuración de Base de Datos
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv("SECRET_KEY")
    
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,  
    }
    
    # Inicialización de extensiones
    db.init_app(app)
    email_service.init_app(app) 
    
    #  SEGURIDAD DE COOKIES 
    app.config.update(
        SESSION_COOKIE_NAME="session_oasis",  
        SESSION_COOKIE_PATH="/",         
        SESSION_COOKIE_SECURE=False,        
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True,              
        PERMANENT_SESSION_LIFETIME=1800        
    )
    
    # Registro de blueprints
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(credential_bp)

 
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix='/Oasis')
    
    return app