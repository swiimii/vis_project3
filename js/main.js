let seasonData;
let episodeData;
let allData;
let impChar = [];

d3.csv('data/transcript_data.csv')
  .then(data => {
    data.forEach(d => {
      d.episode = +d.episode; //make sure these are not strings
      d.scene_count = +d.scene_count; //make sure these are not strings
      d.line_count = +d.line_count; //make sure these are not strings
    });

    console.log(data);//ok, got my data!

    allData = data;
    
    const myBar1 = new BarChart({
      parentElement: 'bar1',
      title: 'Line Counts Per Speaker',
      yLabel: 'Number of Lines',
    }, data, "speaker", 12, true);

    wordmap = new Wordmap({
          'parentElement': '#wordmap',
          'containerHeight': 500,
          'containerWidth': 1200
        }, data);
    
    const timeline = new Timeline({
      parentElement: 'timeline',
      title: 'Lines Per Episode',
      yLabel: 'Number of Lines',
      containerWidth: 1200,
    }, data, "speaker", 300);
	
	GetImportantCharacters(data);
	chord = new Chord({
		'parentElement': '#chord',
		'containerHeight': 500,
		'containerWidth': 450
	}, data);
	

    linechart = new MultiLine({
      'parentElement': '#line',
      'containerHeight': 200,
      'containerWidth': 1650
    }, data);

  })
  .catch(error => console.error(error));
    
 
function UpdateAllCharts(data = null) {
  if (data == null) {
    data = allData
  }
  UpdateBarCharts(data);
  //chord.UpdateVis();
  wordmap.updateVis(data);
  linechart.updateVis(data);

}

function GetImportantCharacters(charData)
{
	impChar = [];
	count = 0;
	charGroup = d3.group(charData, d => d.speaker);
	seasonData = [];
	season = [];
	for(var m of charGroup)
	{
		count = 0;
		seasonStuff = d3.group(m[1], d => d.season);
		for (i of ["season_1", "season_2", "season_3", "season_4"])
		{
			season = seasonStuff.get(i);
			if(season != undefined)
			{
				count = count + Array.from(d3.group(season, d => d.episode).keys()).length;
			}
		}
		if (count > 5)
		{
			impChar.push(m[1][0].speaker);
		}
		
	}
	
	console.log(impChar);
	
}

function UpdateEpisodeList(episodes) {
  d3.select("#selectEpisode").selectAll('option').remove();

  var allEps = ["All Episodes"]
  if (episodes != null){
    episodes.forEach(d=>{
      allEps.push("Episode "+ d.toString());
    })
    
  }
  d3.select("#selectEpisode")
      .selectAll('myOptions')
      .data(allEps)
      .join('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; });
}

d3.select("#selectSeason").on("change", function(d) {
    var selectedSeason= d3.select(this).property("value");
    if (selectedSeason == "all") {
      seasonData = allData;
      UpdateEpisodeList(null);
    }
    else {
      seasonData = d3.group(allData, d => d.season);
      seasonData = seasonData.get(selectedSeason);
      console.log(seasonData);
      UpdateEpisodeList(Array.from(d3.group(seasonData, d => d.episode).keys()));
    }
    
	// GetImportantCharacters(seasonData);
	//chord.UpdateVis();
    UpdateAllCharts(seasonData);
  })

d3.select("#selectEpisode").on("change", function(d) {
    var selectedEpisode= d3.select(this).property("value");
    if (selectedEpisode == "All Episodes") {
      UpdateAllCharts(seasonData);
    }
    else {
      const episode_num = Number(selectedEpisode.replace(/\D/g, ''));
      episodeData = d3.group(seasonData, d => d.episode).get(episode_num);
      UpdateAllCharts(episodeData);
    }
    
  })

function get_episode_dist(data) {
  let grouped_data = d3.group(data, d => d.season, d => d.episode);

  data.forEach(d=> {
    episode_data = grouped_data.get(d.season).get(d.episode);
    d.line_perc = Math.round(d.line_count/episode_data[episode_data.length - 1].line_count*100);
  });
  
  let main_chars = ["doofenshmirtz", "stacy", "phineas", "baljeet", "candace", "ferb", "linda", "buford", "isabella", "major monogram", "jeremy"];
  data = data.filter(d => main_chars.includes(d.speaker));

  // SHOWS JUST NUMBER OF LINES FOR EACH CHARACTER

  let episode_dists_by_char = d3.rollup(data, v => v.length, d => d.speaker, d => d.line_perc);
  let arr = [];
  main_chars.forEach(d=> {
    if (episode_dists_by_char.has(d)) {
      Array.from(episode_dists_by_char.get(d).keys()).forEach(p => 
        arr.push({speaker: d, perc: p, value: episode_dists_by_char.get(d).get(p)})
      )
    }
  });
  //arr.sort((a, b) => (a.perc > b.perc) ? 1 : -1)

  // CONVERTS NUMBER OF LINES TO PERCENTAGE OF CHARACTER LINES

  // total_char_lines = d3.rollup(data, v => v.length, d => d.speaker);
  // console.log(total_char_lines);

  // episode_dists_by_char = d3.rollup(data, v => v.length, d => d.speaker, d => d.line_perc);
  // console.log(episode_dists_by_char);
  // let arr = [];
  // main_chars.forEach(d=> 
  //   Array.from(episode_dists_by_char.get(d).keys()).forEach(p => 
  //     arr.push({speaker: d, perc: p, value: episode_dists_by_char.get(d).get(p)/total_char_lines.get(d)})
  //   )
  // );
  // console.log(arr);
  // arr.sort((a, b) => (a.perc > b.perc) ? 1 : -1)
  return(arr);
}