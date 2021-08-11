FROM python:3.9
ENV PYTHONUNBUFFERED 1
# Setting the project name to the same name as the host working directory
ENV KOLO_PROJECT_NAME kolo-demo-docker
WORKDIR /code
COPY . ./
RUN pip install -r requirements.txt
EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]