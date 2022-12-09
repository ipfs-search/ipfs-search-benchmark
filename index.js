const fs = require("fs"),
  parse = require("clf-parser"),
  readline = require("readline");

const rd = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  console: false,
});

const visitDurationMillis = 300 * 1000;

async function getRemotes(fileStream) {
  console.log("Parsing log, sort remotes.");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const remotes = {};
  var count = 0;
  for await (const line of rl) {
    const parsed = parse(line);

    if (!(parsed.remote_addr in remotes)) {
      // New remote, new visit
      count++;
      console.log(`Found ${count} remotes.`);

      remotes[parsed.remote_addr] = [[parsed]];
    } else {
      const visits = remotes[parsed.remote_addr];
      const latest_visit = visits[visits.length - 1];
      const latest_request = latest_visit[latest_visit.length - 1];
      const time_since_latest_visit = Math.abs(
        parsed.time_local - latest_request.time_local
      );

      if (time_since_latest_visit > visitDurationMillis) {
        console.log(`New visit from existing remote ${parsed.remote_addr}`);
        remotes[parsed.remote_addr].push([parsed]);
      } else {
        // Add request to existing visit
        remotes[parsed.remote_addr][visits.length - 1].push(parsed);
      }
    }
  }

  rl.close();
  fileStream.close();

  return remotes;
}

async function getVisits(remotes) {
  // Pile remotes together, yielding just visits.
  const visits = [];

  for (const [key, value] of Object.entries(await remotes)) {
    for (const visit of value) {
      visits.push(...visit);
    }
  }

  return visits;
}

async function printVisits(visits) {
  const v = await visits;
  console.log(v[0]);

  process.exit();
}

const logFile = "access.log";

const fileStream = fs.createReadStream(logFile);
const remotes = getRemotes(fileStream);
const visits = getVisits(remotes);
printVisits(visits);
