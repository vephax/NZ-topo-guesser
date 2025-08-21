import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { supabase } from './supabaseClient.js';

const app = express();
app.use(express.json());

// POST a guess (insert)
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post('/guesses', async (req, res) => {
  console.error("Testing");
  const { user, seed, round, lat, lng, distance } = req.body;
  console.log("Received guess:", { user, seed, round, lat, lng, distance });

  const { data, error } = await supabase
    .from('guesses')
    .insert([{ user, seed, round, lat, lng, distance }]);

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

// POST an answer (insert)
app.post('/answers', async (req, res) => {
  const { seed, round, lat, lng } = req.body;
  const { data, error } = await supabase
    .from('answers')
    .insert([{ seed, round, lat, lng }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// GET guesses for a specific seed and round
app.get('/guesses/:seed/:round', async (req, res) => {
  const { seed, round } = req.params;
  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('seed', Number(seed))
    .eq('round', Number(round));
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all guesses for a specific seed (query param)
app.get('/guesses', async (req, res) => {
  const seed = Number(req.query.seed);
  if (!seed) return res.status(400).json({ error: 'Seed query param is required' });

  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('seed', seed);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET route for overall leaderboard
app.get('/gameTypeLeaderboard', async (req, res) => {
  const { gameType } = req.query;

  let query = supabase
    .from('gameTypeLeaderboard')
    .select('user, totalScore, gamesPlayed, gameType');

  // If gameType is provided, filter by it
  if (gameType) {
    query = query.eq('gameType', gameType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ success: false });
  }

  res.json({ success: true, entries: data });
});

// Update the overall leaderboard
app.post('/gameTypeLeaderboard', async (req, res) => {
  const { user, scoreToAdd, gameType } = req.body;

  if (!user || typeof scoreToAdd !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    // Fetch existing user data
    const { data: existing, error: fetchError } = await supabase
      .from('gameTypeLeaderboard')
      .select('totalScore, gamesPlayed')
      .eq('user', user)
      .eq('gameType', gameType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
    }

    // Default increments if player leaderboard does not yet exist
    let newTotalScore = scoreToAdd;
    let newGamesPlayed = 1;

    if (existing) {
      newTotalScore = existing.totalScore + scoreToAdd;
      newGamesPlayed = existing.gamesPlayed + 1;
    }

    // Upsert the new data
    const { error: upsertError } = await supabase
      .from('gameTypeLeaderboard')
      .upsert(
        [{ user, totalScore: newTotalScore, gamesPlayed: newGamesPlayed, gameType }],
        { onConflict: ['user', 'gameType'] }
      );

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      return res.status(500).json({ success: false, message: 'Error updating leaderboard' });
    }

    // Success response
    res.json({ success: true, totalScore: newTotalScore, gamesPlayed: newGamesPlayed });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});


// Update the leaderboard by seed
app.post('/leaderboard', async (req, res) => {
  const { user, seed, totalScore, rounds } = req.body;

  const { data, error, status, statusText } = await supabase
    .from('leaderboards')
    .upsert([{ user, seed, totalScore, rounds }], { onConflict: ['user', 'seed'] });

  // Return detailed info for debugging
  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Supabase error',
      error: error.message,
      status,
      statusText,
      data,
    });
  }

  // If no rows inserted or updated, data will be empty array
  if (!data || data.length === 0) {
    return res.status(200).json({
      success: false,
      message: 'No rows inserted or updated. Check constraints and policies.',
      data,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Leaderboard updated successfully.',
    data,
  });
});

// GET leaderboard by seed (query param)
app.get('/leaderboard', async (req, res) => {
  const seed = Number(req.query.seed);
  if (!seed) return res.status(400).json({ error: 'Seed query param is required' });

  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('seed', seed)
    .order('totalScore', { ascending: false }); // higher score better

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Serve static frontend files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/seed-analysis/:seed', async (req, res) => {
  const seed = Number(req.params.seed);
  if (!seed) return res.status(400).json({ error: 'Invalid seed' });

  // Fetch guesses grouped by round
  const { data: guesses, error: guessError } = await supabase
    .from('guesses')
    .select('*')
    .eq('seed', seed);

  // Fetch answers
  const { data: answers, error: answerError } = await supabase
    .from('answers')
    .select('*')
    .eq('seed', seed);

  if (guessError || answerError) {
    return res.status(500).json({ error: guessError?.message || answerError?.message });
  }

  // Group guesses by round
  const roundData = {};
  guesses.forEach(g => {
    if (!roundData[g.round]) roundData[g.round] = [];
    roundData[g.round].push(g);
  });

  // Map answers by round
  const answersMap = {};
  answers.forEach(a => {
    answersMap[a.round] = a;
  });

  res.json({ roundData, answers: answersMap });
});

app.get('/api/seeds/recent', async (req, res) => {
  // Example: return last 10 distinct seeds with counts and rounds

  // You may want to write SQL or supabase query that gets distinct seeds,
  // counts distinct users, and total rounds played for each seed.

  // Here's a simplified example:
  const { data, error } = await supabase
    .from('guesses')
    .select('seed, user, round', { count: 'exact' });

  if (error) return res.status(500).json({ error: error.message });

  // Aggregate data by seed
  const seedsMap = {};
  data.forEach(({ seed, user, round }) => {
    if (!seedsMap[seed]) {
      seedsMap[seed] = { seed, playerSet: new Set(), roundsSet: new Set() };
    }
    seedsMap[seed].playerSet.add(user);
    seedsMap[seed].roundsSet.add(round);
  });

  const recentSeeds = Object.values(seedsMap).map(s => ({
    seed: s.seed,
    playerCount: s.playerSet.size,
    totalRounds: s.roundsSet.size
  })).sort((a,b) => b.seed - a.seed).slice(0,10);

  res.json(recentSeeds);
});
