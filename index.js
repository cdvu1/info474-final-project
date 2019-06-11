var oldWidth = 0;
var dataArray = [];
function render() {
  if (oldWidth == innerWidth) return;
  oldWidth = innerWidth;

  var width = (height = d3.select("#graph").node().offsetWidth);
  var r = 40;

  if (innerWidth <= 925) {
    width = innerWidth;
    height = innerHeight * 0.7;
  }

  // return console.log(width, height)
  var margin = { top: 40, right: 100, bottom: 50, left: 100 },
    width = 900 - margin.left - margin.right,
    height = 531.25 - margin.top - margin.bottom;

  //graph 1 starts here
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height - margin.bottom + 45, margin.top]);

  // define the line
  var valueline = d3
    .line()
    .x(function(d) {
      return x(d.Year);
    })
    .y(function(d) {
      return y(d.Total_Shootings);
    });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var global_ag_data;
  var global_data;
  // Create Tooltip
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.csv("gun_violence_data.csv", function(error, data) {
    var ag_data = agregateData(data);
    global_data = data;
    global_ag_data = ag_data;
    // Scale the range of the data

    // draw the initial visualization
    drawVis_1(ag_data);

    // Adding the dropdown
    // var select = d3.select("#weapon-type");

    // select.on("change", function(d) {
    //   var value = d3.select(this).property("value");
    //   filterType(value, data);
    // });

    // select
    //   .append("option")
    //   .attr("value", "All")
    //   .text("All");

    // select
    //   .selectAll("option")
    //   .data(
    //     d3
    //       .map(data, function(d) {
    //         return d["Firearm Type"];
    //       })
    //       .keys()
    //   )
    //   .enter()
    //   .append("option")
    //   .attr("value", function(d) {
    //     return d;
    //   })
    //   .text(function(d) {
    //     return d;
    //   });
  });

  agregateData = data => {
    data = data.filter(function(d) {
      return +d.Date.split("/")[2] >= 2008;
    });
    data = data.filter(function(d) {
      return +d.Date.split("/")[2] <= 2018;
    });
    data = d3
      .nest()
      .key(function(d) {
        // Summing by firearm type
        return d.Date.split("/")[2];
      })
      .rollup(function(leaves) {
        return leaves.length;
      })
      .entries(data)
      .map(function(d) {
        return { Year: d.key, Total_Shootings: d.value };
      });
    return data;
  };

  drawAllLines = data => {
    var data_all = data.filter(function(d) {
      return d["Firearm Type"] != "";
    });
    var data_rifle = data.filter(function(d) {
      return d["Firearm Type"] == "Rifle";
    });
    var data_shotgun = data.filter(function(d) {
      return d["Firearm Type"] == "Shotgun";
    });
    var data_handgun = data.filter(function(d) {
      return d["Firearm Type"] == "Handgun";
    });
    var data_combo = data.filter(function(d) {
      return d["Firearm Type"] == "Combination of Different Types of Weapons";
    });

    var ag_data_all = agregateData(data_all);
    var ag_data_rifle = agregateData(data_rifle);
    var ag_data_shotgun = agregateData(data_shotgun);
    var ag_data_handgun = agregateData(data_handgun);
    var ag_data_combo = agregateData(data_combo);

    y.domain([
      0,
      d3.max(ag_data_all, function(d) {
        return d.Total_Shootings;
      })
    ]);

    // Make the changes
    svg
      .select(".line")
      .transition() // change the line
      .duration(750)
      .attr("d", valueline(ag_data_all));

    svg
      .select(".y.axis")
      .transition() // change the y axis
      .duration(750)
      .call(d3.axisLeft(y).ticks(4));

    svg
      .append("path")
      .data([ag_data_rifle])
      .attr("class", "line r")
      .attr("d", valueline);
    svg
      .append("path")
      .data([ag_data_shotgun])
      .attr("class", "line s")
      .attr("d", valueline);
    svg
      .append("path")
      .data([ag_data_handgun])
      .attr("class", "line h")
      .attr("d", valueline);
    svg
      .append("path")
      .data([ag_data_combo])
      .attr("class", "line c")
      .attr("d", valueline);

    d3.selectAll("circle").remove();
  };

  filterType = (value, data) => {
    if (value == "All") {
      data = data.filter(function(d) {
        return d["Firearm Type"] != "";
      });
    } else {
      data = data.filter(function(d) {
        return d["Firearm Type"] == value;
      });
    }
    var ag_data = agregateData(data);

    var rifle_data = data.filter(function(d) {
      return d["Firearm Type"] == "Rifle";
    });
    var ag_rifle = agregateData(rifle_data);
    // UPDATE THE VISUALIZATION
    y.domain([
      0,
      d3.max(ag_data, function(d) {
        return d.Total_Shootings;
      })
    ]);

    // Make the changes
    svg
      .select(".line")
      .transition() // change the line
      .duration(750)
      .attr("d", valueline(ag_data));

    svg
      .select(".y.axis")
      .transition() // change the y axis
      .duration(750)
      .call(d3.axisLeft(y).ticks(4));

    svg
      .selectAll("circle")
      .data(ag_data)
      .transition()
      .duration(750)
      .attr("cx", function(d) {
        return x(d.Year);
      })
      .attr("cy", function(d) {
        return y(d.Total_Shootings);
      });

    //Enter new circles
    d3.selectAll("circle")
      .data(ag_data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return x(d.Year);
      })
      .attr("cy", function(d) {
        return y(d.Total_Shootings);
      })
      .attr("r", 3);

    svg
      .selectAll("circle")
      .data(ag_data)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function(d) {
        return x(d.Year);
      })
      .attr("cy", function(d) {
        return y(d.Total_Shootings);
      })
      .on("mouseover", function(d) {
        div
          .transition()
          .duration(200)
          .style("opacity", 5);
        div
          .html(
            "<div><b>Year</b>: " +
              d.Year +
              "</div><br/>" +
              "<div><b>Total Shootings</b>: " +
              d.Total_Shootings +
              "</div>"
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 65 + "px");
      })
      .on("mouseout", function(d) {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Remove old
    d3.selectAll("circle")
      .data(ag_data)
      .exit()
      .remove();

    d3.selectAll("path")
      .data(ag_data)
      .exit()
      .remove();

    d3.select(".r").remove();
  };

  drawVis_1 = data => {
    x.domain(
      d3.extent(data, function(d) {
        return d.Year;
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        return d.Total_Shootings;
      })
    ]);

    // Add the valueline path.
    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

    // Add the scatterplot
    svg
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function(d) {
        return x(d.Year);
      })
      .attr("cy", function(d) {
        return y(d.Total_Shootings);
      })
      .on("mouseover", function(d) {
        div
          .transition()
          .duration(200)
          .style("opacity", 5);
        div
          .html(
            "<div><b>Year</b>: " +
              d.Year +
              "</div><br/>" +
              "<div><b>Total Shootings</b>: " +
              d.Total_Shootings +
              "</div>"
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 65 + "px");
      })
      .on("mouseout", function(d) {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add the X Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(
        d3.axisBottom(x).tickFormat(function(n) {
          return n * 1;
        })
      );

    // X Axis Label
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 0) + ")"
      )
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Year");
    // Add the Y Axis
    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks(4));

    // Y Axis Label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left / 2)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Shootings");
  };

  // var svg = d3
  //   .select("#graph")
  //   .html("")
  //   .append("svg")
  //   .attrs({ width: width, height: height });
  /*
  var circle = svg.append('circle')
      .attrs({cx: 0, cy: 0, r: r})
      */

  var colors = ["orange", "purple", "steelblue", "pink", "black"];
  var guns = [
    "All",
    "Rifle",
    "Shotgun",
    "Handgun",
    "Combination of Different Types of Weapons"
  ];
  var gs = d3
    .graphScroll()
    .container(d3.select(".container-1"))
    .graph(d3.selectAll("container-1 #graph"))
    .eventId("uniqueId1") // namespace for scroll and resize events
    .sections(d3.selectAll(".container-1 #sections > div"))
    // .offset(innerWidth < 900 ? innerHeight - 30 : 200)
    .on("active", function(i) {
      // console.log(i);
      if (i != 5) {
        filterType(guns[i], global_data);
      } else {
        drawAllLines(global_data);
      }
      /*
        var pos = [ {cx: width - r, cy: r},
                    {cx: r,         cy: r},
                    {cx: width - r, cy: height - r},
                    {cx: width/2,   cy: height/2} ][i]
        
        circle.transition().duration(1000)
            .attrs(pos)
          .transition()
            .style('fill', colors[i])
            */
    });

  // graph 2 starts here

  var svg2 = d3
    .select(".container-2 #graph")
    .html("")
    .append("svg")
    .attrs({ width: width, height: height });

  var path = svg2.append("path");



  // USA MAP
  function getMapData(year) {
    //  d3
    // .select(".container-2 #graph svg")
    // .remove()
    // var svg2 = d3
    // .select(".container-2 #graph")
    // svg2.remove()
    svg2.selectAll("path").remove();

    var width = 960;
    var height = 500;
    var lowColor = "white";
    var highColor = "red";

    // D3 Projection
    var projection = d3
      .geoAlbersUsa()
      .translate([width / 3, height / 2]) // translate to center of screen
      .scale([850]); // scale things down so see entire US

    // Define path generator
    var path = d3
      .geoPath() // path generator that will convert GeoJSON to SVG paths
      .projection(projection); // tell path generator to use albersUsa projection
    // Load in my states data!
    d3.csv("yearly_data.csv", function(data) {
      
      for (var d = 0; d < data.length; d++) {
        if (year === "2014") {
          dataArray.push(data[d].year_2014);
        } else if (year == "2015") {
          dataArray.push(data[d].year_2015);
        } else if (year == "2016") {
          dataArray.push(data[d].year_2016);
        } else if (year == "2017") {
          dataArray.push(data[d].year_2017);
        } else {
          dataArray.push(data[d].year_2018);
        }
        // dataArray.push((data[d]));
        // console.log((data[d]))
      }
      
      
      var ramp = d3
        .scaleLinear()
        .domain([0, 10])
        .range([lowColor, highColor]);
      
      var minVal = d3.min(dataArray);
      var maxVal = d3.max(dataArray);

      console.log("max value", maxVal)

      // Load GeoJSON data and merge with states data
      d3.json("us-states.json", function(json) {
        console.log(year);

        // Loop through each state data value in the .csv file

        for (var i = 0; i < data.length; i++) {
          // Grab State Name
          var dataState = data[i].state_abbr;
          // console.log(dataState)
          // Grab data value
          // console.log(data)
          for (var d = 0; d < data.length; d++) {
            if (year === "2018") {
              dataValue = data[i].year_2018;
            } else if (year == "2017") {
              dataValue = data[i].year_2017;
            } else if (year == "2016") {
              dataValue = data[i].year_2016;
            } else if (year == "2015") {
              dataValue = data[i].year_2015;
            } else if (year == "2014") {
              dataValue = data[i].year_2014;
            } else {
              dataValue = dataValue = data[i].year_2018;
            }
          }

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.abbr;
            if (dataState == jsonState) {
              // Copy the data value into the JSON
              json.features[j].properties.value = dataValue;
              // console.log(dataValue)
              // Stop looking through the JSON
              break;
            }
          }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature

        svg2
          .selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", function(d) {
            return ramp(d.properties.value);
          });
      });
    });
  }

  var years = [2014, 2015, 2016, 2017, 2018];

  var gs2 = d3
    .graphScroll()
    .container(d3.select(".container-2"))
    .graph(d3.selectAll(".container-2 #graph"))
    .eventId("uniqueId2") // namespace for scroll and resize events
    .sections(d3.selectAll(".container-2 #sections > div"))
    .on("active", function(i) {
      getMapData(years[i]);
      console.log(i);
      console.log(years[i]);
      // // Load in my states data!
      // d3.csv("yearly_data.csv", function(data) {
      //   var dataArray = [];
      //   for (var d = 0; d < data.length; d++) {
      //     dataArray.push(parseFloat(data[d].year_2014));
      //     console.log(data[d].year_2014)
      //   }
      //   var minVal = d3.min(dataArray);
      //   var maxVal = d3.max(dataArray);
      //   var ramp = d3
      //     .scaleLinear()
      //     .domain([0, 10])
      //     .range([lowColor, highColor]);

      //   // Load GeoJSON data and merge with states data
      //   d3.json("us-states.json", function(json) {
      //     // Loop through each state data value in the .csv file
      //     for (var i = 0; i < data.length; i++) {
      //       // Grab State Name
      //       var dataState = data[i].state_abbr;
      //       // console.log(dataState)
      //       // Grab data value
      //       var dataValue = data[i].year_2014;
      //       // console.log(dataValue)

      //       // Find the corresponding state inside the GeoJSON
      //       for (var j = 0; j < json.features.length; j++) {
      //         var jsonState = json.features[j].properties.abbr;

      //         if (dataState == jsonState) {
      //           // Copy the data value into the JSON
      //           json.features[j].properties.value = dataValue;
      //           console.log(dataValue)
      //           // Stop looking through the JSON
      //           break;
      //         }
      //       }
      //     }

      //     // Bind the data to the SVG and create one path per GeoJSON feature
      //     svg2
      //       .selectAll("path")
      //       .data(json.features)
      //       .enter()
      //       .append("path")
      //       .attr("d", path)
      //       .style("stroke", "#fff")
      //       .style("stroke-width", "1")
      //       .style("fill", function(d) {
      //         return ramp(d.properties.value);
      //       });

      // add a legend
      // var w = 140,
      //   h = 300;

      // var key = d3
      //   .select("map-graph1")
      //   .append("svg")
      //   .attr("width", w)
      //   .attr("height", h)
      //   .attr("class", "legend");

      // var legend = key
      //   .append("defs")
      //   .append("svg:linearGradient")
      //   .attr("id", "gradient")
      //   .attr("x1", "100%")
      //   .attr("y1", "0%")
      //   .attr("x2", "100%")
      //   .attr("y2", "100%")
      //   .attr("spreadMethod", "pad");

      // legend
      //   .append("stop")
      //   .attr("offset", "0%")
      //   .attr("stop-color", highColor)
      //   .attr("stop-opacity", 1);

      // legend
      //   .append("stop")
      //   .attr("offset", "100%")
      //   .attr("stop-color", lowColor)
      //   .attr("stop-opacity", 1);

      // key
      //   .append("rect")
      //   .attr("width", w - 100)
      //   .attr("height", h)
      //   .style("fill", "url(#gradient)")
      //   .attr("transform", "translate(0,10)");

      // var y = d3
      //   .scaleLinear()
      //   .range([h, 0])
      //   .domain([minVal, maxVal]);

      // var yAxis = d3.axisRight(y);

      // key
      //   .append("g")
      //   .attr("class", "y axis")
      //   .attr("transform", "translate(41,10)")
      //   .call(yAxis);
      //   });
      // });
    });

  // d3.select("#source").styles({
  //   "margin-bottom": window.innerHeight - 450 + "px",
  //   padding: "100px"
  // });
}



//add a legend
var lowColor = "white";

    var highColor = "red";
var w = 300, h = 50;

    var key = d3.select("#legend")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", lowColor)
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", highColor)
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", w)
      .attr("height", h - 30)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");

    var y = d3.scaleLinear()
      .range([300, 0])
      .domain([8, 0]);

    var yAxis = d3.axisBottom()
      .scale(y)
      .ticks(4);

    key.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,30)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("axis title");

render();
// d3.select(window).on("resize", render);
