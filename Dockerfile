# syntax=docker/dockerfile:1
FROM python:3.7-alpine
WORKDIR . /dockerCode
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

RUN apk add --no-cache python3-dev openssl-dev libffi-dev gcc g++ && pip3 install --upgrade pip

RUN python -m pip install --upgrade pip

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt 

RUN pip install requests

EXPOSE 5000

COPY . .

CMD ["flask", "run"]
