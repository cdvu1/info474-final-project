
var oldWidth = 0
function render(){
  if (oldWidth == innerWidth) return
  oldWidth = innerWidth
  var width = height = d3.select('#graph').node().offsetWidth
  var r = 40
  if (innerWidth <= 925){
    width = innerWidth
    height = innerHeight*.10
  }

  // return console.log(width, height)

  var svg = d3.select('#graph').html('')
    .append('svg')
      .attrs({width: width, height: height})

  var circle = svg.append('circle')
      .attrs({cx: 0, cy: 0, r: r})

  var colors = ['orange', 'purple', 'steelblue', 'pink', 'black']
  var gs = d3.graphScroll()
      .container(d3.select('.container-1'))
      .graph(d3.selectAll('container-1 #graph'))
      .eventId('uniqueId1')  // namespace for scroll and resize events
      .sections(d3.selectAll('.container-1 #sections > div'))
      // .offset(innerWidth < 900 ? innerHeight - 30 : 200)
      .on('active', function(i){
        var pos = [ {cx: width - r, cy: r},
                    {cx: r,         cy: r},
                    {cx: width - r, cy: height - r},
                    {cx: width/2,   cy: height/2} ][i]
        
        circle.transition().duration(1000)
            .attrs(pos)
          .transition()
            .style('fill', colors[i])
      })


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
render()
d3.select(window).on('resize', render)

