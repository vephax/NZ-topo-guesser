let seedObj = { value: 12345 };
let answerLat = 0, answerLng = 0, guessLat = null, guessLng = null;
let hasGuessed = false, timerInt = null, roundsPlayed = 0, totalRounds = 0, scoreTotal = 0;
let map, guessMarker;
let currentUser = null;
const currentVersion = "9.6.2";

const versions = [
  { version: "9.2", changelog: "8/8/2025 \n The server works now. It only took 6 hours. No more AI slop is here. Leaderboards and seed analysis now work due to an actual game data system. A server. Not what was here before, aka a link." },
  { version: "9.3", changelog: "9/8/2025 \n This is update does not add much, still just a lot of fixes from AI slops. A few new features but most new features will come out on Sunday. \n \n - Added an overall leaderboard system (took way too long) \n - Moved recent seeds panel to a more convenient location \n - The current player system now works and is objectively better. (google sign in is gone, due to Arya's request) \n Brought back audio (lost due to AI Slop). No new audio clips yet (coming soon) \n - Removed urban mode temporarily due to being broken. Will be back working on Sunday and much better and faster. \n - Added a version control system (this) \n - Added a dev mode \n - Numerous bug fixes related to AI slops or being able to submit a guess before a game starts resulting in (0, 0) \n - Banned Max from doing brain rot AI slops \n \n For more information regarding the development, leaving feedback and answering a few poles, etc, please see the google doc. \n - Menno" },
  { version: "9.3.1", changelog: "10/8/2025 \n - Fixes a bug where new players would not see version prompts and recents/leaderboard panels would not load."},
  { version: "9.4", changelog: "11/8/2025 \n\n - Changed the beach mode system so that you know choose a game type. Defaults to everywhere. \n\n - Brought back urban mode which is now a gametype and much much faster especially on good internet connections. The relative probabilities are not perfect (e.g. Dunedin) so if you notice any urban locations that are too common or too uncommon, let me know.\n\n - Made recent seeds panel have the header and buttons fixed at the top instead of scrolling with the menu. \n\n - Added average to overall leaderboard \n\n - Added state highway mode which places you somewhere on the stateway system. \n\n - Mennod"},
  { version: "9.4.1", changelog: "11/8/2025 \n\n - Changed scoring system to now have a better function.\n if you get anywhere on the screen you will get maximum points \n\n - now rounds score, for average etc \n\n - rainbow buttons \n\n - boxes next to eachother \n\n - lowered chathams chance \n\n - Max 😁"},
  { version: "9.4.2", changelog: "12/8/2025 \n\n - Added better version history logs.🥰🥰🥰 "},
  { version: "9.5", changelog: "12/8/2025 \n\n - Holy Guacamole, we're diversifying, \n now able to play study and practice studying \n with great functionality for all involved \n just scroll to the bottom to see the diversification \n most are prettttty acurate \n not liable for any problems you may have. "},
  { version: "9.6", changelog: "14/8/2025 \n\n This one is for Arya \n \n - Added Bush Mode (experimental) :D \n\n - Edited and added new audio clips. There are now 13 good and 13 bad. \n\n - Menno"},
  { version: "9.6.1", changelog: "14/8/2025 \n\n Holy Guacamole, we're diversifying, \n reaction schemer now exists \n with great functionality for all involved \n 🥰🥰🥰"},
  { version: "9.6.2", changelog: "15/8/2025 \n\n The trash has been removed due to Max's defeat in an art competition. You are welcome for my service. \n\n - Removed Chem Schemer PERMENANTLY! \n\n - Menno"}
];

// === REGION DATA ===
const NZ_REGIONS = [
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
];

