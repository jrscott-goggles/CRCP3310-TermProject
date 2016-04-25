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

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.tsv, "data/world-country-names.tsv")
	.defer(d3.csv, "emissions.csv")
    .await(ready);
	
function ready(error, world, names, emissions) {
  if (error) throw error;

  var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
      i = -1,
      n = countries.length;
	
	var dragBehaviour = d3.behavior.drag()
	.on('drag', function(){
		var dx = d3.event.dx;
		var dy = d3.event.dy;

		var rotation = projection.rotate();
		var radius = projection.scale();
		var scale = d3.scale.linear()
			.domain([-1 * radius, radius])
			.range([-90, 90]);
		var degX = scale(dx);
		var degY = scale(dy);
		rotation[0] += degX;
		rotation[1] -= degY;
		if (rotation[1] > 90)   rotation[1] = 90;
		if (rotation[1] < -90)  rotation[1] = -90;

		if (rotation[0] >= 180) rotation[0] -= 360;
		projection.rotate(rotation);
		drawGlobe();
	}) 
  /*var colors = [];
  var j;
  for (j = 0; j < n; j++) {
	  colors.push();
  }*/
  //var color = d3.scale.category20();

  countries = countries.filter(function(d) {
    return names.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });  
  
  drawGlobe();
  console.log(countries);
  d3.select("body").select('canvas').call(dragBehaviour);
  
  function drawGlobe() {
	c.clearRect(0, 0, width, height);
	//c.fillStyle = "blue", c.beginPath(), path(land), c.fill(); //color of countries
	var j;
	for (j = 0; j < n; j++) {
		//c.fillStyle = color(j%20), c.beginPath(), path(countries[j]), c.fill();
		var countryColor = d3.rgb(192, 192, 192);
		var k;
		for (k = 0; k < emissions.length; k++) {
			if (countries[j].name == emissions[k].country_name) {
				if (emissions[k].yr_1990 > 50000) {
				  countryColor = d3.rgb(204, 51, 0);
				} else if (emissions[k].yr_1990 < 50000 && emissions[k].yr_1990 > 10000) {
				  countryColor = d3.rgb(255, 102, 0);
				} else if (emissions[k].yr_1990 < 10000 && emissions[k].yr_1990 > 2000) {
				  countryColor = d3.rgb(255, 153, 0);
				} else if (emissions[k].yr_1990 < 2000 && emissions[k].yr_1990 > 400) {
          countryColor = d3.rgb(255, 204, 0);
        } else {
          countryColor = d3.rgb(255, 255, 153);
        }
      }
		c.fillStyle = countryColor, c.beginPath(), path(countries[j]), c.fill();
		}
	}
	//c.fillStyle = "black", c.beginPath(), path(countries[i]), c.fill();  //selected country
	c.strokeStyle = "#aaa", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
	c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();

  }
}

d3.select(self.frameElement).style("height", height + "px");

var dataset;

d3.csv("emissions.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    //console.log(data);
    dataset = data;
    d3.select("body").selectAll("p")
      .data(dataset)
      .enter()
      .append("p")
      .style("color", function(d) {
        if (d.yr_1990 > 100000) {
          return "red";
        } else if (d.yr_1990 < 100000 && d.yr_1990 > 10000) {
          return "black";
        } else {
          return "green";
        }
      })
      .text(function(d) { 
        return d.country_name + " had " + d.yr_1990 + " kt of emissions in 1990.";
      })
  }
});