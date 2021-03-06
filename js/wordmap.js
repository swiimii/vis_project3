class Wordmap {
	constructor(_config, _data) {
	    this.config = {
		  title: _config.title || "Word Occurrance Chart",
	      parentElement: _config.parentElement,
	      containerWidth: _config.containerWidth || 500,
	      containerHeight: _config.containerHeight || 140,
	      margin: { top: 30, bottom: 5, right: 5, left: 100}
	    }

	    this.data = _data;
		this.filtered_data = this.data;
	    // Call a class function
	    this.initVis();
	}

	initVis() {
		let vis = this;
		vis.stopwords = new Set(
		    "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(",")
		);

		vis.fontFamily = "sans-serif";
		vis.fontScale = 3;
		vis.padding = 2;
		vis.rotate = () => 0;

		vis.colors = d3.scaleThreshold()
			.domain([1, 5, 10, 25, 50, 100, 150, 200, 300, 500])
		 	.range(["#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);

		vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
	  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

	  	vis.svg = d3.select(vis.config.parentElement)
	  		.attr('width', vis.config.containerWidth)
	  		.attr('height', vis.config.containerHeight);
	  		
	  	//This might need to be moved to updateVis
	  	vis.chart = vis.svg.append('g')
	  		.attr('width', vis.width)
	  		.attr('height', vis.height)
	  		.attr("font-family", vis.fontFamily) // might need to be moved to vis.svg but I think it is okay here
    		.attr("text-anchor", "middle")
	  		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

	  	vis.svg.append("rect")
	  		.attr('x', 2)
        	.attr('y', 135)
        	.attr('height', 200)
        	.attr('width', 90)
        	.attr('fill', 'white')
        	.attr('stroke', "black")
        	.attr('stroke-width', 1);

	  	vis.svg.append("text")
	  		.attr("x", 7)
			.attr("y", 150) 
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle")
	  		.text("Occurrences:");

	  	vis.svg.selectAll("legdots")
	    	.data([0.99, 4.99, 9.99, 24.99, 49.99, 99.99, 149.99, 199.99, 299.99, 499.99, 500])
	    	.enter()
	    	.append("circle")
	    		.attr("cx", 12)
	    		.attr("cy", function(d,i){return 170 + i*15})
	    		.attr("r", 5)
	    		.style("fill", function(d){ return vis.colors(d)});

		vis.svg.selectAll("leglabels")
			.data(["1", "2-5", "6-10", "11-25", "26-50", "51-100", "101-150", "151-200", "200-300", "300-500", "501+"])
			.enter()
			.append("text")
			    .attr("x", 22)
			    .attr("y", function(d,i){return 170 + i*15}) 
			    .style("fill", "black")
			    .text(function(d){ return d})
			    .attr("text-anchor", "left")
			    .style("alignment-baseline", "middle")
		
		let font_size = 12;
		// Title label
		vis.svg.append("g")
			.attr('transform', 'translate(' + (vis.width/2) + ', ' + (font_size + 4) + ')')
			.append('text')
			.attr('text-anchor', 'middle')
			.text(vis.config.title)
			// These can be replaced by style if necessary
			//.attr('font-family', 'sans-serif')
			.attr("font-weight", "bold")
			.attr('font-size', font_size + 4)

	  	vis.renderVis(vis.data); 
	}
	renderVis(data = null) {
		let vis = this;
		if (data == null) {
			vis.filtered_data = vis.data;
		} else {
			vis.filtered_data = data; //via input to function	
		}

		vis.filtered_data.forEach(d=> {
			vis.text += d.line + ' ';
		});

		vis.text = vis.text
    		.trim()
    		.split(/[\s.]+/g)
		    .map((w) => w.replace(/^[??????"\-???()[\]{}]+/g, ""))
		    .map((w) => w.replace(/[;:.!?()[\]{},"'??????\-???]+$/g, ""))
		    .map((w) => w.replace(/['???]s$/g, ""))
		    .map((w) => w.substring(0, 30))
		    .map((w) => w.toLowerCase())
		    .filter((w) => w && !vis.stopwords.has(w));

		vis.wordData = d3.rollups(vis.text, (group) => group.length, (w) => w)
		    .sort(([, a], [, b]) => d3.descending(a, b))
		    .slice(0, 250)
		    .map(([text, value]) => ({text, value }));

		console.log(vis.wordData);

		vis.fontScale = 70 / Math.sqrt(vis.wordData[0].value);

		vis.w_cloud = d3.layout.cloud()
		    .size([vis.width, vis.height])
		    .words(vis.wordData.map((d) => Object.create(d)))
		    .padding(vis.padding)
		    .rotate(vis.rotate)
		    .font(vis.fontFamily)
		    .fontSize((d) => Math.sqrt(d.value) * vis.fontScale)
		    .on("word", ({ size, x, y, rotate, text }) => {
		      vis.chart
		        .append("text")
		        .attr("class", "words")
		        .attr("font-size", size)
		        .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
		        .style("fill", function(d) { return vis.colors(Math.pow(size/vis.fontScale,2)); })
		        .text(text)
		        .on("click", handleClick);

		        function handleClick(d, i) {
		          var e = d3.select(this);
		          let selectedWord = `${e.text()}`;
		          let newData = null;
		          newData = vis.filtered_data.filter((element) => element.line.indexOf(selectedWord) !=-1? true: false);
		          console.log(selectedWord);
		          UpdateAllCharts(newData);
		        }
		    });
		vis.w_cloud.start();
	}
	updateVis(data) {
		let vis = this;

		vis.w_cloud.stop();
		vis.chart.selectAll('text').remove();
		vis.renderVis(data);
	}
}