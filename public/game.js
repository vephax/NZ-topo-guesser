let seedObj = { value: 12345 };
let answerLat = 0, answerLng = 0, guessLat = null, guessLng = null;
let hasGuessed = false, timerInt = null, roundsPlayed = 0, totalRounds = 0, _totalScore = 0;
let guessMap, guessMarker;
let _currentUser = null;
let guessMapBasemapLayer = null;
const currentVersion = "10.1";

const versions = [
  { version: "10.1", changelog: `3/9/2025 \n\n - Added the ability to recommend games and play said games. \n - Added a famous locations game type. There are some hard locations and there is Auckland CBD. Since this is quite easy, it may be made harder in the future (e.g. always hard mode.). There are over 150, quite unique famous locations. \n - Reworked 'played' seeds to no longer be 'purple' and now appear on their own tab similar to now recent and recommended. \n - Custom Settings are now purple to make it easier to understand what is custom in the 'Game Info' panel. \n - A few interface and text changes that I did not like regarding the new 10.0 interfaces \n - Fixed a bug where the leaderboard would only show 4 rounds on game completion.` } 
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
  {lat: -46.898164, lng: 168.126397}, {lat: -38.456565, lng: 176.7062}, {lat: -38.409498, lng: 176.56424},
  {lat: -38.152394, lng: 174.737935}, {lat: -38.064118, lng: 174.819131}, {lat: -38.009841, lng: 174.82192}, 
  {lat: -43.952308, lng: -176.558232}
];

