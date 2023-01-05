const fs = require("fs"),
  parse = require("clf-parser"),
  readline = require("readline");

const visitDurationMillis = 300 * 1000; // 5 min of no traffic signifies a new visit.
const ignored_paths = ["/v1/queue-pinservice/pins", "/server_status"]; // Paths we're not testing for.
const ignored_status = [301, 400, 404]; // This won't actully hit our backend.

const ignored_agents = ["python-requests", "k6", "Googlebot", "Java"]; // Get rid of bots.

// Skip known bots.
// gzcat  *.gz  | grep '/v1/search?q=.*page=60' | cut -d ' ' -f 1 | sort | uniq | jq --raw-input --slurp 'split("\n")'
const ignored_remotes = [
  "114.218.30.0",
  "115.87.153.0",
  "116.87.138.0",
  "124.120.206.0",
  "129.49.100.0",
  "130.245.145.0",
  "141.85.144.0",
  "148.71.182.0",
  "161.230.143.0",
  "184.103.221.0",
  "185.220.100.0",
  "20.48.28.0",
  "2001:ac8::",
  "2601:1c1::",
  "2a0f:93c1::",
  "34.252.169.0",
  "46.10.12.0",
  "46.204.100.0",
  "46.32.86.0",
  "49.216.183.0",
  "58.11.156.0",
  "58.11.157.0",
  "58.11.188.0",
  "65.109.59.0",
  "76.115.107.0",
  "77.101.140.0",
  "79.231.8.0",
  "80.195.236.0",
  "80.75.118.0",
  "86.49.124.0",
  "89.74.70.0",
  "91.159.232.0",
  "91.181.168.0",
];

const max_visit_steps = 256; // Reduce oversized batches; reduces crawlers.
const dataFile = "visits.json";

function shouldIgnore(parsed) {
  if (ignored_remotes.includes(parsed.remote_addr)) {
    // console.log(`Ignoring remote ${parsed.remote_addr}`);
    return true;
  }

  if (ignored_status.includes(parsed.status)) {
    // console.log(`Ignoring status ${parsed.status}`);
    return true;
  }

  if (
    ignored_agents.some(
      (agent) =>
        parsed.http_user_agent && parsed.http_user_agent.includes(agent)
    )
  ) {
    // console.log(`Ignoring agent ${parsed.http_user_agent}`);
    return true;
  }

  if (ignored_paths.some((path) => parsed.path && parsed.path.includes(path))) {
    // console.log(`Ignoring path ${parsed.path}`);
    return true;
  }

  return false;
}

async function parseLineToRemotes(line, remotes) {
  const parsed = parse(line);

  if (shouldIgnore(parsed)) return;

  const rKey = parsed.remote_addr;

  if (!remotes.has(rKey)) {
    // New remote, new visit
    console.log(`Found ${remotes.size} remotes.`);

    remotes.set(rKey, [[parsed]]);
  } else {
    const visits = remotes.get(rKey);
    const latest_visit = visits[visits.length - 1];
    const latest_request = latest_visit[latest_visit.length - 1];
    const time_since_latest_visit = Math.abs(
      parsed.time_local - latest_request.time_local
    );

    if (time_since_latest_visit > visitDurationMillis) {
      console.log(`New visit from existing remote ${parsed.remote_addr}`);
      visits.push([parsed]);
    } else {
      // Add request to latest visit
      latest_visit.push(parsed);
    }
  }
}

async function getRemotes() {
  console.log("Parsing log, sort remotes.");

  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  const remotes = new Map();
  for await (const line of rl) parseLineToRemotes(line, remotes);

  rl.close();

  return remotes;
}

function getVisits(remotes) {
  // Pile remotes together, yielding just visits.
  const visits = [];

  for (const [key, value] of remotes) {
    visits.push(...value);
  }

  console.log(`Found ${visits.length} visits.`);
  return visits;
}

function visitToBatches(visit) {
  var previous_time = visit[0].time_local;

  const batches = [];
  for (const request of visit) {
    const time_since_previous = Math.abs(request.time_local - previous_time);
    previous_time = request.time_local;

    if (batches.length > 0 && time_since_previous === 0) {
      // Append to last batch
      batches[batches.length - 1].paths.push(request.path);
    } else {
      // Create new batch
      if (!request.path) {
        console.error(request);
      }
      batches.push({
        paths: [request.path],
        seconds_before: time_since_previous / 1000,
      });
    }
  }

  return batches;
}

function visitsToBatches(visits) {
  let batchCount = 0;

  const batchedVisits = visits.map((visit) => {
    batches = visitToBatches(visit);
    batchCount += batches.length;
    return batches;
  });

  console.log(`Grouped ${batchCount} batches.`);
  return batchedVisits;
}

function filterOverlySizedVisits(visits) {
  const filtered = visits.filter((visit) => visit.length < max_visit_steps);
  console.log(
    `Removed ${visits.length - filtered.length} overly sized visits.`
  );
  return filtered;
}

function shuffleArray(a) {
  console.log("Shuffling visits.");

  return a
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

async function main() {
  const visits = shuffleArray(
    filterOverlySizedVisits(visitsToBatches(getVisits(await getRemotes())))
  );

  console.log(`Writing visits to ${dataFile}.`);
  fs.writeFileSync(dataFile, JSON.stringify(visits, null, 2), "utf8");

  process.exit();
}

main();
