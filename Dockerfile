FROM python:3.7-alpine
ENV FLASK_APP=app.py

RUN apk add --no-cache python3-dev openssl-dev libffi-dev gcc g++ postgresql-dev && pip3 install --upgrade pip

RUN python -m pip install --upgrade pip

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt 

RUN pip install requests

COPY . .

CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
