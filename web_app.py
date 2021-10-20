import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import timedelta

app = Flask(__name__, template_folder='templates', static_url_path='', static_folder="static")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# session
app.secret_key = "hereWeGo"
app.permanent_session_lifetime = timedelta(hours=1)
CORS(app)

import web_app import routes
