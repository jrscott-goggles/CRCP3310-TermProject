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
    .defer(d3.csv, "data/filteredData.csv")
    .await(ready);
	
function ready(error, world, names) {
  if (error) throw error;

  var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
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
	

	var i,
		sorted_names = [];
	for (i = 0; i < n; i++) {
		current_id = countries[i].id;
		var j, match_found = false;
		for (j = 0; j < names.length; j++) {
			if (names[j].id == current_id) {
				sorted_names.push(names[j]);
				match_found = true;
			}
		}
		if (!match_found) {
			sorted_names.push({id: current_id, name: "", yr_1990: "",yr_2000: "", yr_2006: "", yr_2007: "", yr_2008: "", yr_2009: "", yr_2010: "", yr_2011: ""});
		}
	}
  
  
  drawGlobe();
  d3.select("body").select('canvas').call(dragBehaviour);
  
  
  function drawGlobe() {
	c.clearRect(0, 0, width, height);
	var j;
	for (j = 0; j < n; j++) {
		var countryColor = d3.rgb(192, 192, 192);
		if (sorted_names[j].yr_1990 > 50000) {
		  countryColor = d3.rgb(204, 51, 0);
		} else if (sorted_names[j].yr_1990 < 50000 && sorted_names[j].yr_1990 > 10000) {
		  countryColor = d3.rgb(255, 102, 0);
		} else if (sorted_names[j].yr_1990 < 10000 && sorted_names[j].yr_1990 > 2000) {
		  countryColor = d3.rgb(255, 153, 0);
		} else if (sorted_names[j].yr_1990 < 2000 && sorted_names[j].yr_1990 > 400) {
			countryColor = d3.rgb(255, 204, 0);
		} else {
			countryColor = d3.rgb(255, 255, 153);
		}
		c.fillStyle = countryColor, c.beginPath(), path(countries[j]), c.fill();
	}
	c.strokeStyle = "#aaa", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
	c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();

  }
}

d3.select(self.frameElement).style("height", height + "px");