d3.csv('data/transcript_data.csv')
    .then(data => {
        data.forEach(d => {
    	  d.episode = +d.episode; //make sure these are not strings
    	  d.scene_count = +d.scene_count; //make sure these are not strings
          d.line_count = +d.line_count; //make sure these are not strings
        });

        console.log(data);//ok, got my data!
        
        
    })
    .catch(error => console.error(error));