// === FAMOUS LOCATIONS DATA ===
const FAMOUS_LOCATIONS = [
  { name: "Sutherland Falls", description: "At 580m, Sutherland Falls is New Zealand’s tallest waterfall and one of the tallest in the world.", lat: -44.80037, lng: 167.728701 },
  { name: "Kepler Track", description: "A 60km Great Walk through Fiordland National Park’s alpine environment.", lat: -45.3862, lng: 167.607164 },
  { name: "Raikura Track", description: "A Great Walk on Stewart Island with coastal scenery.", lat: -46.865539, lng: 167.758012 },
  { name: "Routeburn Track", description: "A popular Great Walk linking Fiordland and Mt Aspiring National Parks.", lat: -44.727269, lng: 168.209138 },
  { name: "Heaphy Track", description: "A 78km Great Walk known for diverse landscapes and nikau palms.", lat: -40.885505, lng: 172.311416 },
  { name: "Paparoa Track", description: "A West Coast Great Walk combining forest and coastline.", lat: -42.195917, lng: 171.450448 },
  { name: "Abel Tasman Coast Track", description: "A coastal Great Walk famed for its stunning golden beaches.", lat: -40.856881, lng: 173.012867 },
  { name: "Tongariro Crossing", description: "A day hike across volcanic terrain and emerald lakes.", lat: -39.14093, lng: 175.612206 },
  { name: "Round the Mountain Track", description: "A 66km circuit tramp around Mount Ruapehu.", lat: -39.342048, lng: 175.538135 },
  { name: "Lake Waikaremoana Track", description: "A Great Walk circumnavigating Lake Waikaremoana.", lat: -38.748373, lng: 177.027254 },
  { name: "Milford Track", description: "The 53km Great Walk through Milford Sound is New Zealand’s most famous Great Walk.", lat: -44.917937, lng: 167.92624 },
  { name: "Hump Ridge Track", description: "A southern coastal track with dramatic cliffs and vistas, often referred to as New Zealand’s toughest Great Walk.", lat: -46.192798, lng: 167.310834 },
  { name: "Fanthams Peak (Mt. Taranaki)", description: "A subsidiary peak on the slopes of Mount Taranaki.", lat: -39.31041, lng: 174.067984 },
  { name: "Mt Taranaki", description: "A near-perfect volcanic cone and iconic Taranaki landmark.", lat: -39.295871, lng: 174.061975 },
  { name: "Mount Ruapehu", description: "An 2,797m tall active volcano and major North Island ski destination.", lat: -39.275269, lng: 175.56942 },
  { name: "Mount Ngauruhoe", description: "A 2,291m tall symmetrical volcanic cone featured in major films such as the Lord of the Rings as Mount Doom.", lat: -39.158337, lng: 175.633535 },
  { name: "Mount Tongaririo", description: "A 1,978m tall volcano in Tongariro National Park with the most active vents.", lat: -39.124786, lng: 175.652504 },
  { name: "Cape Egmont Lighthouse", description: "A 19th-century lighthouse on Taranaki’s western most point.", lat: -39.275273, lng: 173.753972 },
  { name: "East Cape", description: "The easternmost point of mainland New Zealand.", lat: -37.689731, lng: 178.547054 },
  { name: "Bread Capital of New Zealand", description: "The town of Manaia is known as the bread capital of NZ because of its thriving bakery industry, primarily through Yarrows Family Bakers. ", lat: -39.552323, lng: 174.124589 },
  { name: "Farewell Spit", description: "A 35km long sand spit and internationally important bird habitat.", lat: -40.555006, lng: 173.024025 },
  { name: "Waitomo Caves", description: "Most popular NZ limestone caves famous for glowworms and cave tours.", lat: -38.260812, lng: 175.108509 },
  { name: "Kapiti Island", description: "A predator-free island nature reserve and bird sanctuary.", lat: -40.852078, lng: 174.926634 },
  { name: "Putangirua Pinnacles", description: "Eroded earth pillars famous as a film location for Lord of the Rings", lat: -41.447818, lng: 175.248742 },
  { name: "Milford Sound", description: "A dramatic Fiordland sound known for sheer cliffs and waterfalls.", lat: -44.671477, lng: 167.925854 },
  { name: "A famous oxbow lake #1", description: "A curved lake formed from by river cut-off processes.", lat: -40.23569, lng: 176.114273 },
  { name: "A famous oxbow lake #2", description: "A curved lake formed from by river cut-off processes.", lat: -40.368765, lng: 175.63139 },
  { name: "A famous oxbow lake #3", description: "A curved lake formed from by river cut-off processes.", lat: -45.945133, lng: 167.691194 },
  { name: "A famous oxbow lake #4", description: "A curved lake formed from by river cut-off processes.", lat: -41.473907, lng: 173.981638 },
  { name: "Bell Rock", description: "A prominent rocky outcrop and local viewpoint in Hawke’s Bay.", lat: -39.100277, lng: 176.789889 },
  { name: "Waiotapu", description: "A geothermal park renowned for colorful hot springs and geothermal features.", lat: -38.340899, lng: 176.363826 },
  { name: "Waimangu", description: "A geothermal valley created by the 1886 Tarawera eruption.", lat: -38.284998, lng: 176.392021 },
  { name: "Spaghetti Junction", description: "New Zealand’s largest road interchange.", lat: -36.860618, lng: 174.760208 },
  { name: "Three Kings Islands", description: "Remote islands being an exceptional destination for big game fishing and diving.", lat: -34.157644, lng: 172.14499 },
  { name: "Rocket Lab / Mahia", description: "Where New Zealand launches its rockets.", lat: -39.261614, lng: 177.864919 },
  { name: "Lake Onslow", description: "The proposed site for New Zealand’s largest hydroelectric storage scheme.", lat: -45.546409, lng: 169.639549 },
  { name: "Captain Cook's Landing Place", description: "Historic site where James Cook first set foot in New Zealand.", lat: -38.381197, lng: 178.334713 },
  { name: "Gloriavale", description: "A small and isolated Christian cult with a population of ~468.", lat: -42.561279, lng: 171.808619 },
  { name: "Ernest Rutherford Birthplace", description: "Location of birthplace and now memorial of physicist Ernest Rutherford.", lat: -41.377244, lng: 173.101144 },
  { name: "Ward Beach Boulders", description: "Large spherical boulders exposed on a Marlborough shoreline.", lat: -41.843882, lng: 174.184585 },
  { name: "The Beehive", description: "New Zealand’s Parliament Building.", lat: -41.278011, lng: 174.775658 },
  { name: "Moeraki Boulders", description: "Large spherical concretions scattered along Moeraki Beach.", lat: -45.347909, lng: 170.82912 },
  { name: "Arthur's Pass", description: "A mountain pass and village connecting Christchurch to the West Coast.", lat: -42.944874, lng: 171.566534 },
  { name: "Haast Pass", description: "A mountain pass connecting Otago and the West Coast.", lat: -44.106378, lng: 169.353948 },
  { name: "Lewis Pass", description: "A mountain pass connecting Northern Canterbury to the West Coast.", lat: -42.378598, lng: 172.399349 },
  { name: "Cape Kidnappers", description: "The home of one of the largest gannet colonies in the world.", lat: -39.643259, lng: 177.080641 },
  { name: "Picton Ferry Terminal", description: "One of the ferry terminals connecting the North and South Island.", lat: -41.285014, lng: 174.005628 },
  { name: "Mt Cook", description: "Aoraki, Mount Cook is New Zealand’s highest mountain at 3,724m located in the Southern Alps.", lat: -43.595267, lng: 170.142989 },
  { name: "Mt Aspiring", description: "Tititea, Mount Aspiring is New Zealand’s highest mountain outside of Mt Cook National Park at 3,033m", lat:-44.384284, lng: 168.72807 }, 
  { name: "West Cape", description: "The westernmost point of New Zealand", lat: -45.903883, lng: 166.427207 },
  { name: "North Cape", description: "The northernmost point of mainland New Zealand.", lat: -34.394818, lng: 173.013897 },
  { name: "Cape Reinga Lighthouse/Cape", description: "A lighthouse at the northern tip where the two oceans meet.", lat: -34.423076, lng: 172.678256 },
  { name: "Bluff", description: "A southern port town known as the gateway to Stewart Island.", lat: -46.615001, lng: 168.338957 },
  { name: "Tiwai Point Aluminium Smelter", description: "An aluminium smelter which uses 13% of NZ’s electricity demand and producing 10% of Southland’s GDP..", lat: -46.589526, lng: 168.383203 },
  { name: "Slope Point", description: "The southernmost point of the South Island.", lat: -46.671335, lng: 169.010925 },
  { name: "South Cape", description: "The southernmost point of Stewart Island / Rakiura.", lat: -47.286523, lng: 167.539616 },
  { name: "Northern Most Glacier in the South Island", description: "The northernmost permanent glacier on the South Island part and the only glacier in the Kaikoura Ranges.", lat: -42.219698, lng: 172.587104 },
  { name: "Fox Glacier", description: "A large West Coast glacier accessible from the highway.", lat: -43.50413, lng: 170.087972 },
  { name: "Baldwin Street", description: "A steep residential street once listed as the world’s steepest.", lat: -45.848548, lng: 170.533862 },
  { name: "Abel Tasman Landing Point", description: "The location where the first European anchored at New Zealand although he never set shore.", lat: -40.820058, lng: 172.90206 },
  { name: "Lake Wakatipu", description: "A long glacial lake beside Queenstown with scenic shores.", lat: -44.908274, lng: 168.390112 },
  { name: "Lake Wanaka", description: "A large southern lake popular for recreation and mountain views.", lat: -44.553289, lng: 169.082294 },
  { name: "Auckland CBD and Sky Tower", description: "The Sky Tower is a prominent part of the Auckland Skyline which has been named as one of the most beautiful in the world.", lat: -36.848807, lng: 174.762311 },
  { name: "Rainbow's End", description: "New Zealand’s most popular amusement park.", lat: -36.993218, lng: 174.883822 },
  { name: "Waikato River Delta", description: "The tidal delta region where the Waikato River - New Zealand’s longest river - meets the sea.", lat: -37.330464, lng: 174.771409 },
  { name: "Pic's Peanut Butter Factory", description: "The manufacturing site of Pic’s famous natural peanut butter.", lat: -41.321502, lng: 173.214355 },
  { name: "Whittaker's Chocolate Factory", description: "New Zealand’s most popular chocolate brand’s chocolate factory and visitor attraction in Porirua.", lat: -41.132367, lng: 174.83192 },
  { name: "Hobbiton", description: "The reconstructed film set used in the Hobbit and LOTR movies.", lat: -37.871791, lng: 175.683789 },
  { name: "Mangatainoka Hot Springs", description: "Thermal pools historically used for bathing and relaxation. A popular destination for Hawke’s Bay locals.", lat: -39.16592, lng: 176.397085 },
  { name: "Mt Tarawera", description: "A volcano famous for its catastrophic 1886 eruption.", lat: -38.226703, lng: 176.505661 },
  { name: "Believed Location of the Pink and White Terraces", description: "The submerged and partially lost, treasured silica terraces.", lat: -38.190924, lng: 176.43043 },
  { name: "Motutaiko Island", description: "An island site featuring a notable Māori rock carving.", lat: -38.853894, lng: 175.944114 },
  { name: "Kaimanawa Wall", description: "Rock formations that serve as potential evidence of an ancient NZ civilisation in the Kaimanawa Range.", lat: -38.949189, lng: 176.188645 },
  { name: "Cape Brett", description: "A rugged peninsula forming the eastern boundary of the Bay of Islands.", lat: -35.171477, lng: 174.330583 },
  { name: "Motuarohia Island and Captain Cook’s Anchorage", description: "A small island and historic anchorage near the Bay of Islands.", lat: -35.23421, lng: 174.169822 },
  { name: "White Island", description: "An active marine volcano known for geothermal activity and tours with the last eruption in 2019.", lat: -37.520232, lng: 177.185612 },
  { name: "Clyde Dam", description: "A large hydroelectric dam on the Clutha River.", lat: -45.178905, lng: 169.306526 },
  { name: "Tapuae-O-Uenuku", description: "The largest peak in the Inland Kaikōura Range at 2,885m.", lat: -41.995557, lng: 173.663678 },
  { name: "Cape Foulwind", description: "A coastal headland with a seal colony and coastal walks that has quite the foul wind.", lat: -41.745495, lng: 171.468043 },
  { name: "Blue Lake", description: "The clearest lake in the world.", lat: -42.059377, lng: 172.658386 },
  { name: "Archway Islands", description: "Iconic sea statues which were the default lockscreen on the Windows 10 operating system..", lat: -40.499924, lng: 172.67272 },
  { name: "Te Waikoropupu Springs", description: "One of the world’s largest and clearest freshwater springs.", lat: -40.848506, lng: 172.770739 },
  { name: "Bridge to Nowhere", description: "A remote concrete bridge built for a failed settlement project.", lat: -39.270587, lng: 174.97354 },
  { name: "Whananaki Inlet Foot Bridge", description: "The longest footbridge in the Southern Hemisphere spanning the Whananaki Inlet.", lat: -35.515686, lng: 174.451904 },
  { name: "Kaipara Harbour", description: "New Zealand’s largest enclosed harbour spanning 800km of coastline.", lat: -36.414601, lng: 174.166989 },
  { name: "Ninety Mile Beach", description: "It’s actually 55 miles.", lat: -34.997704, lng: 173.151269 },
  { name: "Te Paki Sand Dunes", description: "Large coastal sand dunes used for boarding and scenic views.", lat: -34.525778, lng: 172.752457 },
  { name: "Hikurangi", description: "The tallest hill in the Gisborne region at 1,752m.", lat: -37.918894, lng: 178.061643 },
  { name: "Kaweka", description: "The tallest point in the Kaweka Ranges at 1,724m", lat: -39.282745, lng: 176.380606 },
  { name: "Waiouru", description: "A central North Island town known as the military training area and Army Museum.", lat: -39.471402, lng: 175.679154 },
  { name: "Tangiwai Rail Disaster", description: "Site of New Zealand’s worst rail disaster in 1953.", lat: -39.465403, lng: 175.576115 },
  { name: "Stephen's Island", description: "An island in Cook Strait known for its lighthouse and wildlife history.", lat: -40.670304, lng: 173.997431 },
  { name: "Te Puke Kiwifruit", description: "A region renowned for commercial kiwifruit orchards.", lat: -37.782569, lng: 176.320481 },
  { name: "Christchurch Cathedral", description: "The historic Anglican cathedral in central Christchurch.", lat: -43.530644, lng: 172.636929 },
  { name: "Whangamomona", description: "A small town famous for declaring itself a republic as a tourist stunt.", lat: -39.144324, lng: 174.737549 },
  { name: "Palliser Lighthouse", description: "A lighthouse marking the entrance to Wellington Harbour from the south.", lat: -41.611417, lng: 175.289483 },
  { name: "Pike River Mine", description: "Site of a coal mine and the tragic 2010 mining disaster.", lat: -42.20638, lng: 171.483793 },
  { name: "Cheese Capital of New Zealand", description: "Nickname for Eltham known historically for dairy and cheese production.", lat: -39.42789, lng: 174.297452 },
  { name: "New Zealand's French Town", description: "Nickname for Akaroa, a town with strong French colonial history.", lat: -43.805466, lng: 172.971411 },
  { name: "New Zealand's Norwegian Town", description: "Nickname for Norsewood, a town with historical Norwegian settler links.", lat: -40.069156, lng: 176.216455 },
  { name: "New Zealand's Viking Town", description: "A nickname for Dannevirke, a town strongly linked to Scandinavian settlers.", lat: -40.209705, lng: 176.096764 },
  { name: "Lake Rotopounamu", description: "A small southern lake popular with local anglers and walkers formed by a landslide 10,000 years ago.", lat: -39.025933, lng: 175.737863 },
  { name: "Hauraki Marsh", description: "A wetland area of ecological importance in the Hauraki region.", lat: -37.410441, lng: 175.548306 },
  { name: "New Zealand's Original Capital", description: "This was New Zealand’s original capital before Auckland and later Wellington.", lat: -35.304322, lng: 174.120855 },
  { name: "Kokota Sand Spit", description: "A 10-kilometre-long barrier spit of pure, high-quality silica sand", lat: -34.547127, lng: 172.976818 },
  { name: "Rere Rocks", description: "Natural stepped rock formations and waterfall, popular for scenic walks and swimming.", lat: -38.539757, lng: 177.590475 },
  { name: "Franz Josef Glacier", description: "A fast-flowing, 12km long glacier accessible via guided walks.", lat: -43.46991, lng: 170.193028 },
  { name: "Wellington Cable Car", description: "A historic funicular linking central Wellington with Kelburn and the botanic garden.", lat: -41.284986, lng: 174.770594 },
  { name: "Solomon Statue", description: "Tommy Soloman was one of the most successful farmers in the Chatham Islands.", lat: -44.033199, lng: -176.337776 },
  { name: "Split Apple Rock", description: "A granite rock somehow split into two.", lat: -41.01917, lng: 173.023767 },
  { name: "Pancake Rocks", description: "Limestone formations at Punakaiki with distinctive layered shapes and blowholes.", lat: -42.11384, lng: 171.326594 },
  { name: "Coal River", description: "The most isolated point in all of New Zealand", lat: -45.498871, lng: 166.728387 },
  { name: "Manapiri Power Station", description: "At 854 MW installed capacity, it is New Zealand’s largest hydroelectric power station.", lat: -45.521849, lng: 167.277145 },
  { name: "Table Mountain", description: "A flat-topped hill providing panoramic views in the skyline", lat: -37.044987, lng: 175.659113 },
  { name: "Treaty of Waitangi Signage Location", description: "A site marked to commemorate the signing of the Treaty of Waitangi.", lat: -35.266419, lng: 174.082961 },
  { name: "Ohakune Carrot", description: "A large roadside carrot monument celebrating Ohakune’s carrot-growing history.", lat: -39.419768, lng: 175.402179 },
  { name: "Zealandia", description: "A large urban ecosanctuary in Wellington protecting native species.", lat: -41.303713, lng: 174.742827 },
  { name: "Auckland Zoo", description: "New Zealand’s largest zoo which used to have the nation’s elephants until November 2024. (They went to Australia)", lat: -36.864018, lng: 174.723601 },
  { name: "Te Mata Peak", description: "A scenic hill overlooking Havelock North and Hawke’s Bay.", lat: -39.701614, lng: 176.908207 },
  { name: "Wanaka Tree", description: "A lone willow tree in Lake Wanaka; a widely photographed landmark.", lat: -44.696557, lng: 169.117699 },
  { name: "The Longest Place Name in the World", description: "Location marked by the famously long Māori place name, the longest place name in the world'.", lat: -40.346495, lng: 176.544199 },
  { name: "Cathedral Cove", description: "A coastal cove with a natural rock arch; a popular tourist attraction.", lat: -36.828301, lng: 175.790262 },
  { name: "Hot Water Beach", description: "A beach where visitors can dig their own hot pools in the sand at low tide.", lat: -36.879057, lng: 175.81953 },
  { name: "One Tree Hill", description: "A volcanic cone and historic site in Auckland. Although the tree is now gone.", lat: -36.900813, lng: 174.781966 },
  { name: "Hanmer Springs", description: "Natural hot pools and alpine scenery. Although it is in the middle of nowhere", lat: -42.523783, lng: 172.825584 },
  { name: "Kaikoura", description: "Renowned for whale watching and fresh crayfish, where the mountains meet the Pacific Ocean.", lat: -42.416281, lng: 173.704233 },
  { name: "Pukeamoamo", description: "The tallest peak in the Tararua Ranges at 1,571m.", lat: -40.798459, lng: 175.457325 },
  { name: "Mitre Peak", description: "New Zealand’s most photographed mountain due to its distinct shape.", lat: -44.632796, lng: 167.857575 },
  { name: "Cape Farewell", description: "The northernmost point of the South Island, known for dramatic cliffs and coastal hikes. Named as ‘farewell’ due to being Cook’s first departing place from New Zealand.", lat: -40.498194, lng: 172.690487 },
  { name: "Tama Lakes", description: "Two crater lakes on the Tongariro Alpine Crossing, offering stunning volcanic scenery.", lat: -39.201282, lng: 175.607615 },
  { name: "Lake Grassmere", description: "A coastal lake used for large-scale salt production, creating striking pink water in the summer.", lat: -41.722948, lng: 174.163857 },
  { name: "Huka Falls", description: "A powerful set of waterfalls on the Waikato River, drawing thousands of visitors each year.", lat: -38.649372, lng: 176.089039 },
  { name: "Homer Tunnel", description: "A famous one-kilometre tunnel leading to Milford Sound, surrounded by dramatic alpine scenery.", lat: -44.764242, lng: 167.980742 },
  { name: "Parihaka", description: "A historic Pā, remembered for its 19th-century nonviolent resistance against land confiscations.", lat: -39.289088, lng: 173.840017 },
  { name: "Auckland Harbour Bridge", description: "A landmark bridge connecting central Auckland with the North Shore.", lat: -36.832627, lng: 174.744329 },
  { name: "Art Deco Napier", description: "Known worldwide for its Art Deco architecture, rebuilt after the 1931 Hawke’s Bay earthquake.", lat: -39.491208, lng: 176.912155 },
  { name: "Lake Te Anau", description: "The largest lake in the South Island, gateway to Fiordland National Park and the Milford Track.", lat: -44.941216, lng: 167.906799 },
  { name: "Rotorua Redwoods", description: "A towering Californian redwood forest with popular walking and mountain biking trails.", lat: -38.155735, lng: 176.27718 },
  { name: "Hauraki Rail Trail", description: "A scenic cycle trail through historic gold mining towns, farmland, and river gorges.", lat: -37.4148, lng: 175.783482 },
  { name: "Blue Pools", description: "Where glacial waters form brilliantly clear blue pools.", lat: -44.160792, lng: 169.267688 },
  { name: "Kerosene Creek", description: "A natural hot stream near Rotorua where visitors can soak in geothermal-heated waters that reach up to 38 degrees celsius.", lat: -38.328511, lng: 176.377172 },
  { name: "Castle Point", description: "A rugged Wairarapa coastline with a striking lighthouse and fossil-rich limestone reef.", lat: -40.899258, lng: 176.223578 },
  { name: "Steampunk HQ", description: "A famous, quirky art gallery in Oamaru celebrating steampunk culture with interactive exhibits.", lat: -45.101149, lng: 170.969977 }
];
let curGameFamousLocations = [];
let famousLocation;



