const assert = require('assert');
const sqlite3 = require("sqlite3");
const envPaths = require("env-paths");
const path = require("path")
const { open } = require("sqlite");

const dataDirectory = envPaths("kolo", { suffix: "" }).data;
const dbFolderPath = path.join(dataDirectory, "storage");
const koloProjectName = process.env.KOLO_PROJECT_NAME

let databaseName;
if (koloProjectName) {
  databaseName = koloProjectName
} else {
  databaseName = path.basename(process.cwd())
}
databaseName = databaseName.toLowerCase()


const fullDatabasePath = path.join(dbFolderPath, `${databaseName}.sqlite3`);

describe('Kolo sqlite DB', function() {
  it('should have data', async function() {
    console.log(fullDatabasePath)
    const db = await open({
      filename: fullDatabasePath,
      driver: sqlite3.Database,
    });

    const row = await db.all(
      "SELECT * FROM invocations"
    );
    assert.equal(1, row.length)

    const parsedData = JSON.parse(row[0].data)
    assert.equal("/demo/", parsedData.request.path_info)
  });
});