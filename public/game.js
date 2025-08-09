
// === REGION DATA ===
let seedObj = { value: 12345 };
let answerLat = 0, answerLng = 0, guessLat = null, guessLng = null;
let hasGuessed = false, timerInt = null, roundsPlayed = 0, totalRounds = 0, scoreTotal = 0;
let map, guessMarker;
let currentUser = null;
const currentVersion = "9.3";

const versions = [
  { version: "9.2", changelog: "8/8/2025 \n The server works now. It only took 6 hours. No more AI slop is here. Leaderboards and seed analysis now work due to an actual game data system. A server. Not what was here before, aka a link." },
  { version: "9.3", changelog: "9/8/2025 \n - Added an overall leaderboard system \n - Moved recent seeds panel to a more convenient location \n - The current player system now works and is objectively better. (google sign in is gone, maybe it will be back later, idk) \n Brought back audio (lost due to AI Slop) no new audio clips yet (coming soon) \n - Removed urban mode temporarily due to being broken. Will be back on Sunday. \n - Added a version control system (this) \n - Added a dev mode \n - Numerous bug fixes related to AI slops or being able to submit a guess before a game starts resulting in (0, 0) \n - Banned Max from doing brain rot AI slops \n \n For more information regarding the development, leaving feedback and answering a few poles, etc, please see the google doc. \n - Menno" }
];

const REGIONS = [
  {latMin: -36.372506, latMax: -34.112845, lngMin: 171.967895, lngMax: 174.950684},
  {latMin: -37.756495, latMax: -35.955081, lngMin: 174.076171, lngMax: 176.350341},
  {latMin: -40.157354, latMax: -37.700960, lngMin: 174.526612, lngMax: 177.328126},
  {latMin: -39.896229, latMax: -38.744969, lngMin: 173.661987, lngMax: 174.716675},
  {latMin: -39.295443, latMax: -37.448614, lngMin: 176.888672, lngMax: 178.608032},
  {latMin: -40.605280, latMax: -39.901176, lngMin: 174.841919, lngMax: 177.033691},
  {latMin: -41.586984, latMax: -40.589517, lngMin: 174.469482, lngMax: 176.458008},
  {latMin: -44.382139, latMax: -43.663472, lngMin: 183.008057, lngMax: 184.040772},
  {latMin: -43.288476, latMax: -40.440093, lngMin: 172.041504, lngMax: 173.067627},
  {latMin: -41.734703, latMax: -40.618724, lngMin: 172.940185, lngMax: 174.478271},
  {latMin: -43.143539, latMax: -41.766034, lngMin: 172.749023, lngMax: 174.111328},
  {latMin: -43.991914, latMax: -43.372382, lngMin: 168.363281, lngMax: 173.186279},
  {latMin: -43.434230, latMax: -40.778469, lngMin: 169.653077, lngMax: 172.234864},
  {latMin: -47.307792, latMax: -46.528100, lngMin: 166.819702, lngMax: 168.608277},
  {latMin: -46.241388, latMax: -43.932577, lngMin: 166.346191, lngMax: 169.283935},
  {latMin: -46.679334, latMax: -46.236597, lngMin: 167.673340, lngMax: 170.002441},
  {latMin: -46.250672, latMax: -43.824558, lngMin: 167.985352, lngMax: 172.335938},
  {latMin: -44.363558, latMax: -44.213195, lngMin: 183.635788, lngMax: 184.015503}
];

// Set a random seed on startup
document.getElementById('seed').value = Math.floor(Math.random() * 1000000000);

// Get and check server status
fetch("/ping")
  .then(res => {
    if (res.ok) {
      console.log("✅ Server is running.");
    } else {
      console.warn("⚠️ Server responded, but with error:", res.status);
    }
  })
  .catch(err => {
    console.error("❌ Server is not reachable:", err);
  });

const goodSounds = ['good1', 'good2', 'good3', 'good4', 'good5', 'good6', 'good7', 'good8', 'good9', 'good10', 'good11'];
const badSounds = ['bad1', 'bad2', 'bad4', 'bad5', 'bad6', 'bad7', 'bad8', 'bad9', 'bad10', 'bad11', 'bad12', 'bad13'];

function playRandomSound(soundList) {
  const id = soundList[Math.floor(Math.random() * soundList.length)];
  const audio = document.getElementById(id);
  if (audio) audio.play().catch(e => console.warn("Playback blocked:", e));
}