//Game values that are constant per game.
let _game;

let selectedPanelItem;
let _selectedGamesTab;

const goodSounds = ['good1', 'good2', 'good3', 'good4', 'good5', 'good6', 'good7', 'good8', 'good9', 'good10', 'good11', 'good12', 'good13'];
const badSounds = ['bad1', 'bad2', 'bad3', 'bad4', 'bad5', 'bad6', 'bad7', 'bad8', 'bad9', 'bad10', 'bad11', 'bad12', 'bad13'];

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

// On game open
window.onload = async () => {
  initMap();

  // Get the player data from storage
  const savedPlayer = localStorage.getItem("topoguesser_player");
  if (savedPlayer) {
    _currentUser = savedPlayer;
    document.getElementById('userInfo').textContent = `🎮 Player: ${savedPlayer}`;
  } else {
    enterNewUsername();
  }

  // Show changes logs if a new version
  showChangelogs();
  
  document.getElementById("gameTitle").textContent = "NZ Topo Guesser V" + currentVersion + " - Sponsored by Water";

  // Setup a bunch of buttons
  document.getElementById("changePlayerBtn").onclick = () => {
    enterNewUsername();
  };

  document.getElementById("closeAnalysisBtn").onclick = () => {
    document.getElementById("analysisPanel").style.display = 'none';
  };

  document.getElementById("recommendedGamesTabBtn").onclick = () => gameTabUpdate("Recommended");
  document.getElementById("recentGamesTabBtn").onclick = () => gameTabUpdate("Recent");
  document.getElementById("playedGamesTabBtn").onclick = () => gameTabUpdate("Played");
  
  document.getElementById("createNewGameBtn").onclick = showNewGamePanel;

  // Setup the overall leaderboard panel
  updateOverallLeaderboard();
  document.getElementById("overallLeaderboardGameType").onchange = updateOverallLeaderboard;
  document.getElementById("overallLeaderboardSortBy").onchange = updateOverallLeaderboard;

  // Do not allow guesses to be submit when there is no game loaded
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('leafletMap').style.pointerEvents = 'none';

  gameTabUpdate("Recent")

  // Setup Modal buttons
  document.getElementById("recommendModalCloseBtn").onclick = () => {
    closeRecommendedModal();
  }

  document.getElementById("recommendModalRecommendBtn").onclick = () => {
    recommendModalOnRecommend();
  };
}

