class Wordmap {
	constructor(_config, _data) {
	    this.config = {
	      parentElement: _config.parentElement,
	      containerWidth: _config.containerWidth || 500,
	      containerHeight: _config.containerHeight || 140,
	      margin: { top: 15, bottom: 50, right: 10, left: 50 }
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
		vis.fontScale = 15;
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
	  		.attr("font-family", vis.fontFamily) // might need to move to vis.chart
    		.attr("text-anchor", "middle")
	  		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

	  	vis.updateVis();
	}
	updateVis() {
		let vis = this;


	}
}