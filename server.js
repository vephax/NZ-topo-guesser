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
  const { gameID, round, user, lat, lng, distance } = req.body;

  const { data, error } = await supabase
    .from('guesses')
    .insert([{ gameID, round, user, lat, lng, distance }]);

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

/*
// POST an answer (insert)
app.post('/answers', async (req, res) => {
  const { seed, round, lat, lng } = req.body;
  const { data, error } = await supabase
    .from('answers')
    .insert([{ seed, round, lat, lng }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});
*/

/*
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
*/

// GET distances for a specific game (for leaderboards)
app.get('/guesses/:gameID/userDistances', async (req, res) => {
  const { gameID } = req.params;
  const { data, error } = await supabase
    .from('guesses')
    .select('user', 'distance', 'round')
    .eq('gameID', Number(gameID));
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/*
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
*/

// GET route for overall leaderboard
app.get('/overallLeaderboard', async (req, res) => {
  const { gameType } = req.query;

  let query = supabase
    .from('overallLeaderboard')
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

// update data to the overall leaderboard
app.post('overallLeaderboard', async (req, res) => {
  const { user, scoreToAdd, gameType } = req.body;

  if (!user || typeof scoreToAdd !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    // Fetch existing user data
    const { data: existing, error: fetchError } = await supabase
      .from('overallLeaderboard')
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
      .from('overallLeaderboard')
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

// Serve static frontend files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

/*
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
*/

app.post('games', async (req, res) => {
  const {gameCategory, seed, gameType, playedBy, totalRounds, zoom, timerDuration } = req.body;

  const { error: insertError } = await supabase
    .from('overallLeaderboard')
    .insert(
      [{ 
        gameCategory: gameCategory,
        seed: seed,
        gameType: gameType,
        playedBy: playedBy,
        totalRounds: totalRounds,
        zoom: zoom,
        timerDuration: timerDuration
       }],
    )
    .select('gameID');
  
  if (insertError) return res.status(500).json({ success: false, message: 'Error inserting game.' });
  
  res.json({ success: true, gameID: gameID});
});

app.post('/games/:gameID/players', async (req, res) => {
  const { gameID } = req.params;      
  const { newPlayer } = req.body;

  const { data, error } = await supabase
    .from('games')
    .update({ playedBy: supabase.fn.array_append('playedBy', newPlayer) })
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

app.get('/games', async (req, res) => {
  const { gameCategory } = req.query;

  let query = supabase
    .from('games')
    .select('gameID, gameCategory, seed, gameType, playedBy, zoom, timerDuration, totalRounds, timeCreated');
    
  if (gameCategory) {
    query = query.eq('gameCategory', gameCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ success: false });
  }

  res.json({ success: true, games: data });
});