function startNewGame(game) {
  _game = game;

  _totalScore = 0;
  roundsPlayed = 0;
  totalRounds = _game.totalRounds;

  if (isNaN(_game.seed)) {
    // Generate a random seed if no valid seed was entered
    const randomSeed = Math.floor(Math.random() * 1000000000);
    document.getElementById('seed').value = randomSeed;  // update the input field
    seedObj.value = randomSeed;
  } else {
    seedObj.value = _game.seed;
  }

  // Remove previous answers
  guessMap.eachLayer(layer => {
    if (layer !== guessMapBasemapLayer) {
      guessMap.removeLayer(layer);
    }
  });

  document.getElementById('nextRoundBtn').onclick = () => {
    document.getElementById('nextRoundBtn').disabled = true;
    nextRound();
  };

  document.getElementById('submitBtn').onclick = submitGuess;

  // Clear famous locations data to not get repeats
  if (game.gameType === "Famous Locations"){
    curGameFamousLocations = [];
  }

  nextRound();

  if (_game.playedBy[0] !== _currentUser){
    addNewPlayer(game.gameID, _currentUser);
  }
}

async function nextRound(){
  clearInterval(timerInt);
  hasGuessed = false;
  guessLat = guessLng = null;
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('result').textContent = '';

  document.getElementById('leafletMap').style.pointerEvents = 'none';
  document.getElementById('mapFrame').style.pointerEvents = 'none';
  
  roundsPlayed++;
  updateGameFeedbackUI();

  // Remove the famous locations if it was present
  const el = document.getElementById("famousLocationText");
  if (el) {
    el.remove();
  }
  
  
  document.getElementById("mapFrame").scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "start"
  });

  const timerLen = _game.timerDuration === 0 ? null : parseInt(_game.timerDuration);
  // Wait until we get a valid location
  const loc = await getValidLocation();
  answerLat = loc.lat;
  answerLng = loc.lng;
  document.getElementById('mapFrame').src = `https://www.topomap.co.nz/NZTopoMap?v=2&ll=${answerLat},${answerLng}&z=${_game.zoom}`;

  if (guessMarker) guessMap.removeLayer(guessMarker);
  
  guessMap.setView([-41.3, 174.8], 5);
  document.getElementById('leafletMap').style.pointerEvents = 'auto';

  if (timerLen !== null) {
    let t = timerLen;
    document.getElementById('result').textContent = `Timer: ${t}s remaining…`;
    timerInt = setInterval(() => {
      t--;
      if (t > 0) {
        document.getElementById('result').textContent = `Timer: ${t}s remaining…`;
      } else {
        submitGuess();
      }
    }, 1000);
  }
}

