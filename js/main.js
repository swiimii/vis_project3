let filteredData;

d3.csv('data/transcript_data.csv')
  .then(data => {
    data.forEach(d => {
      d.episode = +d.episode; //make sure these are not strings
      d.scene_count = +d.scene_count; //make sure these are not strings
      d.line_count = +d.line_count; //make sure these are not strings
    });

    console.log(data);//ok, got my data!
    
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
      
  })
  .catch(error => console.error(error));
    
  
  function UpdateAllCharts(data = null) {
    UpdateBarCharts(data);
    if (data == null) {
      data = allData
    }
  
  }

