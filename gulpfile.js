const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');

function docs(done) {
  jsdoc2md.render({ files: ['modules/**/*.?(m)js', '*.js'], configure: 'jsdoc-conf.json' })
    .then(output => fs.writeFileSync('API.md', output));
  return done();
}

exports.docs = docs;