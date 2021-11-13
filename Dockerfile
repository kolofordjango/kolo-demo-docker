FROM python:3.9
ENV PYTHONUNBUFFERED 1
WORKDIR /code
COPY . ./
RUN pip install -r requirements.txt
EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]