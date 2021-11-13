# kolo-demo-docker

Try out Kolo with this demo project (Docker edition)

## Using this demo project

1. Clone this repository and `cd` into it

2. Run `docker-compose up`

3. Navigate to localhost:8000/demo/ and you should see some JSON output :tada:


4. If you've already got the Kolo VSCode extension installed, you should see the request to `/demo/` show up in Kolo in VSCode :raised_hands:
   - If you don't yet have the Kolo VSCode extension installed:
        1. Install the VSCode extension: https://marketplace.visualstudio.com/items?itemName=kolo.kolo
        2. Kolo will show up with an icon in the left sidebar in VSCode <img width="40px" src="https://user-images.githubusercontent.com/7718702/120314341-0c965980-c2d3-11eb-9f1d-c3d9bcccd1c9.png">
        3.  After clicking on the Kolo icon follow the instructions to get set up


    It should look something like this: ![Kolo demo screenshot](https://user-images.githubusercontent.com/7718702/127783044-09ff3dd2-da06-4342-b76d-d17975787079.png)



## Your own set up

This repo presents a minimal example of adding Kolo to your local Django set up, if you use Docker for local development on your Django project.

The relevant files are:
- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)

