import os
from flask import Flask
from flask_bcrypt import Bcrypt
from datetime import timedelta

app = Flask(__name__, template_folder='templates', static_url_path='', static_folder="static")

bcrypt = Bcrypt(app)

# session
app.secret_key = "hereWeGo"
app.permanent_session_lifetime = timedelta(hours=1)

from red_light_green_light.base import engine, Session, Base
from red_light_green_light.models import User

Base.metadata.create_all(engine)

from red_light_green_light import routes
