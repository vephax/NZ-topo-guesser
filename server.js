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

  try {
    const { data, error } = await supabase
      .from('guesses')
      .select('user,distance,round')
      .eq('gameID', Number(gameID));
    if (error) return res.status(500).json({ success: false, error: 'test 1' });
    res.json({ data, success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'test 2' });
  }
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
app.post('/overallLeaderboard', async (req, res) => {
  const { user, scoreToAdd, gameType } = req.body;

  if (!user || typeof scoreToAdd !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('overallLeaderboard')
      .select('totalScore, gamesPlayed')
      .eq('user', user)
      .eq('gameType', gameType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(fetchError);
      return res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
    }

    let newTotalScore = scoreToAdd;
    let newGamesPlayed = 1;

    if (existing) {
      newTotalScore = existing.totalScore + scoreToAdd;
      newGamesPlayed = existing.gamesPlayed + 1;
    }

    const { data, error: upsertError } = await supabase
      .from('overallLeaderboard')
      .upsert(
        [{ user, totalScore: newTotalScore, gamesPlayed: newGamesPlayed, gameType }],
        { onConflict: ['user', 'gameType'] }
      )
      .select();

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      return res.status(500).json({ success: false, message: 'Error updating leaderboard' });
    }

    res.json({ success: true, totalScore: newTotalScore, gamesPlayed: newGamesPlayed, data });
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

app.post('/games', async (req, res) => {
  const { gameCategory, seed, gameType, playedBy, totalRounds, zoom, timerDuration } = req.body;

  const { data, error } = await supabase
    .from('games')
    .insert(
      [{ gameCategory, seed, gameType, playedBy, totalRounds, zoom, timerDuration }]
    )
    .select('gameID'); // Ask Supabase to return the primary key

  if (error) return res.status(500).json({ success: false, message: 'Error inserting game.' });

  const gameID = data[0].gameID; // Extract the primary key from the inserted row
  res.json({ success: true, gameID });
});

app.post('/games/:gameID/players', async (req, res) => {
  const { gameID } = req.params;      
  const { newPlayer } = req.body;

  // Get current array
  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('playedBy')
    .eq('gameID', gameID)
    .single();

  if (fetchError) {
    return res.status(400).json({ error: fetchError });
  }

  // Append new player
  const updatedArray = [...(game.playedBy || []), newPlayer];

  // Update array
  const { data, error } = await supabase
    .from('games')
    .update({ playedBy: updatedArray })
    .eq('gameID', gameID)
    .select();

  if (error) {
    return res.status(400).json({ error });
  }

  res.json(data);
});

app.get('/games', async (req, res) => {
  // Get the parameters
  let { gameCategory, includePlayer, excludePlayer } = req.query;

  let query = supabase
    .from('games')
    .select('gameID, gameCategory, seed, gameType, playedBy, zoom, timerDuration, totalRounds, timeCreated');

  // Check if game mets the necessary requirements
  if (gameCategory) {
    const categories = gameCategory.split(','); 
    query = query.in('gameCategory', categories);
  }

  if (includePlayer) {
    query = query.contains('playedBy', [includePlayer]);
  }

  if (excludePlayer) {
    query = query.not('playedBy', 'cs', `{${excludePlayer}}`);
  }

  // Send result to client
  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, games: data });
});

app.get('/recommendedGames', async (req, res) => {
  const { gameIDs } = req.query;

  if (!gameIDs) {
    return res.status(400).json({ success: false, error: "gameIDs query parameter is required" });
  }

  const ids = gameIDs.split(',').map(id => id.trim());

  try {
    const { data, error } = await supabase
      .from('recommendedGames')
      .select('gameID, name, recommendedBy')
      .in('gameID', ids);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, recommended: data }); 
  } catch (err) {
    res.status(500).json({ success: false, error: "Unexpected server error" });
  }
});