// === URBAN DATA ===
const URBAN_DENSE_REGIONS = [
  { probability: 0.5, latMin: -35.6410281773, latMax: -36.1456719813, lngMin: 173.8378092876, lngMax: 174.610898313 }, // Northland, Whangarei 
  { probability: 1, latMin: -36.3064410726, latMax: -37.2780887541, lngMin: 174.4113669366, lngMax: 175.1056737767 }, // Auckland
  { probability: 0.2, latMin: -36.6981555991, latMax: -37.4660308328, lngMin: 175.4714631908, lngMax: 175.9938126745 }, // Coromandel
  { probability: 0.7, latMin: -37.5166574376, latMax: -38.0683759225, lngMin: 175.1130919234, lngMax: 175.8207006996 }, // Upper Waikato, Hamilton
  { probability: 0.7, latMin: -37.6199213447, latMax: -38.1888156576, lngMin: 176.0112634646, lngMax: 177.3163715341 }, // Bay of Plenty
  { probability: 0.4, latMin: -38.1644635952, latMax: -39.0299791399, lngMin: 175.1866164102, lngMax: 176.1344155456 }, // Taupo, Taumarunui, Tokoroa, Turangi
  { probability: 0.2, latMin: -38.6218377718, latMax: -38.7121870825, lngMin: 177.9543478631, lngMax: 178.1548467465 }, // Gisborne
  { probability: 0.5, latMin: -38.9658922115, latMax: -39.6096526402, lngMin: 173.9284943222, lngMax: 174.3133654056 }, // Taranaki
  { probability: 0.5, latMin: -39.3588831128, latMax: -39.7031825907, lngMin: 176.7335466148, lngMax: 176.9945519251 }, // Hawkes bay
  { probability: 0.7, latMin: -39.879355388, latMax: -40.7794196634, lngMin: 174.9465562091, lngMax: 175.6961279984 }, // Manawatu - Whanganui
  { probability: 0.4, latMin: -41.0156795517, latMax: -41.4287177609, lngMin: 172.9797375171, lngMax: 173.3529094433 }, // Nelson
  { probability: 0.2, latMin: -41.2567730505, latMax: -41.56567688, lngMin: 173.7554468538, lngMax: 174.0629192247 }, // Blenheim to Picton
  { probability: 1, latMin: -40.8202008309, latMax: -41.3558866486, lngMin: 174.7033266791, lngMax: 175.720060165 }, // Wellington to Masterton
  { probability: 1, latMin: -43.0461966506, latMax: -43.6748700683, lngMin: 171.9076755803, lngMax: 172.8235807803 }, // Christchurch
  { probability: 0.33, latMin: -43.8653308619, latMax: -44.4318079231, lngMin: 171.1557346607, lngMax: 171.8065776671 }, // Timaru to Ashburton
  { probability: 0.8, latMin: -44.6448938446, latMax: -45.7312944055, lngMin: 168.5959301207, lngMax: 171.2064861988 }, // Otago minus Dunedin
  { probability: 1, latMin: -45.7323044158, latMax: -46.6321343699, lngMin: 167.940963096, lngMax: 170.7583445906 }  // South land plus Dunedin
];

