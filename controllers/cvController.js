const { queryAsync } = require('../models/dbModel');

async function uploadCVData(req, res) {
  const cvData = req.body;

  const results = await queryAsync('INSERT INTO cv SET ?', [cvData]);

  if (results) {
    console.log('CV data inserted successfully');
    res.status(201).json({ message: 'CV data inserted successfully' });
  } else {
    console.error('Error inserting CV data');
    res.status(500).json({ error: 'Error inserting CV data' });
  }
}

async function getAllCVData(req, res) {
  const results = await queryAsync('SELECT * FROM cv');

  if (results.length > 0) {
    console.log('CV data retrieved successfully');
    res.status(200).json(results);
  } else {
    console.error('No CV data found');
    res.status(404).json({ message: 'No CV data found' });
  }
}

module.exports = {
  uploadCVData,
  getAllCVData,
};
