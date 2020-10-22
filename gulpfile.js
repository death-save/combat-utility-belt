const jsdoc2md = require('jsdoc-to-markdown');
const { parallel, series } = require('gulp');
const fs = require('fs');
const zip = require('gulp-zip');
const gulp = require('gulp');
const version = require('./package.json').version;
const fetch  = require('node-fetch');

function docs(done) {
  jsdoc2md.render({ files: ['modules/**/*.?(m)js', '*.js'], configure: 'jsdoc-conf.json' })
    .then(output => fs.writeFileSync('api.md', output));
  return done();
}

async function patrons(done) {
  
  const patrons = await fetchPatrons();
  const uniquePatrons = patrons.filter((v, i, a) => {
    return a.findIndex(t => (t.attributes.full_name === v.attributes.full_name)) === i;
  });

  const activePatrons = uniquePatrons.filter(m => m.attributes.patron_status === "active_patron");
  const patronList = [];
  for (let p of activePatrons) {
    const nameParts = p.attributes.full_name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 && nameParts[1].length ? nameParts[1] : "";
    const lastInitial = lastName ? lastName.substr(0,1) : "";
    const name = lastInitial ? `${firstName} ${lastInitial}` : `${firstName}`;

    const patron = {
      name
    }

    patronList.push(patron);
  }

  fs.writeFileSync('patrons.json', JSON.stringify(patronList, null, 4))
  console.log(activePatrons.length);

  return done();
}

function build(done) {
  gulp.src('module.json')
    .pipe(gulp.dest('dist'));

  gulp.src([
    '**/*', 
    '!dist/**',
    '!out/**',
    '!jsdoc/**',
    '!node_modules/**',
    '!.gitignore',
    '!gulpfile.js',
    '!package.json',
    '!package-lock.json'
  ])
    .pipe(zip(`combat-carousel.zip`))
    .pipe(gulp.dest('dist'));
  return done();
}

async function fetchPatrons(patrons=[], nextPage=null) {
  const accessToken = fs.readFileSync('patreon_key.txt', 'utf-8');
  const campaignId = '5254689';
  const url = `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`;
  const query = '?fields%5Bmember%5D=full_name,patron_status';
  const pagination = nextPage ? `&page%5Bcursor%5D=${nextPage}` : '';

  let myHeaders = new fetch.Headers();
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
  myHeaders.append("Cookie", "__cfduid=d0ff53e0a0f52232bc3d071e4e41b36f11601349207; patreon_device_id=aa72995a-d296-4e22-8336-fba6580fa49b; __cf_bm=6d8302a7c059da3dc166c9718f7372a386a1911c-1601350627-1800-AXgBmtTqEn83/w2Ka4Mq+ewtUVrvq5+bZppjqM6WDA2ofb1XwF22RNcARQzzHOF2S9K/A2UUeVUnfInGOwqJ6qk=");

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const response = await fetch(`${url}${query}${pagination}`, requestOptions);
  //console.log(response);
  const json = await response.json();
  //console.log(json);
  const data = json.data;
  //console.log(data);
  const responseNextPage = json.meta && json.meta.pagination && json.meta.pagination.cursors ? json.meta.pagination.cursors.next : null;
  //console.log(responseNextPage);
  //console.log(json.meta);
  patrons = patrons.concat(data);
  //console.log(patrons);

  if (responseNextPage) {
    const nextPatrons = await fetchPatrons(patrons, responseNextPage);
    //console.log(nextPatrons);
    patrons = patrons.concat(nextPatrons)
  }

  console.log(patrons.length);
  return patrons;
}

const chores = parallel(/*patrons,*/ docs);

exports.build = build;
exports.docs = docs;
exports.patrons = patrons;
exports.chores = chores;
exports.default = series(chores, build);