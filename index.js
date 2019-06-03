var oldWidth = 0;
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

  //graph 1 starts here
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var margin = { top: 40, right: 100, bottom: 50, left: 100 },
    width = 900 - margin.left - margin.right,
    height = 531.25 - margin.top - margin.bottom;

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

    // Remove old
    d3.selectAll("circle")
      .data(ag_data)
      .exit()
      .remove();
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

  var svg = d3
    .select("#graph")
    .html("")
    .append("svg")
    .attrs({ width: width, height: height });
  /*
  var circle = svg.append('circle')
      .attrs({cx: 0, cy: 0, r: r})
      */

  var colors = ["orange", "purple", "steelblue", "pink", "black"];
  var guns = [
    "All",
    "Rifle",
    "Shotgun",
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
      console.log(i);
      filterType(guns[i], global_data);
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

  var svg2 = d3.select('.container-2 #graph').html('')
    .append('svg')
      .attrs({width: width + 450, height: height + 200})

  var path = svg2.append('path')

  var gs2 = d3.graphScroll()
      .container(d3.select('.container-2'))
      .graph(d3.selectAll('.container-2 #graph'))
      .eventId('uniqueId2')  // namespace for scroll and resize events
      .sections(d3.selectAll('.container-2 #sections > div'))
      .on('active', function(i){
        var h = height - 200
        var w = width - 200 
        var path = d3.geoPath();
        
        d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
          if (error) throw error;
        
          svg2.append("g")
            .style("width", "100%")
            .style("height", "auto")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
              .attr("d", path)
        
          svg2.append("path")
              .attr("class", "state-borders")
              .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { 
                return a !== b; 
              })));
        });
      })

  // d3.select('#source')
  //     .styles({'margin-bottom': window.innerHeight + 'px', padding: '100px'})
}
// render()
// d3.select(window).on('resize', render) 
//       path
//         .transition()
//         .duration(1000)
//         .attr("d", dArray[i])
//         .style("fill", colors[i]);
//     });

//   d3.select("#source").styles({
//     "margin-bottom": window.innerHeight - 450 + "px",
//     padding: "100px"
//   });
// }
// render();
// d3.select(window).on("resize", render);
