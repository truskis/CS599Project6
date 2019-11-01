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

        // WARNING: Not for production use! The following statement
        // is not protected against SQL injections.
        const r = db.exec(req.body.query);

        if (r[0]) {
          res.json({
            status: 'success',
            result: r[0].values.map(d => {
              let obj = {};
              r[0].columns.forEach((c, i) => obj[c] = d[i]);
              return obj;
            })
          });
        } else {
          res.json({
            status: 'error',
            result: `Query failed: ${req.body.query}`
          });
        }
      });
    }
  );
};
