import os
from pathlib import Path
import sqlite3
from appdirs import user_data_dir
import time
import json
import datetime

from django.test import TestCase
from django.test.utils import override_settings
from django.test.client import RequestFactory

cwd = os.getcwd()

def get_db_path() -> str:
    data_directory = user_data_dir(appname="kolo", appauthor="kolo")

    storage_path = os.path.join(data_directory, "storage")
    Path(storage_path).mkdir(parents=True, exist_ok=True)

    custom_database_name = os.environ.get("KOLO_PROJECT_NAME")

    if custom_database_name is not None:
        database_name = custom_database_name.lower()
    else:
        current_folder_name = os.path.basename(cwd).lower()
        database_name = current_folder_name

    return os.path.join(storage_path, f"{database_name}.sqlite3")


@override_settings(DEBUG=True)
class KoloTestCase(TestCase):

    def setUp(self):
        self.db_path = get_db_path()
        os.remove(self.db_path)
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()

    def test_kolo_saves_request_data(self):
        print(self.db_path)
        try:
            result = self.cursor.execute("SELECT * FROM invocations LIMIT 1")
        except sqlite3.OperationalError:
            pass
        else:
            self.fail("Expected table to not be found, but got results")

        resp = self.client.get("/demo/")
        self.assertEqual(resp.status_code, 200)

        # Writing to sqlite happens in a separate thread
        # so we're just gonna sleep here for simplicity
        time.sleep(2)

        result = self.cursor.execute("SELECT * FROM invocations LIMIT 1").fetchone()

        # request timestamp is in the second column
        created_at = result[1]
        created_at_datetime = datetime.datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
        thirty_seconds_ago = datetime.datetime.now() - datetime.timedelta(seconds=30)

        self.assertTrue(created_at_datetime > thirty_seconds_ago)

        # The data is in the third column
        raw_json = result[2]

        data = json.loads(raw_json)
        self.assertEqual("/demo/", data["request"]["path_info"])


    def tearDown(self):
        self.cursor.close()
        self.conn.close()




