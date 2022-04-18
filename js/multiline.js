class MultiLine {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 30, bottom: 35, right: 200, left: 35 }
      //tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.filtered_data = _data;
    this.inactive = [];
    this.initVis();
  }

  initVis() {
  	let vis = this;

  	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

  	// Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

 	// X axis
    vis.xScale = d3.scaleLinear()
      .domain([0, 100])
    	.range([0, vis.width]);

    vis.xAxisG = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
    vis.chart.append('g')
    	.attr("transform",  `translate(0, ${vis.height})`)
    	.attr("class", "myX")

    // Y axis
    vis.yScale = d3.scaleLinear()
    	//.domain([0, d3.max(vis.data, d=>d.value)])
    	.range([vis.height, 0]);
    
    vis.yAxisG = d3.axisLeft(vis.yScale)
    vis.chart.append('g')
    	.attr("class", "myY")

   	vis.svg.append("text")
    	.attr("x", vis.config.containerWidth/2 - 30)
    	.attr("y", 15)
    	.attr("font-weight", "bold")
    	.attr("text-anchor", "middle")
    	.style("font-size", "20px")
    	.text("When Main Characters Speak in Episodes")


	// Add X axis label:
	vis.svg.append("text")
	    .attr("text-anchor", "middle")
	    .attr("font-weight", "bold")
	    .style("font-size", "16px")
	    .attr("x", vis.width/2 + vis.config.margin.left)
	    .attr("y", vis.height+vis.config.margin.top+30)
	    .text("Percent into Episode (0 = Beginning, 100 = End)");

	// Y axis label:
	vis.svg.append("text")
	    .attr("text-anchor", "start")
	    .attr("font-weight", "bold")
	    .style("font-size", "16px")
	    .attr("y", 20)
	    .attr("x", 10)
      .text("Number of Lines in Selected Episodes")
	    //.text("Percent of Character's Lines")
    
    vis.keys = ["doofenshmirtz", "stacy", "phineas", "baljeet", "candace", "ferb", "linda", "buford", "isabella", "major monogram", "jeremy"];
    vis.color = d3.scaleOrdinal()
    	.domain(vis.keys)
      .range(["#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);

    vis.svg.selectAll("legdots")
        .data(vis.keys)
        .enter()
        .append("circle")
          .attr("class", "leg-btn")
          .attr("cx", vis.config.margin.left + vis.width + 20)
          .attr("cy", function(d,i){return 10 + i*18})
          .attr("r", 5)
          .style("fill", function(d){ return vis.color(d)});

    vis.svg.selectAll("leglabels")
        .data(vis.keys)
        .enter()
        .append("text")
            .attr("x", vis.config.margin.left + vis.width + 35)
            .attr("y", function(d,i){return 10 + i*18}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    
    vis.svg.selectAll(".leg-btn")        
        .on('click', (event, d) => {
          console.log(d);
          if (vis.inactive.includes(d)) {
            vis.inactive = vis.inactive.filter((element) => element != d);
          }
          else{
            vis.inactive.push(d);
          }
          vis.renderVis();
        });
    	
    vis.updateVis(vis.data);
  }

  updateVis(data) {
  	let vis = this;

  	vis.data = get_episode_dist(data);

    // vis.chart.selectAll('.dot')
    //     .data([])
    //     .exit().remove();
  	
  	//vis.xScale.domain(d3.extent(data, d => d.));
  	vis.chart.selectAll(".myX").transition()
  		.duration(1000)
  		.call(vis.xAxisG);

  	vis.yScale.domain([0, d3.max(vis.data, d=>d.value)]);
  	vis.chart.selectAll(".myY").transition()
  		.duration(1000)
  		.call(vis.yAxisG);

  	vis.grouped_data = d3.group(vis.data, d=>d.speaker);
    console.log(vis.grouped_data);
    vis.grouped_data.forEach(d=> {
      d.sort((a, b) => (a.perc > b.perc) ? 1 : -1);
      if (d.length < 101) {
        let char = d[0].speaker;
        for (let i=0; i < 101; i++) {
          if (d.length > i) {
            if (d[i].perc != i) {
              let start = i;
              let deleteCount = 0;
              d.splice(start, deleteCount, {speaker: char, perc: i, value: 0});
            }
          }
           else {
             d.push({speaker: char, perc: i, value: 0});
          }
        }
      }
    });
    console.log(vis.grouped_data);
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll('.line')
        .data([])
        .exit().remove();

    vis.chart.selectAll(".line")
      .data(vis.grouped_data)
      .join("path")
        .attr("class","line")
        .transition()
        .duration(1000)
        .attr("fill", "none")
        .attr("stroke", function(d){ return vis.color(d[0])})
        .attr("opacity", function(d){ 
          let op = 1;
          console.log(vis.inactive);
          if (vis.inactive.includes(d[0])) {
            op = 0;
          }
          return op;})
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(d => vis.xScale(d.perc))
            .y(d => vis.yScale(d.value))
            (d[1])
        });
  }

  	
  	
  	// vis.circles = vis.chart.selectAll(".dot")	
   //      .data(vis.data)			
   //  	.join("circle")	
   //  		.attr("class", "dot")							
   //      	.attr("r", 3)
   //      	//.attr("fill", function(d){ return vis.color(d[0])})	
   //      	.style("opacity", 1)
   //      	.attr("cx", function(d) { return vis.xScale(d.perc); })		 
   //      	.attr("cy", function(d) { return vis.yScale(d.value); })	
   //        .style("fill", function (d) { return vis.color(d.speaker) } )

   //  vis.circles
   //        .on('mouseover', (event,d) => {
   //          for(let i = 0; i < vis.data.length; i++){
	  //         	if (d.year == vis.data[i].year && vis.data[i].stat == "max"){
	  //         		d.max = vis.data[i].value;
	  //         	}
	  //         	else if (d.year == vis.data[i].year && vis.data[i].stat == "med") {
	  //         		d.med = vis.data[i].value;
	  //         	}
	  //         	else if (d.year == vis.data[i].year && vis.data[i].stat == "ninety"){
	  //         		d.ninety = vis.data[i].value;
	  //         	}
	  //         }

   //        d3.select('#tooltip')
   //          .style('display', 'block')
   //          .style('left', (event.pageX + 10) + 'px')   
   //          .style('top', (event.pageY + 10) + 'px')
   //          .html(`
   //            <div class="tooltip-title">${d.year}</div>
   //            <ul>
   //              <li>Max: ${d.max}</li>
   //              <li>Median: ${d.med}</li>
   //              <li>90th Perc: ${d.ninety}</li>
   //            </ul>
   //          `);
   //      })
   //      .on('mouseleave', () => {
   //        d3.select('#tooltip').style('display', 'none');
   //      });	
   
  
}