let seasonData;
let episodeData;
let allData;

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
      yLabel: 'Number of Lines (rows of data)',
    }, data, "speaker", 12, true);

    wordmap = new Wordmap({
          'parentElement': '#wordmap',
          'containerHeight': 500,
          'containerWidth': 700
        }, data);
    
    const timeline = new Timeline({
      parentElement: 'timeline',
      title: 'Lines Per Episode',
      yLabel: 'Number of Lines (rows of data)',
      containerWidth: 1200,
    }, data, "speaker", 300);

    linechart = new MultiLine({
      'parentElement': '#line',
      'containerHeight': 200,
      'containerWidth': 950
    }, data);

    //get_episode_dist(data);
  })
  .catch(error => console.error(error));
    
  
function UpdateAllCharts(data = null) {
  if (data == null) {
    data = allData
  }
  UpdateBarCharts(data);
  wordmap.updateVis(data);

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
  // episode_lengths = d3.rollup(data, v => v.length, d => d.season, d => d.episode);
  // console.log(episode_lengths);

  grouped_data = d3.group(data, d => d.season, d => d.episode);
  grouped_data.forEach(d=>
    console.log(d)
    );
  console.log(grouped_data);
  

  data.forEach(d=> {
    episode_data = grouped_data.get(d.season).get(d.episode);
    d.line_perc = Math.round(d.line_count/episode_data[episode_data.length - 1].line_count*100);
  });
  //episode_scenes = d3.rollup(data, v => v.length, d => d.season, d => d.episode);

  console.log(data);
  let main_chars = ["ferb", "candace", "phineas", "doofenshmirtz"];
  data = data.filter(d => main_chars.includes(d.speaker));
  console.log(data);

  //console.log(d3.max(...data.map(item => item.line_count)));

  episode_dists_by_char = d3.rollup(data, v => v.length, d => d.speaker, d => d.line_perc);
  console.log(episode_dists_by_char);
  

  // console.log(episode_dists_by_char.get(main_chars[0]).keys());
  let arr = [];
  main_chars.forEach(d=> 
    Array.from(episode_dists_by_char.get(d).keys()).forEach(p => 
      arr.push({speaker: d, perc: p, value: episode_dists_by_char.get(d).get(p)})
    )
  );
  console.log(arr);

  //arr.forEach(d=> {
  arr.sort((a, b) => (a.perc > b.perc) ? 1 : -1)
  //});
  
  // data = d3.group(data, d => d.speaker);
  // console.log(data);
  // main_chars.forEach(d=> 

  // );
  return(arr);
}