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