function submitGuess() {
  hasGuessed = true;
  document.getElementById('submitBtn').disabled = true;

  clearInterval(timerInt);
  document.getElementById('mapFrame').style.pointerEvents = 'auto';

  // If the user has actually guessed
  if (guessLat !== null){
    const dist = haversine(answerLat, answerLng, guessLat, guessLng);
    const score = calculateScore(dist);
    _totalScore += score;

    sendGuessToServer(guessLat, guessLng, dist);
      
    document.getElementById('result').textContent = `You were ${dist.toFixed(2)} km away → Score: ${score}/300`;
    
    if (dist < 100) playRandomSound(goodSounds);
    else if (dist > 700) playRandomSound(badSounds);
  }
  else { // The user did not guess at all.
    document.getElementById('result').textContent = `You forgot to submit a guess in the time limit! Score: 0`;

    document.getElementById('ranOutOfTime').play();
  }


  L.circleMarker([answerLat, answerLng], {
    radius: 10,
    fillColor: 'green',
    color: 'black',
    weight: 2,
    fillOpacity: 0.8
  }).addTo(guessMap).bindPopup('📍 Actual Location').openPopup();

  document.getElementById('nextRoundBtn').disabled = (roundsPlayed >= _game.totalRounds);

  // If this is the final round
  if (roundsPlayed >= _game.totalRounds) {

    // Are we in 'normal' mode?
    if (Number(_game.timerDuration) === 30 && Number(_game.zoom) === 14 && Number(_game.totalRounds) === 5) {
      sendScoreForOverallLeaderboardToServer(_totalScore, _game.gameType);
    }
  }
  
  updateGameFeedbackUI(); 

  if (_game.gameType === "Famous Locations"){
    const newEl = document.createElement("div");  
    newEl.id = "famousLocationText";
    newEl.innerHTML = `<p><strong>Famous Location:</strong> <u>${famousLocation.name}</u> - "${famousLocation.description}"</p>`;
    
    const controls = document.getElementById("controls");
    const nextRoundBtn = document.getElementById("nextRoundBtn");

    // Insert before nextRoundBtn (so it comes after #resultBtn)
    controls.insertBefore(newEl, nextRoundBtn);
  }
}

/// === GAME CREATION FUNCTIONS ===

function getRandomNZRegion() {
  const region = NZ_REGIONS[Math.floor(seededRandom() * NZ_REGIONS.length)];
  return {
    lat: seededRandomInRange(region.latMin, region.latMax),
    lng: seededRandomInRange(region.lngMin, region.lngMax)
  };
}

async function getValidLocation() {

  if (_game.gameType === "Urban"){
    return await getValidUrbanLocation();
  } else if (_game.gameType === "Famous Locations"){
    return getValidFamousLocation();
  }

  for (let i = 0; i < 500; i++) {
    const loc = getRandomNZRegion();
    console.log("Checking location " + loc);

    if (_game.gameType === "Beach") {
      if (await tileHasLand(loc.lat, loc.lng) && await tileHasEnoughWater(loc.lat, loc.lng)) return loc;

    } else if (_game.gameType === "State Highway") {
      if (await tileHasEnoughHighway(loc.lat, loc.lng)) return loc;
      
    } else if (_game.gameType === "Bush") {
      if (await tileHasEnoughBush(loc.lat, loc.lng)) return loc;

    } else { //Gametype is }Everywhere"
      if (await tileHasLand(loc.lat, loc.lng)) return loc;
    }
  }
  return { lat: -41.3, lng: 174.8 };
}

