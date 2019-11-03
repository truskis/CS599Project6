const express = require('express');
const fs = require('fs');
const sqlite = require('sql.js');

module.exports = function(app) {
  sqlite().then(SQL => {
    const filebuffer = fs.readFileSync('data/combined.sqlite');

    const db = new SQL.Database(filebuffer);

    app.use(express.json());
    app.post(
      '/query.php',
      (req, res) => {
        if (!req.body.query) {
          res.json({
            status: 'error',
            result: 'No query string'
          });
          return;
        }

        try {
          // WARNING: Not for production use! The following statement
          // is not protected against SQL injections.
          const statement = db.prepare(req.body.query);
          let result = [];
          while (statement.step())
          {
            result.push(statement.getAsObject());
          }
          statement.free();
          res.json({
            status: 'success',
            result: result
          });
        }
        catch (e) {
          res.json({
            status: 'error',
            result: `Query "${req.body.query}" failed: ${e}`
          });
        }
      });
    }
  );
};
