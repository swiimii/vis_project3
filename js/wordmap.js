class Wordmap {
	constructor(_config, _data) {
	    this.config = {
	      parentElement: _config.parentElement,
	      containerWidth: _config.containerWidth || 500,
	      containerHeight: _config.containerHeight || 140,
	      margin: { top: 10, bottom: 10, right: 10, left: 10 }
	    }

	    this.data = _data;

	    // Call a class function
	    this.initVis();
	}

	initVis() {
		let vis = this;
		vis.stopwords = new Set(
		    "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(",")
		);

		vis.fontFamily = "sans-serif";
		vis.fontScale = 5;
		vis.padding = 0;
		vis.rotate = () => 0;

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

	  	vis.updateVis("candace", vis.data); 
	}
	updateVis(character, data) {
		let vis = this;

		vis.data = d3.group(data, d => d.speaker);
		console.log(vis.data);
		vis.characterData = vis.data.get(character);
		console.log(vis.characterData);

		vis.text = '';
		vis.characterData.forEach(d=> {
			vis.text += d.line + ' ';
		});

		console.log(vis.text);

		vis.text = vis.text
    		.trim()
    		.split(/[\s.]+/g)
		    .map((w) => w.replace(/^[“‘"\-—()[\]{}]+/g, ""))
		    .map((w) => w.replace(/[;:.!?()[\]{},"'’”\-—]+$/g, ""))
		    .map((w) => w.replace(/['’]s$/g, ""))
		    .map((w) => w.substring(0, 30))
		    .map((w) => w.toLowerCase())
		    .filter((w) => w && !vis.stopwords.has(w));
		console.log(vis.text)

		vis.wordData = d3.rollups(vis.text, (group) => group.length, (w) => w)
		    .sort(([, a], [, b]) => d3.descending(a, b))
		    .slice(0, 250)
		    .map(([text, value]) => ({text, value }));
		console.log(vis.wordData);

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
		        .attr("font-size", size)
		        .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
		        .text(text);
		    });
		vis.w_cloud.start();
	}
}