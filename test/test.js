const assert = require('assert');
const sqlite3 = require("sqlite3");
const envPaths = require("env-paths");
const path = require("path")
const { open } = require("sqlite");
const os = require("os")

let dataDirectory = envPaths("kolo", { suffix: "" }).data;
if (os.platform().startsWith("win")) {
  dataDirectory = path.join(dataDirectory, "..", path.sep, "kolo")
}
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

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

describe('Kolo sqlite DB', function() {
  it('should have data', async function() {
    const db = await open({
      filename: fullDatabasePath,
      driver: sqlite3.Database,
    });

    const row = await db.all(
      "SELECT * FROM invocations"
    );
    assert.strictEqual(1, row.length)

    const parsedData = JSON.parse(row[0].data)
    assert.strictEqual("/demo/", parsedData.request.path_info)

    const {request, response, sql_queries_made, api_requests_made, jobs_enqueued, frames_of_interest} = parsedData

    assert.strictEqual("GET", request.method)
    assert.notStrictEqual(0, Object.keys(request.headers).length)


    assert.notStrictEqual(0, Object.keys(response.headers).length)
    assert.strictEqual(200, response.status_code)

    const responseBody = JSON.parse(response.content)
    assert.deepStrictEqual(['user', 'total_repositories', 'newly_created_repositories'].sort(), Object.keys(responseBody).sort())


    assert.notStrictEqual(0, sql_queries_made.length)
    assert.strictEqual(2, api_requests_made.length)
    const firstApiRequest = api_requests_made[0]

    assert.strictEqual("GET https://api.github.com/users/wilhelmklopp", firstApiRequest.request.method_and_full_url)

    assert.strictEqual(200, firstApiRequest.response.status_code)
    assert.notStrictEqual(0, Object.keys(firstApiRequest.request.headers).length)
    assert.notStrictEqual(0, Object.keys(firstApiRequest.response.headers).length)

    const firstApiRequestResponseBody = JSON.parse(firstApiRequest.response.body)

    assert.strictEqual(true, Object.keys(firstApiRequestResponseBody).includes("login"))
    assert.strictEqual("wilhelmklopp", firstApiRequestResponseBody.login)
    assert.strictEqual(7718702, firstApiRequestResponseBody.id)

    const secondApiRequest = api_requests_made[1]

    assert.strictEqual("GET https://api.github.com/users/wilhelmklopp/repos", secondApiRequest.request.method_and_full_url)
    assert.strictEqual(200, secondApiRequest.response.status_code)
    assert.notStrictEqual(0, Object.keys(secondApiRequest.request.headers).length)
    assert.notStrictEqual(0, Object.keys(secondApiRequest.response.headers).length)

    const secondApiRequestBody = JSON.parse(secondApiRequest.response.body)
    assert.strictEqual(true, Array.isArray(secondApiRequestBody))


    assert.strictEqual(0, jobs_enqueued.length)
    assert.notStrictEqual(0, frames_of_interest.length)
    assert.strictEqual(true, frames_of_interest.length > 5)

    frames_of_interest.forEach(frame => {
      const {path, co_name, locals, event, arg, timestamp} = frame;
      if (!locals) {
        console.log(path, co_name)
      }
      // Basic truthy checks
      assert.strictEqual(true, !!path)
      assert.strictEqual(true, !!co_name)
      assert.strictEqual(true, !!locals)

      if (event === "return") {
        assert.notStrictEqual("None", arg)
      }
      assert.strictEqual(true, isFloat(timestamp))
    })
  });
});