function getRandomNZLocation(s) {
  const region = REGIONS[Math.floor(seededRandom(s) * REGIONS.length)];
  return {
    lat: randomInRange(s, region.latMin, region.latMax),
    lng: randomInRange(s, region.lngMin, region.lngMax)
  };
}

async function tileHasLand(lat, lng, zoom) {
  const x = longitudeToTileX(lng, zoom), y = latitudeToTileY(lat, zoom);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const data = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (r < 200 && g < 200 && b < 200) return true;
    }
  } catch { return false; }
  return false;
}

async function tileHasEnoughWater(lat, lng, zoom) {
  const x = longitudeToTileX(lng, zoom), y = latitudeToTileY(lat, zoom);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const data = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    let water = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (b > 240 && b < 250 && r > 200 && r < 220 && g > 225 && g < 238) water++;
    }
    return (water / (bmp.width * bmp.height)) >= 0.1;
  } catch { return false; }
}

async function tileHasEnoughUrban(lat, lng, zoom) {
  const x = longitudeToTileX(lng, zoom), y = latitudeToTileY(lat, zoom);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const data = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    let urban = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (r > 180 && r < 190 && g > 180 && g < 190 && b > 175 && b < 187) urban++;
    }
    return (urban / (bmp.width * bmp.height)) >= 0.01;
  } catch { return false; }
}

async function getValidLocation(s, beachMode, urbanMode, zoom) {
  for (let i = 0; i < 500; i++) {
    const loc = getRandomNZLocation(s);
    if (beachMode) {
      if (await tileHasLand(loc.lat, loc.lng, zoom) && await tileHasEnoughWater(loc.lat, loc.lng, zoom)) return loc;
    } else if (urbanMode) {
      if (await tileHasEnoughUrban(loc.lat, loc.lng, zoom)) return loc;
    } else {
      if (await tileHasLand(loc.lat, loc.lng, zoom)) return loc;
    }
  }
  return { lat: -41.3, lng: 174.8 };
}

function updateUI() {
  document.getElementById('roundInfo').textContent = `Round ${roundsPlayed} of ${totalRounds}`;
  document.getElementById('totalScore').textContent = `Total Score: ${scoreTotal}`;
}

async function startGame() {
  clearInterval(timerInt);
  hasGuessed = false;
  guessLat = guessLng = null;
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('result').textContent = '';

  document.getElementById('leafletMap').style.pointerEvents = 'none';

  // The first round so setup game
  if (roundsPlayed === 0) {
    totalRounds = parseInt(document.getElementById('totalRounds').value) || 1;
    scoreTotal = 0;
    const sv = parseInt(document.getElementById('seed').value);
    if (isNaN(sv)) {
      // Generate a random seed if no valid seed was entered
      const randomSeed = Math.floor(Math.random() * 1000000000);
      document.getElementById('seed').value = randomSeed;  // update the input field
      seedObj.value = randomSeed;
    } else {
        seedObj.value = sv;
    }
  }
  
  roundsPlayed++;
  updateUI();
  const zoom = +document.getElementById('zoom').value;
  const beachMode = document.getElementById('beachMode').checked;
  //const urbanMode = document.getElementById('urbanMode').checked;
  const urbanMode = false;
  const timerValue = document.getElementById('timerMode').value;
  const timerLen = timerValue === 'none' ? null : parseInt(timerValue);
  const loc = await getValidLocation(seedObj, beachMode, urbanMode, zoom);
  answerLat = loc.lat;
  answerLng = loc.lng;
  document.getElementById('mapFrame').src = `https://www.topomap.co.nz/NZTopoMap?v=2&ll=${answerLat},${answerLng}&z=${zoom}`;

  if (guessMarker) map.removeLayer(guessMarker);
  
  map.setView([-41.3, 174.8], 5);
  document.getElementById('leafletMap').style.pointerEvents = 'auto';

  if (timerLen !== null) {
    let t = timerLen;
    document.getElementById('result').textContent = `Timer: ${t}s remaining…`;
    timerInt = setInterval(() => {
      t--;
      if (t > 0) {
        document.getElementById('result').textContent = `Timer: ${t}s remaining…`;
      } else {
        clearInterval(timerInt);
        if (!hasGuessed && guessLat !== null) submitGuess();
      }
    }, 1000);
  }
}

