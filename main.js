var width = 960,
    height = 960;

var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(width / 2 - 20)
    .clipAngle(90)
    .precision(0.6);

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var title = d3.select("h1");

var drag = d3.behavior.drag();

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.tsv, "data/world-country-names.tsv")
    .await(ready);

function ready(error, world, names) {
  if (error) throw error;

  var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
      i = -1,
      n = countries.length;
	  
 
  /*var colors = [];
  var j;
  for (j = 0; j < n; j++) {
	  colors.push();
  }*/
  var color = d3.scale.category20();

  countries = countries.filter(function(d) {
    return names.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });  
  
  (function transition() {
    d3.transition()
        .duration(125000)
        .each("start", function() {
          title.text(countries[i = 1].name);
		  //title.text(countries[i = (i + 1) % n].name);
        })
        .tween("rotate", function() {
          var p = d3.geo.centroid(countries[i]), //p = current country
              r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]); //how it rotates
          return function(t) {
            projection.rotate(r(t));
            c.clearRect(0, 0, width, height);
            //c.fillStyle = "blue", c.beginPath(), path(land), c.fill(); //color of countries
			var j;
			for (j = 0; j < n; j++) {
				c.fillStyle = color(j%20), c.beginPath(), path(countries[j]), c.fill();
			}
            c.fillStyle = "black", c.beginPath(), path(countries[i]), c.fill();  //selected country
            c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
            c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
          };
        })
      .transition()
        .each("end", transition);
  })();
}

d3.select(self.frameElement).style("height", height + "px");

var dataset;

d3.csv("data.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
    dataset = data;
  }
});