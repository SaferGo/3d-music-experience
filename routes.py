from web_app import app, bcrypt
from web_app.forms import LoginForm, RegistrationForm
from web_app.functions import *

from flask import render_template, url_for

@app.route("/")
def index():
    if request.method == 'POST':
        if request.form.get('form') == 'login':
            username = request.form['username']
            password = request.form['password']
            return login(username, password)

        elif request.form.get('form') == 'registration':
            newUser = User()
            newUser.username = request.form['usernameRegistration']
            newUser.email = request.form['emailRegistration']

            if request.form['passwordRegistration'] != request.form['password2Registration']:
                return jsonify({'error' : "Passwords don't match"})

            hashedPassword = bcrypt.generat_password_hash(request.form['passwordRegistration']).decode('utf-8')
            newUser.password = hashedPassword

            return register(newUser)
    else:
        return render_template("index.html")