const URBAN_TOWNS = [
  {lat: -35.566014, lng: 174.506321}, {lat: -35.51293, lng: 173.389492}, {lat: -35.530489, lng: 173.38902},
  {lat: -35.351944, lng: 173.882675}, {lat: -35.407222, lng: 173.799033}, {lat: -35.32257, lng: 173.76852},
  {lat: -35.398411, lng: 173.504119}, {lat: -35.361012, lng: 173.544545}, {lat: -34.993604, lng: 173.710928},
  {lat: -35.119642, lng: 173.264008}, {lat: -35.09964, lng: 173.264565}, {lat: -35.163661, lng: 173.157749},
  {lat: -35.176491, lng: 173.140025}, {lat: -34.972094, lng: 173.540125}, {lat: -34.991699, lng: 173.529911},
  {lat: -34.993315, lng: 173.504505}, {lat: -34.992894, lng: 173.47043}, {lat: -35.043359, lng: 173.256154},
  {lat: -34.870739, lng: 173.383398}, {lat: -34.888343, lng: 173.369107}, {lat: -34.878205, lng: 173.294091},
  {lat: -34.815206, lng: 173.118653}, {lat: -35.407568, lng: 173.798518}, {lat: -35.388507, lng: 174.020948},
  {lat: -35.381161, lng: 174.072447}, {lat: -35.290276, lng: 174.097037}, {lat: -35.276441, lng: 174.082317},
  {lat: -35.277981, lng: 174.051461}, {lat: -35.305302, lng: 174.121671}, {lat: -35.26183, lng: 174.127164},
  {lat: -35.345287, lng: 174.349594}, {lat: -35.388019, lng: 174.3435}, {lat: -35.231827, lng: 173.947606},
  {lat: -35.222438, lng: 173.959751}, {lat: -35.209773, lng: 173.977561}, {lat: -35.194872, lng: 174.000177},
  {lat: -37.332204, lng: 174.909983}, {lat: -37.110583, lng: 175.296392}, {lat: -37.090471, lng: 175.302401},
  {lat: -36.957622, lng: 175.237641}, {lat: -36.294445, lng: 174.802308}, {lat: -36.282657, lng: 174.516921},
  {lat: -36.29925, lng: 174.524603}, {lat: -36.167417, lng: 174.446969}, {lat: -35.630324, lng: 174.500785},
  {lat: -35.633774, lng: 174.529324}, {lat: -36.133313, lng: 174.025111}, {lat: -35.608727, lng: 174.287624},
  {lat: -35.586778, lng: 174.285693}, {lat: -36.948091, lng: 175.17035}, {lat: -36.950559, lng: 175.154128},
  {lat: -39.675344, lng: 175.796056}, {lat: -39.464794, lng: 175.674648}, {lat: -39.428394, lng: 175.455136},
  {lat: -39.41679, lng: 175.398617}, {lat: -39.402698, lng: 175.413591}, {lat: -39.427764, lng: 175.275275},
  {lat: -38.465041, lng: 175.012718}, {lat: -38.698055, lng: 174.61833}, {lat: -38.334342, lng: 175.165329},
  {lat: -39.17267, lng: 175.398402}, {lat: -38.095604, lng: 176.07831}, {lat: -37.556369, lng: 175.919652},
  {lat: -37.542488, lng: 175.925574}, {lat: -37.801357, lng: 174.889426}, {lat: -37.803598, lng: 174.857669},
  {lat: -37.393469, lng: 174.717464}, {lat: -37.402397, lng: 175.14533}, {lat: -39.452355, lng: 173.85654},
  {lat: -39.191237, lng: 173.877439}, {lat: -39.74642, lng: 174.466066}, {lat: -39.759016, lng: 174.479456},
  {lat: -39.761295, lng: 174.629788}, {lat: -38.996287, lng: 174.390364}, {lat: -38.69835, lng: 174.618587},
  {lat: -38.469165, lng: 177.868009}, {lat: -38.370986, lng: 178.296647}, {lat: -38.12924, lng: 178.316045},
  {lat: -37.892595, lng: 178.316903}, {lat: -37.619314, lng: 177.906804}, {lat: -37.740329, lng: 177.678623},
  {lat: -37.63468, lng: 178.36617}, {lat: -37.815459, lng: 177.634678}, {lat: -46.130094, lng: 167.684155},
  {lat: -40.025529, lng: 176.345758}, {lat: -40.301803, lng: 176.612606}, {lat: -39.995703, lng: 176.553726},
  {lat: -39.940392, lng: 176.593637}, {lat: -39.896255, lng: 176.627541}, {lat: -39.816036, lng: 176.990175},
  {lat: -39.819561, lng: 176.452789}, {lat: -39.913667, lng: 176.418586}, {lat: -39.028803, lng: 177.419972},
  {lat: -39.045197, lng: 177.425079}, {lat: -38.968496, lng: 177.40551}, {lat: -39.082023, lng: 177.873631},
  {lat: -39.01663, lng: 177.884703}, {lat: -38.752332, lng: 177.926416}, {lat: -38.623575, lng: 177.889037},
  {lat: -41.092761, lng: 176.070242}, {lat: -40.337767, lng: 175.866351}, {lat: -40.452013, lng: 175.841761},
  {lat: -40.792678, lng: 175.083146}, {lat: -40.288593, lng: 175.754471}, {lat: -40.336633, lng: 175.867424},
  {lat: -40.452727, lng: 175.839872}, {lat: -40.644973, lng: 175.705462}, {lat: -40.208869, lng: 176.098909},
  {lat: -40.191835, lng: 176.106892}, {lat: -40.069625, lng: 176.217227}, {lat: -40.110367, lng: 176.26246},
  {lat: -39.809154, lng: 175.788932}, {lat: -40.058776, lng: 175.778589}, {lat: -41.587701, lng: 175.234723},
  {lat: -42.968404, lng: 172.693062}, {lat: -42.9232, lng: 172.643623}, {lat: -42.772962, lng: 172.852235},
  {lat: -43.047421, lng: 173.07415}, {lat: -42.522882, lng: 172.832623}, {lat: -42.420555, lng: 173.694448},
  {lat: -42.384474, lng: 173.681402}, {lat: -42.655094, lng: 173.044281}, {lat: -41.671101, lng: 174.074378},
  {lat: -44.607687, lng: 170.193071}, {lat: -44.491318, lng: 169.969783}, {lat: -44.616652, lng: 169.267902},
  {lat: -44.490673, lng: 169.971542}, {lat: -44.256418, lng: 170.106297}, {lat: -44.007663, lng: 170.483522},
  {lat: -44.099388, lng: 170.831394}, {lat: -44.487612, lng: 171.211925}, {lat: -44.262629, lng: 171.134205},
  {lat: -43.631245, lng: 171.644855}, {lat: -43.817647, lng: 172.951326}, {lat: -43.80262, lng: 172.971497},
  {lat: -43.824107, lng: 172.706752}, {lat: -43.761286, lng: 172.300086}, {lat: -43.812221, lng: 172.254682},
  {lat: -43.754561, lng: 172.024784}, {lat: -44.674074, lng: 167.921605}, {lat: -44.850438, lng: 168.390112},
  {lat: -45.567323, lng: 167.614117}, {lat: -45.410951, lng: 167.725439}, {lat: -40.854412, lng: 172.806745},
  {lat: -40.834192, lng: 172.880902}, {lat: -40.81217, lng: 172.918324}, {lat: -40.679458, lng: 172.680187},
  {lat: -41.24881, lng: 172.115498}, {lat: -41.527311, lng: 171.942233}, {lat: -41.856984, lng: 171.952128},
  {lat: -41.74924, lng: 171.561513}, {lat: -41.716034, lng: 171.768022}, {lat: -41.607343, lng: 171.877069},
  {lat: -41.631297, lng: 171.854753}, {lat: -41.804224, lng: 172.330384}, {lat: -41.802715, lng: 172.849789},
  {lat: -42.114878, lng: 171.86368}, {lat: -41.755272, lng: 171.651163}, {lat: -42.108682, lng: 171.334834},
  {lat: -42.373653, lng: 171.245184}, {lat: -42.399534, lng: 171.256685}, {lat: -42.348882, lng: 171.543961},
  {lat: -42.431418, lng: 171.215057}, {lat: -42.470535, lng: 171.19935}, {lat: -42.530155, lng: 171.164246},
  {lat: -42.450044, lng: 171.311789}, {lat: -42.575853, lng: 171.478815}, {lat: -42.718151, lng: 170.973102},
  {lat: -42.897521, lng: 170.817575}, {lat: -43.387221, lng: 170.182514}, {lat: -43.465393, lng: 170.018663},
  {lat: -43.880337, lng: 169.041095}, {lat: -43.939768, lng: 168.858919}, {lat: -46.130094, lng: 167.684155},
  {lat: -46.898164, lng: 168.126397}
];

