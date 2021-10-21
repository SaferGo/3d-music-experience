from red_light_green_light.models import User
from red_light_green_light import db, bcrypt, app
from flask import session, redirect, jsonify, url_for, render_template, flash
import requests
#from flask_sqlalchemy import SQLAlchemy


def login(username, password):
    userAccount = User.query.filter_by(username = username).first()
    if userAccount is None:
        return render_template('index.html', msg="You have mistyped your username")

    if not bcrypt.check_password_hash(userAccount.password, password):
        return render_template('index.html', msg="Wrong password")

    session['id'] = userAccount.id
    session['username'] = userAccount.username
    session['email'] = userAccount.email
    session['password'] = userAccount.password

    return redirect(url_for('game'))

def register(newUser):
    userExists = User.query.filter_by(username = newUser.username).first()
    emailExists = User.query.filter_by(email = newUser.email).first()

    if userExists:
        return render_template('index.html', msg="Username already taken!")
    if emailExists:
        return render_template('index.html', msg="Email already used!")

    db.session.add(newUser)
    db.session.commit()

    return render_template('index.html', msg="Account created!")
