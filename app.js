const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.TOKEN;
const username = process.env.USERNAME;

// Enable CORS
app.use(cors());

// Set up the GitHub API base URL
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `token ${token}`,
    'User-Agent': 'request'
  }
});

// Handle the search API endpoint
app.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const results = [];

    // Build the GitHub API search query
    let searchQuery = `q=${query}`;
    if (req.query.language) {
      searchQuery += `+language:${req.query.language}`;
    }
    if (req.query.author) {
      searchQuery += `+author:"${req.query.author}"`;
    }
    if (req.query.committer) {
      searchQuery += `+committer:"${req.query.committer}"`;
    }
    if (req.query.repo) {
      searchQuery += `+repo:${req.query.repo}`;
    }
    if (req.query.path) {
      searchQuery += `+path:${req.query.path}`;
    }
    if (req.query.is) {
      searchQuery += `+is:${req.query.is}`;
    }
    if (req.query.hash) {
      searchQuery += `+hash:${req.query.hash}`;
    }

    // Send the GitHub API request to search for commits
    const searchResponse = await githubAPI.get(`/search/commits?${searchQuery}`);
    return res.json(searchResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching search results');
  }
});

app.get('/code/:owner/:repo/:sha', async (req, res) => {
  try {
    const { owner, repo, sha } = req.params;

    // Send the GitHub API request to search for commits
    const commitResponse = await githubAPI.get(`/repos/${owner}/${repo}/commits/${sha}`);
    if (commitResponse.status === 200) {
      const file = commitResponse.data.files[0];
      const code = file.patch;
      const language = file.filename.split('.').pop();

      const result = {
        code: code,
        language: language,
        commit: commitResponse.data.commit
      };

      res.send(result);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send('Error fetching search results');
  }

});



// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