//Game values that are constant per game.
let gameType;
let zoom;
let timerMode;

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

const goodSounds = ['good1', 'good2', 'good3', 'good4', 'good5', 'good6', 'good7', 'good8', 'good9', 'good10', 'good11', 'good12', 'good13'];
const badSounds = ['bad1', 'bad2', 'bad3', 'bad4', 'bad5', 'bad6', 'bad7', 'bad8', 'bad9', 'bad10', 'bad11', 'bad12', 'bad13'];

function playRandomSound(soundList) {
  const id = soundList[Math.floor(Math.random() * soundList.length)];
  const audio = document.getElementById(id);
  if (audio) audio.play().catch(e => console.warn("Playback blocked:", e));
}

function getRandomNZRegion() {
  const region = NZ_REGIONS[Math.floor(seededRandom() * NZ_REGIONS.length)];
  return {
    lat: seededRandomInRange(region.latMin, region.latMax),
    lng: seededRandomInRange(region.lngMin, region.lngMax)
  };
}

async function tileHasLand(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
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

async function tileHasEnoughBush(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
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
    let contour = 0;
    let bush = 0;
    let road = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (b > 72 && b < 120 && r > 170 && r < 190 && g > 140 && g < 160) { contour++; continue; }
      if (r < 230 && r > 200 && g < 240 && g > 215 && b < 195 && b > 130) { bush++; continue; } 
      if (r > 200 && r < 220 && g > 90 && g < 120 && b < 50) road++;
      if (r > 200 && r < 240 && g > 150 && g < 165 && b < 50 && b > 10) road++;
      if (road > 30) {console.log("Road Detected"); return false;}
    }
    
    return (bush > 5000 ) || contour >= 800;
  } catch { return false; }
}

