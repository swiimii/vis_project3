
class Chord {
	
	constructor(_config, _data) {
    this.config = {
	  title: _config.title || "Interaction Diagram",
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 450,
      containerHeight: _config.containerHeight || 500,
      margin: { top: 30, bottom: 10, right: 10, left: 10 }
    }

    this.data = _data;

    // Call a class function
    this.initVis();
	}
	
	initVis()
	{
		let vis = this;
		vis.charMatrixFull = [];
		
		const colors = [ "#440154ff", "#31668dff", "#37b578ff", "#fde725ff"]
		
		vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
	  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
		
		vis.svg = d3.select(vis.config.parentElement)
	  		.attr('width', vis.config.containerWidth)
	  		.attr('height', vis.config.containerHeight);
			
		
		//vis.UpdateVis();
		let charMat = vis.GetSceneMatrix();
		
		vis.charArc = d3.chord()
			.padAngle(0.05)
			.sortSubgroups(d3.descending)
			(charMat);
			
		vis.svg
			.datum(vis.charArc)
			.append('g')
				.attr("transform", "translate(500,500)")
			.selectAll('g')
			.data(d => d.groups)
			.join('g')
			.join('path')
				.style("fill", "grey")
				.style("stroke", "black")
				.attr("d", d3.arc()
				  .innerRadius(0)
				  .outerRadius(500)
				);
				
		vis.svg
		  .datum(vis.charArc)
		  .append("g")
			.attr("transform", `translate(${vis.config.containerWidth/2},${ vis.config.containerHeight/2})`)
		  .selectAll("path")
		  .data(d => d)
		  .join("path")
			.attr("d", d3.ribbon()
			  .radius(200)
			)
			.style("fill", d => colors[d.source.index % 4])
			.style("stroke", "black")
		  .on('mouseover', (event, d) => { console.log(d);
							d3.select('#tooltip')
							  .style('display', 'block')
							  .style('left', (event.pageX + 10) + 'px')   
							  .style('top', (event.pageY + 10) + 'px')
							  .html(`<div class="tooltip"><li>${impChar[d.source.index]} shared scenes with ${impChar[d.target.index]} ${d.source.value} times </li></div>
								  `);}) 
		   .on('mouseleave', () => {
			  d3.select('#tooltip').style('display', 'none');
			});

		let font_size = 12;
		// Title label
		vis.svg.append("g")
			.attr('transform', 'translate(' + (vis.config.containerWidth/2 - vis.config.margin.right) + ', ' + (font_size + 4) + ')')
			.append('text')
			.attr('text-anchor', 'middle')
			.text(vis.config.title)
			// These can be replaced by style if necessary
			//.attr('font-family', 'sans-serif')
			.attr("font-weight", "bold")
			.attr('font-size', font_size + 4)
	
	}
	
	
	GetSceneMatrix()
	{
		let vis = this;
		
		let charMat = Array(impChar.length).fill(null).map((i) => Array(impChar.length).fill(0));
		var seasonMap = d3.group(vis.data, d => d.season);
		var episodeMap;
		var sceneMap;
		var tempChar = [];
		for (var i of seasonMap)
		{
			//console.log('season #' + i[0]);
			episodeMap = d3.group(i[1], d => d.episode);
			for(var ep of episodeMap)
			{
				//console.log('episode #' + ep[0]);
				sceneMap = d3.group(ep[1], d => d.scene_count);
				for(var s of sceneMap)
				{
					//console.log('scene #: ' + s[0]);
					tempChar = [];
					for(var l of s[1])
					{
						if(impChar.indexOf(l.speaker) != -1) tempChar.push(l.speaker);
					}
					tempChar = new Set(tempChar);
					if(tempChar.has('doofenshmirtz') || tempChar.has('major monogram') || tempChar.has('carl')) tempChar.add('perry');
					if(tempChar.has('phineas')) tempChar.add('ferb');
					//console.log(tempChar);
					
					
					for(var col of tempChar)
					{
						for(var row of tempChar)
						{
							//console.log(charMat[impChar.indexOf(row)][impChar.indexOf(col)]);
							charMat[impChar.indexOf(row)][impChar.indexOf(col)] = charMat[impChar.indexOf(row)][impChar.indexOf(col)] + 1;
							//console.log(impChar.indexOf(row) + '//' + impChar.indexOf(col));
							//console.log(row + '//' + col);
							//console.log(charMat[impChar.indexOf(row)][impChar.indexOf(col)]);
						}
					}
				}
			}
		}
		
		console.log(charMat);
		
		for(var row = 0; row < charMat[0].length; row++)
		{
			for(var col = 0; col < charMat[0].length; col++)
			{
				if(charMat[row][col] < 75) charMat[row][col] = 0;
				if(row == col) charMat[row][col] = 0;
			}
		}
		
		
		return charMat;
	}
	
	UpdateVis()
	{
		let vis = this;
		let charMat = vis.GetSceneMatrix();
		
		vis.charArc = d3.chord()
			.padAngle(0.05)
			.sortSubgroups(d3.descending)
			(charMat);
			
		vis.svg
			.datum(vis.charArc)
			.join('g')
				//.attr("transform", "translate(500,500)")
			.selectAll('g')
			.data(d => d.groups)
			.join('g')
			.join('path')
				.style("fill", "grey")
				.style("stroke", "black")
				.attr("d", d3.arc()
				  .innerRadius(180)
				  .outerRadius(230)
				);
				
		vis.svg
		  .datum(vis.charArc)
		  .join("g")
			.attr("transform", "translate(220,220)")
		  .selectAll("path")
		  .data(d => d)
		  .join("path")
			.attr("d", d3.ribbon()
			  .radius(200)
			)
			.style("fill", "#69b3a2")
			.style("stroke", "black");
		
	}
	
	
	
}