async function tileHasLand(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${_game.zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
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
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${_game.zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
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
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${_game.zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
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

function getValidFamousLocation(){

  let location;
  if (totalRounds <= 100){
    let i = Math.floor(seededRandom() * FAMOUS_LOCATIONS.length)
    // Check to make sure this locations has not been done this game
    while (curGameFamousLocations.includes(i)){
      i = Math.floor(seededRandom() * FAMOUS_LOCATIONS.length)
    }

    curGameFamousLocations.push(i);
    location = { ...FAMOUS_LOCATIONS[i] };
  } else {
    location = { ...FAMOUS_LOCATIONS[Math.floor(seededRandom() * FAMOUS_LOCATIONS.length)]};
  }

  if (0.5 <= seededRandom()){
    location.lat += 0.01 * seededRandom();
  }
  else {
    location.lat += -0.01 * seededRandom();
  }
  if (0.5 <= seededRandom()){
    location.lng += 0.01 * seededRandom();
  }
  else {
    location.lng += -0.01 * seededRandom();
  }
  console.log(location);
  famousLocation = location;
  return (location);
}

async function tileHasEnoughUrban(lat, lng) {
  const x = longitudeToTileX(lng), y = latitudeToTileY(lat);
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${_game.zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
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
  const url = `https://basemaps.linz.govt.nz/v1/tiles/topo-raster/WebMercatorQuad/${_game.zoom}/${x}/${y}.webp?api=c01k1w81j8nbj00y7gy7x4b17j6`;
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

function initMap() {
  guessMap = L.map('leafletMap', { center: [-41.3, 174.8], zoom: 5 });

  guessMapBasemapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
  }).addTo(guessMap);

  // On offering a guess on the map
  guessMap.on('click', e => {
    if (hasGuessed) return;
    guessLat = e.latlng.lat;
    guessLng = e.latlng.lng;
    if (guessMarker) guessMap.removeLayer(guessMarker);
    guessMarker = L.marker([guessLat, guessLng]).addTo(guessMap);
    document.getElementById('submitBtn').disabled = false;
  });
}

function updateGameFeedbackUI() {
  document.getElementById('roundInfo').textContent = `Round ${roundsPlayed} of ${totalRounds}`;
  document.getElementById('totalScore').textContent = `Total Score: ${_totalScore}`;

}

/// === SERVER DATA SENDERS AND RECEIVERS ===

function addNewPlayer(gameID, player){
  fetch(`/games/${gameID}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPlayer: player }),
  });
}

async function sendScoreForOverallLeaderboardToServer(scoreValue, gameType) {
  const res = await fetch('/overallLeaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: _currentUser, scoreToAdd: scoreValue, gameType: gameType }),
  });
  const result = await res.json();
  if (!result.success) console.error("An error occured when fetching overall leaderboard: \n" + result.message);
}

async function sendGuessToServer(lat, lng, distance) {
  if (!_currentUser) return;
  const payload = { gameID: _game.gameID, round: roundsPlayed, user: _currentUser, lat, lng, distance };
  
  await fetch("/guesses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  // Update the leaderboard
  showGameInfoPanel(_game);
}

async function recommendGame( gameID, name ) {

  try {
    await fetch("/recommendGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameID, recommendedBy: _currentUser, name }),
    });

    document.getElementById("recommendedModal").innerHTML = `
    <div style="background: white; width: 90%; max-width: 600px; border-radius: 12px; padding: 20px; max-height: 400px;">
      <h3>Recommend Game</h3>
      <p>Game successfully recommended.</p></br>
      <button id="recommendModalCloseBtn" class="redButton">Close</button>
    </div>`;
    document.getElementById("recommendedModal").onclick = () => closeRecommendedModal(); 

    gameTabUpdate("Played");

  } catch (err) {
    console.error("Network error occured whilst recommending a game:", err.message);
    throw err;
  }
}

function loadOtherGuesses() {
  const seed = parseInt(document.getElementById("seed").value);
  const round = roundsPlayed;
  fetch(`/guesses/${seed}/${round}`).then(r => r.json()).then(data => {
    data.forEach(g => {
      if (g.user !== _currentUser) {
        const score = calculateScore(g.distance);
        const color = getUserColor(g.user);
        L.circleMarker([g.lat, g.lng], {
          radius: 6,
          fillColor: color,
          color: "white",
          weight: 1,
          fillOpacity: 0.7
        }).addTo(guessMap).bindPopup(`
          <b style="color:${color}">${g.user}</b><br/>
          ${g.distance.toFixed(2)} km away<br/>
        `);
      }
    });
  });
}

async function fetchGames({ gameCategories, includePlayer, excludePlayer } = {}) {
  const params = new URLSearchParams();

  if (gameCategories && gameCategories.length > 0) {
    params.append("gameCategory", gameCategories.join(","));
  }
  if (includePlayer) params.append("includePlayer", includePlayer);
  if (excludePlayer) params.append("excludePlayer", excludePlayer);

  let games = [];
  try {
    const res = await fetch(`/games?${params.toString()}`);
    const data = await res.json();

    if (!data.success) {
      console.error("Error fetching games:", data.error || "Unknown error");
      return [];
    }

    games = data.games;

  } catch (err) {
    console.error("Network error:", err);
    return [];
  }

  // Get the recommended games data
  if (gameCategories?.includes("Recommended")) {
    const recommendedGameIDs = games
      .filter(g => g.gameCategory === "Recommended")
      .map(g => g.gameID);

    if (recommendedGameIDs.length > 0) {
      const query = new URLSearchParams({ gameIDs: recommendedGameIDs.join(",") });

      try {
        const res = await fetch(`/recommendedGames?${query.toString()}`);
        const recommendedData = await res.json();

        if (!recommendedData.success) {
          console.error("Error fetching recommended games:", recommendedData.error || "Unknown error");
        } else {
          //Thus, send update games data with recommended data
          const recommendedGames = recommendedData.recommended;

          const recommendedMap = new Map(
            recommendedGames.map(r => [r.gameID, r])
          );

          for (let game of games) {
            if (recommendedMap.has(game.gameID)) {
              const rec = recommendedMap.get(game.gameID);
              game.name = rec.name;
              game.recommendedBy = rec.recommendedBy;
            }
          }
        }

      } catch (err) {
        console.error("Network error when fetching recommended games:", err);
      }
    }
  }

  return games;
}

/// === OTHER UI FUNCTIONS ===

async function updateOverallLeaderboard() {
  // Get the container
  const container = document.getElementById('overallLeaderboardData');
  container.innerHTML = '<p>Loading...</p>'

  // Get the chosen leaderboard type
  leaderboardGameType = document.getElementById("overallLeaderboardGameType").value;
  sortBy = document.getElementById("overallLeaderboardSortBy").value;

  try {
    // Fetch leaderboard data filtered by gameType
    const res = await fetch(`/overallLeaderboard?gameType=${encodeURIComponent(leaderboardGameType)}`);
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = "<p>Failed to load leaderboard</p>";
      return;
    }

    // Prepare entries
    let entries = result.entries.map(e => ({
      player: e.user,
      totalScore: e.totalScore,
      gamesPlayed: e.gamesPlayed,
      averageScore: e.gamesPlayed > 0 ? e.totalScore / e.gamesPlayed : 0
    }));

    // Sort the leaderboard
    entries.sort((a, b) => {
      let valA, valB;

      if (sortBy === "totalScore") {
        valA = a.totalScore; valB = b.totalScore;
      } else if (sortBy === "gamesPlayed") {
        valA = a.gamesPlayed; valB = b.gamesPlayed;
      } else if (sortBy === "averageScore") {
        valA = a.averageScore; valB = b.averageScore;
      }

      return valB - valA;
    });

    // If there is no data tell the user
    if (entries.length === 0){
      container.innerHTML = "<p>Nobody has played yet, so there is no leader to display</p>";
      return;
    }

    // Emojis for the top 3
    const emojis = ['🏆', '🥈', '🥉'];

    // Build table header
    let html = `
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

    // Build table rows depending on data
    entries.forEach((entry, index) => {
      const placing = emojis[index] ? `${emojis[index]}` : `${index + 1}`;
      html += `
        <tr>
          <td>${placing}</td>
          <td>${entry.player}</td>
          <td>${entry.totalScore}</td>
          <td>${entry.gamesPlayed}</td>
          <td>${Math.round(entry.averageScore)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';

    // Update container content
    container.innerHTML = html;
  } catch (err) {
    console.error("Error occured whilst fetching an overall leaderboard: ", err);
    container.innerHTML = "<p>Error loading leaderboard</p>";
  }
}

async function showGameAnalysis(game) {
  const res = await fetch(`/guesses/all/${game.gameID}`);
  const data = await res.json();

  const content = document.getElementById('analysisContent');
  let html = `<strong>${game.gameType}</strong><hr>`;

  const rounds = Object.keys(data.roundData || {}).sort();

  rounds.forEach(round => {
    const guesses = data.roundData[round];
    const answer = data.answers?.[round];

    // Round panel clickable
    html += `
      <div class="round-panel" onclick='showRoundAnalysis(${JSON.stringify(guesses)}, ${JSON.stringify(answer)})'>
        <strong>Round ${round}</strong>
        <table class="round-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Placement</th>
              <th>Score</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            ${guesses
              .map((g, i) => {
                const score = caluclateScore(g.distance);
                return `
                  <tr>
                    <td>${g.user}</td>
                    <td>${i + 1}</td>
                    <td>${score}</td>
                    <td>${g.distance.toFixed(2)} km</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <hr>
    `;
  });

  content.innerHTML = html;
  document.getElementById('analysisPanel').style.display = 'block';
}

// Game Tab can be "Played", "Recommended" or "Recent"
async function gameTabUpdate(gameTab){
  // Update the game tab UI
  if (_selectedGamesTab){
    _selectedGamesTab.classList.remove('selected');
  } 
  switch (gameTab){
    case "Recent":
      _selectedGamesTab = document.getElementById('recentGamesTabBtn');
    break;
    case "Recommended":
      _selectedGamesTab = document.getElementById('recommendedGamesTabBtn');
    break;
    case "Played":
      _selectedGamesTab = document.getElementById('playedGamesTabBtn');
    break; 
  }
  _selectedGamesTab.classList.add('selected');

  const container = document.getElementById('gamesPanelList');
  container.innerHTML = `<p>Loading...</p>`

  // Get the relevant games from the database
  let games;
  switch (gameTab){
    case "Recent":
      games = await fetchGames({gameCategories: [gameTab], excludePlayer: _currentUser});
    break;
    case "Recommended":
      games = await fetchGames({gameCategories: [gameTab], excludePlayer: _currentUser});
    break;
    case "Played":
      games = await fetchGames({gameCategories: ["Recent", "Recommended"], includePlayer: _currentUser});
    break;
  }

  if (games.length !== 0){

    createGameList(games);

  } else{ // There are no games in this tab, so tell the user
    switch (gameTab){
      case "Recent":
        container.innerHTML = `<p>There are no recent games you have not already played.`
      break;
      case "Recommended":
        container.innerHTML = `<p>There are no recommended games you have not already played.`
      break;
      case "Played":
        container.innerHTML = `<p>You have not played any games yet. Go play some!`
      break;
    }
  }
}

function createGameList(games) {
  const container = document.getElementById('gamesPanelList');

  // Sort by time first played
  games.sort((a, b) => {
    return new Date(b.timeCreated) - new Date(a.timeCreated);
  });
  
  container.innerHTML = '';
  games.forEach(game => {
    const div = document.createElement('div');
    div.classList.add('gamesPanelItem');

    // Set the corresponding game type colour for neat aeshetics
    switch (game.gameType){
      case "Bush":
        div.style.backgroundColor = "#a2df8cff";
        break;
      case "Beach":
        div.style.backgroundColor = "#a3dbe7ff";
        break;
      case "State Highway":
        div.style.backgroundColor = "#f39595ff";
        break;
      case "Everywhere":
        div.style.backgroundColor = "#f5f5f5";
        break;
      case "Urban":
        div.style.backgroundColor = "#f1b78aff";
        break;
      case "Famous Locations":
        div.style.backgroundColor = "#e794edff";
        break;
    }

    let html = ``;
    // Recommended
    if (game.gameCategory === "Recommended"){
      html = `<strong>"${game.name}"</strong> - ${game.recommendedBy}</br>`;
    }
    html += `<strong>${game.gameType}</strong>`;

    // If Custom Settings
    if (game.zoom !== 14 || game.timerDuration !== 30 || game.totalRounds !== 5){
      html += `- Custom Settings`;
    }
    
    html += `<br/><small>${game.playedBy.length} player(s) • ${game.totalRounds} rounds • seed ${game.seed} </small></small>`;
    div.innerHTML = html;

    div.onclick = () => { 
      if (div === selectedPanelItem) return;
      
      div.classList.add('selected');

      // Set the previousilly selected item back to default
      if (selectedPanelItem){
        selectedPanelItem.classList.remove('selected');
      }

      selectedPanelItem = div;

      infoPanel = document.getElementById("gameInfoPanel");

      if (!isFullyVisible(infoPanel) || !infoPanel.classList.contains("open")){
        infoPanel.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
        });
      }

      showGameInfoPanel(game);
    };
  container.appendChild(div);
  });
}

//When a game is selected from the games panel
function showGameInfoPanel(game){

  const infoPanel = document.getElementById("gameInfoPanel");

  if (!infoPanel.classList.contains("open")){
    infoPanel.classList.add("open");
  }

  switch (game.gameType){
    case "Bush":
      infoPanel.style.backgroundColor = "#dff5d4ff";
      break;
    case "Beach":
      infoPanel.style.backgroundColor = "#daeef3ff";
      break;
    case "State Highway":
      infoPanel.style.backgroundColor = "#ffdedeff";
      break;
    case "Everywhere":
      infoPanel.style.backgroundColor = "#ffffffff";
      break;
    case "Urban":
      infoPanel.style.backgroundColor = "#ffeddfff";
      break;
    case "Famous Locations":
      infoPanel.style.backgroundColor = "#ffdfdfff";
      break;
  }
  
  // Setup the left 'settings' panel
  let html = '<div id="gameInfoTopPanels"><div id="gameInfoPanelLeft">';

  // Setup the header 
  if (game.gameCategory === "Recommended"){
    html += `<h3>${game.gameType} - ${game.name}</h3>`;
  }
  else { // i.e. Recent
    html += `<h3>${game.gameType}</h3>`;
  }

  // Setup the settings
  html += `<p> Seed: ${game.seed}</p>`;
  html += (game.totalRounds === 5)? `<p> Rounds: ${game.totalRounds}</p>` : `<p class="customSetting"> Rounds: ${game.totalRounds}</p>`;
  html += (game.zoom === 14)? `<p> Difficulty (zoom): ${game.zoom}</p>` : `<p class="customSetting"> Difficulty (zoom): ${game.zoom}</p>`;
  html += (game.timerDuration === 30)? `<p> Timer Duration: ${game.timerDuration}</p>` : `<p class="customSetting"> Timer Duration: ${game.timerDuration}</p>`;
  html += `<p> Created by: ${game.playedBy[0]}</p>`;
  if (game.gameCategory === "Recommended"){
    html += `<p> Recommended by: ${game.recommendedBy}</p>`
  }
  html += `</div>`;

  // Setup the game leaderboard panel
  html += `<div><h3>Game Leaderboard</h3><div id="gameLeaderboardPanel">Loading...</div></div></div>`;

  // Show the buttons
  html += `<div id="gameInfoButtons">`;
  if (game.playedBy.includes(_currentUser) && game.gameCategory !== "Recommended"){
    html += `<p>Select another game,</p><button class="greenButton" id="recommendButton">Recommend Game</button><p>or</p>`
  } else if (game !== _game && game.playedBy.includes(_currentUser)) {
    html += `<p>Select another game or</p>`;

  } else if (game !== _game){
    html += `<button class="blueButton" id="playGameBtn">Play this Game</button>
    <p> or </p>`

  } else{
    html += `<p>Select a Game or </p>`;
  }
  html += `<button class="blueButton" id="createNewGameBtn">Create a New Game</button>
  </div>`;

  infoPanel.innerHTML = html;

  // Give the buttons functionality
  if (game !== _game && !game.playedBy.includes(_currentUser)){
    document.getElementById("playGameBtn").onclick = () => startNewGame(game);
  }
  document.getElementById("createNewGameBtn").onclick = showNewGamePanel;

  if (game.playedBy.includes(_currentUser) && game.gameCategory !== "Recommended") document.getElementById("recommendButton").onclick = () =>{
    document.getElementById("recommendedModal").style.display = 'flex';
    _game = game;
  }

  createGameLeaderboardHTML(game.gameID).then(html => {
    document.getElementById("gameLeaderboardPanel").innerHTML = html;
  });
}

async function createGameLeaderboardHTML(gameID) {
  const res = await fetch(`/guesses/${gameID}/userDistances`);
  const result = await res.json(); // call the function

  if (!result.success) {
    console.error(
      `An error occurred when trying to get leaderboard data for gameID: ${gameID}\n` +
      'Error: ' + JSON.stringify(result.error, null, 2)
    );
  }

  const guessData = result.data;

  if (guessData.length === 0){
    return `<p>Nobody has played this game yet.</p>`;
  }

  // Find out how many rounds exist
  const totalRounds = Math.max(...guessData.map(g => g.round));

  // Group results by user and compute scores
  const users = {};
  guessData.forEach(g => {
    if (!users[g.user]) {
      users[g.user] = { scores: Array(totalRounds).fill(null), total: 0 };
    }
    const score = calculateScore(g.distance);
    users[g.user].scores[g.round - 1] = score;
    users[g.user].total += score;
  });

  // Sort users by total score
  const sortedUsers = Object.entries(users).sort(
    (a, b) => b[1].total - a[1].total
  );

  // Build HTML
  let html = `<table>`;
  html += `<thead><tr style="border-bottom: 1px solid black;"><th>Placing</th>`;
  html += `<th>Player</th>`;
  html += `<th>Total</th>`;
  for (let i = 1; i <= totalRounds; i++) {
    html += `<th>Round ${i}</th>`;
  }
  html += `</tr></thead><tbody>`;

  let placing = 1;
  sortedUsers.forEach(([user, { scores, total }]) => {
    if (placing === 1) html += `<tr style="background-color: rgba(255, 223, 148, 1);">`;
    else if (placing === 2) html += `<tr style="background-color: rgba(220, 217, 217, 1);">`;
    else if (placing === 3) html += `<tr style="background-color: rgba(252, 191, 126, 1);">`;
    else html += `<tr>`;

    html += `<td>${placing}</td>`;
    html += `<td>${user}</td>`;
    html += `<td><b>${total}</b></td>`;
    scores.forEach(score => {
      // Assign colours to the score depending on how well they did
      if (score > 250) html += `<td style="color:rgb(69, 152, 69); font-weight: bold;">`;
      else if (score < 50 && score !== null) html += `<td style="color: rgb(216, 0, 0); font-weight: bold;">`;
      else html += `<td>`;

      html += `${score !== null ? score : "-"}</td>`;
    });
    html += `</tr>`;
    placing++;
  });

  html += `</tbody></table>`;

  return html;
}

function showNewGamePanel(){
  panel = document.getElementById("gameInfoPanel");
  panel.style.backgroundColor = "#fff";

  let html = `
    <h3>Create your New Game</h3></br>
    <div class="newGameSetting">
      <label>Game Type:</label>
        <select id="newGameType">
          <option value="Everywhere">Everywhere</option>
          <option value="Beach">Beach</option>
          <option value="Urban">Urban</option>
          <option value="State Highway">State Highway</option>
          <option value="Bush">Bush</option>
          <option value="Famous Locations">Famous Locations</option>
        </select></br>
    </div>
    <div class="newGameSetting">
      <label>Difficulty (zoom):</label> 
      <select id="newZoom">
        <option value="12">Easy</option>
        <option value="13">Medium</option>
        <option value="14">Moderate</option>
        <option value="15">Hard</option>
      </select></br>
    </div>
    <div class="newGameSetting">
      <label>Timer Duration:</label>
      <select id="newTimerDuration">
        <option value="5">Speedy (5 sec)</option>
        <option value="30">Normal (30 sec)</option>
        <option value="60">Let Him Cook (60 sec)</option>
        <option value="0">No Timer</option>
      </select></br>
    </div>
    <div class="newGameSetting">
      <label>Number of Rounds:</label>
      <input id="newTotalRounds" type="number"></input>
    </div>
    <div class="newGameSetting">
      <label>Seed:</label> 
      <input id="newSeed" type="number"></input></br>
    </div>
    <button id="newGameBtn" class="blueButton">Play</button>
  `;

  panel.innerHTML = html;

  document.getElementById("newZoom").value = "14";
  document.getElementById("newTimerDuration").value = "30";
  document.getElementById("newTotalRounds").value = 5;    
  document.getElementById("newSeed").value = Math.floor(Math.random() * 1000000000); 
  
  document.getElementById('newGameBtn').onclick = OnNewGame;
}

async function OnNewGame(){
  document.getElementById('newGameBtn').disabled = true;

  let game = {
    gameCategory: "Recent",
    seed: document.getElementById("newSeed").value,
    gameType: document.getElementById("newGameType").value,
    totalRounds: document.getElementById("newTotalRounds").value,
    playedBy: [_currentUser],
    totalRounds: document.getElementById("newTotalRounds").value,
    zoom: document.getElementById("newZoom").value,
    timerDuration: document.getElementById("newTimerDuration").value
  };

  /* TEMP
  const res = await fetch(`/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });

  result = await res.json();
  if (!result.success){
    console.error("An error occured on new game creation");
    return;
  }

  game.gameID = result.gameID;
  */

  startNewGame(game);
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

async function enterNewUsername(){
    const name = prompt("Enter your username:", "e.g. James") || "Player";
    _currentUser = name;
    localStorage.setItem("topoguesser_player", name);
    document.getElementById('userInfo').innerHTML = `🎮 Player: <b>${name}</b>`;
}

function closeRecommendedModal(){
  let container = document.getElementById("recommendedModal");
  container.style.display = "none";
  container.innerHTML = `
  <div style="background: white; width: 90%; max-width: 600px; border-radius: 12px; padding: 20px; max-height: 400px;">
    <h3>Recommend Game</h3>
    <label>Name:
      <input type="text" id="recommendedName" placeholder="e.g. 'Lots of Chathams'"></input>
    </label></br>
    <button id="recommendModalCloseBtn" class="redButton">Close</button>
    <button id="recommendModalRecommendBtn" class="greenButton">Recommend</button>
  </div>`;

  document.getElementById("recommendModalRecommendBtn").onclick = () => recommendModalOnRecommend();
  document.getElementById('recommendModalCloseBtn').onclick = () => closeRecommendedModal();
}

function recommendModalOnRecommend(){

  const name = document.getElementById("recommendedName").value;
  if (name === ""){
    return;
  }

  
  document.getElementById("recommendedModal").innerHTML = `
  <div style="background: white; width: 90%; max-width: 600px; border-radius: 12px; padding: 20px; max-height: 400px;">
    <h3>Recommend Game</h3>
    <p>Recommending...</p></br>
    <button id="recommendModalCloseBtn" class="redButton">Close</button>
  </div>`;
  document.getElementById("recommendModalCloseBtn").onclick = () => closeRecommendedModal(); 

  recommendGame(_game.gameID, name);
  _game.recommendedBy = _currentUser;
  _game.name = name;
}

/// === HELPER FUNCTIONS ===

// Generate consistent color for a user
function getUserColor(user) {
  let hash = 0;
  for (let i = 0; i < user.length; i++) {
    hash = user.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

function isFullyVisible(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function calculateScore(distance){
  return Math.max(0, Math.round(distance < 2.5 ? 300 : 300 - Math.sqrt(180 * (distance - 2.5))));
}

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

// Calculates distance between two coordinates
function haversine(aLat, aLng, bLat, bLng) {
  const toRad = x => x * Math.PI / 180, R = 6371;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function longitudeToTileX(lon) {
  const wrapped = wrapLongitude(lon);
  return Math.floor((wrapped + 180) / 360 * Math.pow(2, _game.zoom));
}

function latitudeToTileY(lat) {
  const rad = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(rad) + 1/Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, _game.zoom));
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

function playRandomSound(soundList) {
  const id = soundList[Math.floor(Math.random() * soundList.length)];
  const audio = document.getElementById(id);
  if (audio) audio.play().catch(e => console.warn("Playback blocked:", e));
}