async function tileHasEnoughWater(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
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

async function getValidUrbanLocation(){
  // Get an urban dense region
  let region = null;
  let iterations = 0;
  while (region === null){
    iterations++;
    index = Math.floor(seededRandom() * URBAN_DENSE_REGIONS.length)
    random = seededRandom();
    // Only get this region depending on its probability
    if (random <= URBAN_DENSE_REGIONS[index].probability){
      region = URBAN_DENSE_REGIONS[index]
      console.log(index);
    }
    // If too many iterations, default to Auckland
    if (iterations === 20){
      region = URBAN_DENSE_REGIONS[1];
    }
  }
  console.log("Took " + iterations + " iterations to find a region");

  // Get a valid set of coordinates
  let lat;
  let lng;
  for (let i = 0; i <= 30; i += 1){
    lat = seededRandomInRange(region.latMin, region.latMax);
    lng = seededRandomInRange(region.lngMin, region.lngMax);
    console.log("Checking for location in region " + i)
    if (await tileHasEnoughUrban(lat, lng)){
      console.log(lat, lng);
      return {lat: lat, lng: lng};
    }
  }

  console.log("Random town selected");
  // Too many iterations so return random town from given coordinates shift by up to 1.5km.
  town = URBAN_TOWNS[Math.floor(seededRandom() * URBAN_TOWNS.length)];
  if (0.5 <= seededRandom()){
    town.lat += 0.015 * seededRandom();
  }
  else {
    town.lat += -0.015 * seededRandom();
  }
  if (0.5 <= seededRandom()){
    town.lng += 0.015 * seededRandom();
  }
  else {
    town.lng += -0.015 * seededRandom();
  }
  return town;
}

async function tileHasEnoughUrban(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
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
    for (let i = 0; i < data.length; i++) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (r > 183 && r < 187 && g > 183 && g < 187 && b > 178 && b < 184) urban++;
    }
    return urban >= 100;
  } catch { return false; }
}

async function tileHasEnoughHighway(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
  console.log(x + ", " + y);
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const data = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    let highway = 0;
    for (let i = 0; i < data.length; i++) {
      const [r, g, b] = [data[i], data[i+1], data[i+2]];
      if (r > 200 && r < 220 && g > 90 && g < 120 && b < 50) highway++;
    }
    return highway >= 10;
  } catch { return false; }
}