function submitGuess() {
  if (hasGuessed || guessLat == null) return;
  hasGuessed = true;
  document.getElementById('submitBtn').disabled = true;

  clearInterval(timerInt);
  document.getElementById('mapFrame').style.pointerEvents = 'auto';
  const dist = haversine(answerLat, answerLng, guessLat, guessLng);
  const score = Math.max(0, Math.round(100 - 40 * (Math.log(dist + 1) - 5)));

  scoreTotal += score;
  document.getElementById('result').textContent = `You were ${dist.toFixed(2)} km away → Score: ${score}/300`;
  sendGuessToServer(guessLat, guessLng, dist);
  updateUI();
  setTimeout(loadOtherGuesses, 500);
  L.circleMarker([answerLat, answerLng], {
    radius: 10,
    fillColor: 'green',
    color: 'black',
    weight: 2,
    fillOpacity: 0.8
  }).addTo(map).bindPopup('📍 Actual Location').openPopup();
  document.getElementById('startBtn').disabled = (roundsPlayed >= totalRounds);

  // If this is the final round
  if (roundsPlayed >= totalRounds) {
    document.getElementById('replayBtn').disabled = false;

    const timerMode = document.getElementById('timerMode').value;
    const beachMode = document.getElementById('beachMode').checked;
    const zoom = +document.getElementById('zoom').value;

    // Are we in normal mode?
    if (timerMode === "30" && beachMode === false && zoom === 14) {
      sendScoreForOverallLeaderboardToServer(scoreTotal);
    }
    
    sendSeedLeaderboardToServer({
      seed: parseInt(document.getElementById('seed').value),
      user: currentUser,
      totalScore: scoreTotal,
      rounds: roundsPlayed
    });
    
    setTimeout(showSeedLeaderboard, 1000);
  }

  if (dist < 100) playRandomSound(goodSounds);
  else if (dist > 700) playRandomSound(badSounds);
}

function initMap() {
  map = L.map('leafletMap', { center: [-41.3, 174.8], zoom: 5 });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
  }).addTo(map);

  // On offering a guess on the map
  map.on('click', e => {
    if (hasGuessed) return;
    guessLat = e.latlng.lat;
    guessLng = e.latlng.lng;
    if (guessMarker) map.removeLayer(guessMarker);
    guessMarker = L.marker([guessLat, guessLng]).addTo(map);
    document.getElementById('result').textContent = `Guess: ${guessLat.toFixed(4)}, ${guessLng.toFixed(4)} – click Submit.`;
    document.getElementById('submitBtn').disabled = false;
  });
  
  document.getElementById('startBtn').onclick = () => {
    document.getElementById('startBtn').disabled = true;
    startGame();
  };

  document.getElementById('submitBtn').onclick = submitGuess;

  document.getElementById('replayBtn').onclick = () => {
    roundsPlayed = 0;
    document.getElementById('seed').value = ""; // Clear seed input to trigger random seed
    startGame();
  };
  updateUI();
}

// On game open
window.onload = () => {
  initMap();

  const savedGuest = localStorage.getItem("topoguesser_player");
  if (savedGuest) {
    currentUser = savedGuest;
    document.getElementById('userInfo').textContent = `🎮 Player: ${savedGuest}`;
    document.getElementById('startBtn').disabled = false;
  } else {
    enterNewUsername();
  }

  showChangelogs();

  // Setup a bunch of buttons
  document.getElementById("changePlayerBtn").onclick = () => {
    enterNewUsername();
  };

  document.getElementById("showAllGuessesBtn").onclick = () => {
    const seed = parseInt(document.getElementById("seed").value);
    loadAllGuesses(seed);
  };

  document.getElementById("analyzeSeedBtn").onclick = () => {
    const seed = parseInt(document.getElementById('seed').value);
    showSeedAnalysis(seed);
  };

  document.getElementById("closeAnalysisBtn").onclick = () => {
    document.getElementById("analysisPanel").style.display = 'none';
  };

  // Do not allow guesses to be submit when there is no game loaded
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('leafletMap').style.pointerEvents = 'none';

  // Get and setup the recent seed panel
  loadRecentSeeds();
  setInterval(loadRecentSeeds, 30000);
  
  // Get and create the overall leaderboard panel
  updateOverallLeaderboard(leaderboardData);
};

async function sendScoreForOverallLeaderboardToServer(user, scoreToAdd) {
  const res = await fetch('/overallLeaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, scoreToAdd }),
  });

  const result = await res.json();

  if (result.success) {
    console.log(`Leaderboard updated! Total score: ${result.totalScore}, Games played: ${result.gamesPlayed}`);
  } else {
    console.error('Failed to update leaderboard');
  }
}

