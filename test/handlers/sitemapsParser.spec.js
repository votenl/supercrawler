var sitemapsParser = require("../../lib/handlers/sitemapsParser"),
    expect = require("chai").expect,
    Promise = require("bluebird"),
    zlib = require("zlib");

describe("sitemapsParser", function () {
  var sp,
      sitemapindex,
      urlset;

  beforeEach(function () {
    sp = sitemapsParser();

    sitemapindex = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
      "<sitemap>",
      "<loc>http://example.com/sitemap.xml.gz</loc>",
      "<lastmod>2015-07-17T18:16:02.754-07:00</lastmod>",
      "</sitemap>",
      "</sitemapindex>"
    ].join("\n");

    urlset = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\" >",
      "<url>",
      "<loc>https://example.com/home.html</loc>",
      "</url>",
      "</urlset>]"
    ].join("\n");
  });

  // sitemaps can be either XML or a plain list of links.
  it("discovers another sitemap", function (done) {
    sp(new Buffer(sitemapindex), "http://example.com/sitemap_index.xml").then(function (urls) {
      expect(urls).to.deep.equal([
        "http://example.com/sitemap.xml.gz"
      ]);
      done();
    });
  });

  it("discovers nothing if not a sitemap file", function (done) {
    sitemapindex = "<html><body><h1>I'm not a sitemap</h1></body></html>";
    sp(new Buffer(sitemapindex), "http://example.com/sitemap_index.xml").then(function (urls) {
      expect(urls).to.deep.equal([]);
      done();
    });
  });

  it("discovers a urlset", function (done) {
    sp(new Buffer(urlset), "http://example.com/sitemap_index.xml").then(function (urls) {
      expect(urls).to.deep.equal([
        "https://example.com/home.html"
      ]);
      done();
    });
  });

  it("supports a .gz sitemap file", function (done) {
    Promise.promisify(zlib.gzip)(new Buffer(urlset)).then(function (buf) {
      return sp(buf, "http://example.com/sitemap_index.xml", "application/x-gzip");
    }).then(function (urls) {
      expect(urls).to.deep.equal([
        "https://example.com/home.html"
      ]);
      done();
    });
  });
});