async function getValidLocation() {

  if (gameType === "Urban"){
    return await getValidUrbanLocation();
  }

  for (let i = 0; i < 500; i++) {
    const loc = getRandomNZRegion();
    console.log("Checking location " + loc);

    if (gameType === "Beach") {
      if (await tileHasLand(loc.lat, loc.lng) && await tileHasEnoughWater(loc.lat, loc.lng)) return loc;

    } else if (gameType === "Highway") {
      if (await tileHasEnoughHighway(loc.lat, loc.lng)) return loc;
      
    } else if (gameType === "Bush") {
      if (await tileHasEnoughBush(loc.lat, loc.lng)) return loc;

    } else { //Gametype is }Everywhere"
      if (await tileHasLand(loc.lat, loc.lng)) return loc;
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
  document.getElementById('mapFrame').style.pointerEvents = 'none';

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

    // Get constant game values
    zoom = +document.getElementById('zoom').value;
    gameType = document.getElementById('gameType').value;
    timerMode = document.getElementById('timerMode').value;
  }
  
  roundsPlayed++;
  updateUI();

  const timerLen = timerMode === 'none' ? null : parseInt(timerMode);
  // Wait until we get a valid location
  const loc = await getValidLocation();
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
  const score = Math.max(0, Math.round(dist < 2.5 ? 300 : 300 - Math.sqrt(180 * (dist - 2.5))));


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

    // Are we in normal mode?
    if (timerMode === "30" && gameType === "Everywhere" && zoom === 14) {
      sendScoreForGameTypeLeaderboardToServer(scoreTotal);
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
window.onload = async () => {
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
  document.getElementById("gameTitle").textContent = "NZ Topo Guesser V" + currentVersion + " - Sponsored by Water";

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

  // Get and create the game type leaderboard panel
  updateGameTypeLeaderboard(gameType = "Everywhere", sortBy = "totalScore");

  // Do not allow guesses to be submit when there is no game loaded
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('leafletMap').style.pointerEvents = 'none';

  // Get and setup the recent seed panel
  loadRecentSeeds();
  setInterval(loadRecentSeeds, 30000);
};

async function sendScoreForGameTypeLeaderboardToServer(scoreValue) {
  const res = await fetch('/gameTypeLeaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: currentUser, scoreToAdd: scoreValue }),
  });
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

async function enterNewUsername(){
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

async function updateGameTypeLeaderboard(leaderboardGameType, sortBy = "totalScore") {
  // Get the container
  const container = document.getElementById('gameTypeLeaderboard');

  try {
    // Fetch leaderboard data filtered by gameType
    const res = await fetch(`/gameTypeLeaderboard?gameType=${encodeURIComponent(leaderboardGameType)}`);
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = "<p>Failed to load leaderboard</p>";
      return;
    }

    // Prepare entries
    let entries = result.entries.map(e => ({
      player: e.user,
      totalScore: e.totalScore,
      roundsPlayed: e.gamesPlayed,
      averageScore: e.gamesPlayed > 0 ? e.totalScore / e.gamesPlayed : 0
    }));

    // Sort client-side
    entries.sort((a, b) => {
      let valA, valB;

      if (sortBy === "totalScore") {
        valA = a.totalScore; valB = b.totalScore;
      } else if (sortBy === "gamesPlayed") {
        valA = a.roundsPlayed; valB = b.roundsPlayed;
      } else if (sortBy === "averageScore") {
        valA = a.averageScore; valB = b.averageScore;
      }

      return valA - valB;
    });

    // Emojis for the top 3
    const emojis = ['🏆', '🥈', '🥉'];

    // Build table header
    let html = `
      <h3>Everywhere Leaderboard</h3>
      <table>
        <thead>
          <tr>
            <th>Placing</th>
            <th>Player Name</th>
            <th>Total Score</th>
            <th>Games Played</th>
            <th>Average Score</th>
          </tr>
        </thead>
      <tbody>
    `;

    // Build table rows
    entries.forEach((entry, index) => {
      const placing = emojis[index] ? `${emojis[index]}` : `${index + 1}`;
      html += `
        <tr>
          <td>${placing}</td>
          <td>${entry.player}</td>
          <td>${entry.totalScore}</td>
          <td>${entry.roundsPlayed}</td>
          <td>${Math.round(entry.averageScore)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';

    // Update container content
    container.innerHTML = html;
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    container.innerHTML = "<p>Error loading leaderboard</p>";
  }
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

// Generate consistent color for a user
function getUserColor(user) {
  let hash = 0;
  for (let i = 0; i < user.length; i++) {
    hash = user.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}


// === HELPER FUNCTIONS ===
function seededRandom() {
  seedObj.value = (seedObj.value * 9301 + 49297) % 233280;
  return seedObj.value / 233280;
}

function seededRandomInRange(min, max) {
  return min + seededRandom() * (max - min);
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

function longitudeToTileX(lon) {
  const wrapped = wrapLongitude(lon);
  return Math.floor((wrapped + 180) / 360 * Math.pow(2, zoom));
}

function latitudeToTileY(lat) {
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