function sendGuessToServer(lat, lng, distance) {
  if (!currentUser) return;
  const seed = parseInt(document.getElementById("seed").value);
  const payload = { user: currentUser, seed, round: roundsPlayed, lat, lng, distance };
  
  fetch("/guesses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
}

function enterNewUsername(){
    const name = prompt("Enter your username:", "e.g. James") || "Player";
    currentUser = name;
    localStorage.setItem("topoguesser_player", name);
    document.getElementById('userInfo').innerHTML = `🎮 Guest: <b>${name}</b>`;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('googleBtn').style.display = 'none';
}

// Determine what version is more recent
function compareVersions(v1, v2) {
  const splitV1 = v1.split('.').map(Number);
  const splitV2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(splitV1.length, splitV2.length); i++) {
    const num1 = splitV1[i] || 0;
    const num2 = splitV2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function showChangelogs() {
  let lastVersion = localStorage.getItem('lastVersionSeen') || "0.0";

  // Find all versions greater than lastVersion
  const newVersions = versions.filter(v => compareVersions(v.version, lastVersion) === 1);

  if (newVersions.length === 0) {
    // No new versions, no need to show anything
    return;
  }

  // Show changelogs one by one, allow user to skip remaining
  for (let i = 0; i < newVersions.length; i++) {
    const { version, changelog } = newVersions[i];

    // Here, for simplicity, use confirm dialogs.
    // In real UI, replace with modal or custom banner with "Next" and "Skip" buttons
    let message;
    if (version != currentVersion){
      message = `What's new in version ${version}:\n\n${changelog}\n\nPress OK to see next update or Cancel to skip.`;
    }
    else {
      message = `What's new in version ${version}:\n\n${changelog}`;
    }

    const proceed = confirm(message);

    if (!proceed) {
      // User chose to skip remaining updates
      break;
    }

    // Update stored version to current one shown
    localStorage.setItem('lastVersionSeen', version);
  }

  // After showing, make sure lastVersionSeen is set to currentVersion
  localStorage.setItem('lastVersionSeen', currentVersion);
}

function sendSeedLeaderboardToServer(data) {
  console.log("📤 Sending leaderboard data to server:", data);

  fetch('/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    console.log("📥 Server response:", result);

    if (!result.success) {
      console.warn("⚠️ Leaderboard update failed:", result.message || 'Unknown error');
      if (result.error) {
        console.error("❌ Supabase error:", result.error);
      }
      if (result.data && result.data.length === 0) {
        console.warn("⚠️ No rows affected, likely RLS or constraint issue.");
      }
    } else {
      console.log("✅ Leaderboard update success:", result.message);
    }
  })
  .catch(err => {
    console.error("🔥 Fetch or server error:", err);
  });
}

function loadOtherGuesses() {
  const seed = parseInt(document.getElementById("seed").value);
  const round = roundsPlayed;
  fetch(`/guesses/${seed}/${round}`).then(r => r.json()).then(data => {
    data.forEach(g => {
      if (g.user !== currentUser) {
        const score = Math.max(0, Math.round(100 - 40 * (Math.log(g.distance + 1) - 5)));
        const color = getUserColor(g.user);
        L.circleMarker([g.lat, g.lng], {
          radius: 6,
          fillColor: color,
          color: "white",
          weight: 1,
          fillOpacity: 0.7
        }).addTo(map).bindPopup(`
          <b style="color:${color}">${g.user}</b><br/>
          ${g.distance.toFixed(2)} km away<br/>
        `);
      }
    });
  });
}


function loadAllGuesses(seed) {
  fetch(`/guesses?seed=${seed}`).then(r => r.json()).then(data => {
    map.eachLayer(l => {
      if (l instanceof L.CircleMarker || l instanceof L.Marker) {
        map.removeLayer(l);
        }
      });
      data.forEach(g => {
        const color = getUserColor(g.user);
        L.circleMarker([g.lat, g.lng], {
          radius: 6,
          fillColor: color,
          color: "white",
          weight: 1,
          fillOpacity: 0.7
        }).addTo(map).bindPopup(`
        <b style="color:${color}">${g.user}</b><br/>
        Round ${g.round}<br/>
        ${g.distance.toFixed(2)} km away
      `);
    });
  });
}

function showSeedLeaderboard() {
    const seed = parseInt(document.getElementById("seed").value);
    fetch(`/leaderboard?seed=${seed}`).then(r => r.json()).then(data => {
      const list = data.map(d => {
        const color = getUserColor(d.user);
        return `<li><strong style="color:${color}">${d.user}</strong>: ${d.totalScore} pts (${d.rounds} rounds)</li>`;
      }).join("");
      document.getElementById("result").innerHTML += `
      <br/><strong>🏆 Leaderboard:</strong>
      <ol>${list}</ol>
    `;
  });
}

async function updateOverallLeaderboard() {
  // Get the container
  const container = document.getElementById('overallLeaderboard');
  if (!container) return;

  // Get the leaderboard data from the server
  const res = await fetch('/overallLeaderboard');
  const result = await res.json();
  if (!result.success) {
    container.innerHTML = "<p>Failed to load leaderboard</p>";
    return;
  }

  let entries = result.entries.map(e => ({
    player: e.user,
    totalScore: e.totalScore,
    roundsPlayed: e.gamesPlayed
  }));

  // Sort entries by totalScore descending (highest first)
  entries.sort((a, b) => b.totalScore - a.totalScore);

  // emojis for top 3
  const medals = ['🏆', '🥈', '🥉'];

  // Build table header
  let html = `
    <h3>Overall Leaderboard<\h3>
    <p>Normal gamemode and Normal time mode<\p>
    <table>
      <thead>
        <tr>
          <th>Placing</th>
          <th>Player Name</th>
          <th>Total Score</th>
          <th>Games Played</th>
        </tr>
      </thead>
    <tbody>
  `;

  // Build table rows
  entries.forEach((entry, index) => {
  const placing = medals[index] ? `${medals[index]} ${index + 1}` : `${index + 1}`;
    html += `
      <tr>
        <td>${placing}</td>
        <td>${entry.player}</td>
        <td>${entry.totalScore}</td>
        <td>${entry.roundsPlayed}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';

  // Update container content
  container.innerHTML = html;
}

    function showSeedAnalysis(seed) {
      fetch(`/seed-analysis/${seed}`).then(r => r.json()).then(data => {
        const content = document.getElementById('analysisContent');
        let html = `<strong>Seed ${seed}</strong><hr>`;
        Object.keys(data.roundData || {}).sort().forEach(round => {
          const guesses = data.roundData[round];
          const answer = data.answers?.[round];
          html += `<div class="round-analysis"><strong>Round ${round}</strong>`;
          if (answer) {
            html += ` 📍 Ans: ${answer.lat.toFixed(4)}, ${answer.lng.toFixed(4)}`;
          }
          html += `<br>`;
          guesses.forEach((g, i) => {
            const score = Math.max(0, Math.round(100 - 40 * (Math.log(g.distance + 1) - 5)));
            const color = getUserColor(g.user);
            html += `${i+1}. <b style="color:${color}">${g.user}</b>: ${score} pts (${g.distance.toFixed(2)}km)<br>`;
          });
          html += "<hr>";
        });
        content.innerHTML = html;
        document.getElementById('analysisPanel').style.display = 'block';
      });
    }

    function loadRecentSeeds() {
      fetch('/api/seeds/recent').then(r => r.json()).then(seeds => {
        const container = document.getElementById('recentSeedsList');
        container.innerHTML = '';
        seeds.forEach(s => {
          const div = document.createElement('div');
          div.className = 'seed-item';
          div.innerHTML = `<strong>Seed ${s.seed}</strong><br/><small>${s.playerCount} players • ${s.totalRounds} rounds</small>`;
          div.onclick = () => {
            document.getElementById('seed').value = s.seed;
            loadOtherGuesses();
            map.setView([-41.3, 174.8], 5);
          };
          container.appendChild(div);
        });
      });
    }

    // Generate consistent color for any user
    function getUserColor(user) {
      let hash = 0;
      for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = hash % 360;
      return `hsl(${hue}, 70%, 50%)`;
    }


// === HELPER FUNCTIONS ===
function seededRandom(s) {
  s.value = (s.value * 9301 + 49297) % 233280;
  return s.value / 233280;
}

function randomInRange(s, min, max) {
  return min + seededRandom(s) * (max - min);
}

function wrapLongitude(lon) {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

function haversine(aLat, aLng, bLat, bLng) {
  const toRad = x => x * Math.PI / 180, R = 6371;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function longitudeToTileX(lon, zoom) {
  const wrapped = wrapLongitude(lon);
  return Math.floor((wrapped + 180) / 360 * Math.pow(2, zoom));
}

function latitudeToTileY(lat, zoom) {
  const rad = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(rad) + 1/Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, zoom));
}

function compareVersions(v1, v2) {
  const splitV1 = v1.split('.').map(Number);
  const splitV2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(splitV1.length, splitV2.length); i++) {
    const num1 = splitV1[i] || 0;
    const num2 = splitV2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}
