from flask import render_template, url_for, flash, redirect, session, jsonify, request
from red_light_green_light import app, bcrypt
from red_light_green_light.functions import *

@app.route("/", methods = ['GET', 'POST'])
def index():
    if 'username' in session:
        return redirect(url_for('game'))
    elif request.method == 'POST':
        if request.form.get('submit') == 'login':
            username = request.form['usernameLogin']
            password = request.form['passwordLogin']
            return login(username, password)

        elif request.form.get('submit') == 'registration':
            newUser = User()
            newUser.username = request.form['usernameRegistration']
            newUser.email = request.form['emailRegistration']

            print(request.form.get('passwordRegistration'))
            print(request.form.get('passwordRegistration2'))
            if request.form.get('passwordRegistration') != request.form.get('passwordRegistration2'):
                return render_template('index.html', msg="Passwords don't match")

            hashedPassword = bcrypt.generate_password_hash(request.form['passwordRegistration']).decode('utf-8')
            newUser.password = hashedPassword

            return register(newUser)
    else:
        return render_template("index.html")


@app.route('/game', methods = ['GET', 'POST'])
def game():
    if 'username' not in session:
        return redirect(url_for('index'))
    else:
        return render_template('game.html')
