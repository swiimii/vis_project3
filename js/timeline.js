// ES6 Class
class Timeline {

  constructor(_config, _data, _data_selection, _maxBars=12, _sortByValue=false, _legend) {
    this.config = {
      title: _config.title || "Missing Title",
      yLabel: _config.yLabel || "Missing Axis Label",
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 450,
      containerHeight: _config.containerHeight || 250,
      margin: { top: 20, bottom: 75, right: 50, left: 70 }
    }

    this.data = _data;
    this.filtered_data = this.data;
    this.data_selection = _data_selection;
    this.legend = _legend;
    this.sortByValue = _sortByValue;
    this.maxBars = _maxBars;

    if (typeof(BarChart.DisplayedCharts) != 'object') {
      BarChart.DisplayedCharts = Array(this);
    }
    else {
      BarChart.DisplayedCharts = BarChart.DisplayedCharts.concat(this);
    }

    // Call a class function
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.colors = ["#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale).ticks(6);

    // Define size of SVG drawing area
    vis.svg = d3.select(document.getElementById(vis.config.parentElement))
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'y-axis');

    // Y Axis label
    let font_size = 12;
    vis.svg.append("g")
      .attr('transform', 'translate(' + (font_size + 2) + ', ' + (vis.config.margin.top + vis.height/2) + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(vis.config.yLabel)
      // These can be replaced by style if necessary
      //.attr('font-family', 'sans-serif')
      .attr("font-weight", "bold")
      .attr('font-size', font_size)

    // X Axis label
    vis.svg.append("g")
      .attr('transform', 'translate(' + (vis.config.containerWidth/2) + ', ' + (vis.config.margin.bottom + vis.config.containerHeight/2) + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .text("Season + Episode")
      // These can be replaced by style if necessary
      //.attr('font-family', 'sans-serif')
      .attr("font-weight", "bold")
      .attr('font-size', font_size)

    // Title label
    vis.svg.append("g")
      .attr('transform', 'translate(' + (vis.config.margin.left + vis.width/2) + ', ' + (font_size + 2) + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .text(vis.config.title)
      // These can be replaced by style if necessary
      //.attr('font-family', 'sans-serif')
      .attr("font-weight", "bold")
      .attr('font-size', font_size + 4)
    
    vis.getColumnName = d => "Season " + d.season.substring(7) + ", Episode " + d.episode;

    vis.getColor = (d) => {
      let season = d.split(',')[0].substring(7);
      return vis.colors[season];
    };

    // Update the axes
    vis.xAxisG.call(vis.xAxis)
    .selectAll('text')
      .style('text-anchor','end')
      .style("font", "0px times")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-40)");;

    vis.data_selections = new Map();

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis(filteredData = null) {
    let vis = this;

    if (filteredData) {
      vis.filtered_data = filteredData;
    } else {
      vis.filtered_data = vis.data;
    }

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale).ticks(6);

    vis.data_map = d3.group(vis.filtered_data, vis.getColumnName );

    // If a number set to a month name
    (Array.from(vis.data_map.keys()).sort((a,b) => a.season - b.season != 0 ? a.season - b.season : a.episode - b.episode)).forEach((key) => {
      if (key != null) {
        let visualKey = key;
        if (`${key}` in Array.from(numberToMonth.keys())) {
          visualKey = numberToMonth.get(`${key}`);
        }
        vis.data_selections.set(visualKey, vis.data_map.get(key).length);
      }
    });

    (Array.from(vis.data_selections.keys()).forEach((key) => {
      if (!(vis.data_map.has(key))) {
        vis.data_selections.set(key, 0);
      }
    }));

    if (vis.sortByValue) {
      vis.data_selections = new Map([...vis.data_selections].sort((a,b) => b[1] - a[1]));
    }

    if (vis.maxBars && vis.maxBars > 0 && vis.data_selections.size > vis.maxBars) {
      const list = [...vis.data_selections.entries()];
      const firstHalf = list.slice(0,vis.maxBars);
      const secondHalf = list.slice(vis.maxBars);
      const otherTotal = d3.sum(secondHalf, d => d[1]);
      vis.data_selections = new Map(firstHalf);
      vis.data_selections.set("Other", otherTotal);
    }

    vis.xScale.domain(vis.data_selections.keys());
    vis.yScale.domain([0, d3.max(vis.data_selections.values())]).nice();
    
    ;

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll('rect').remove();

    vis.chart.selectAll('category').data(vis.data_selections.keys())
      .join('rect')
        .attr('x', d => vis.xScale(d))
        .attr('y', d => vis.yScale(vis.data_selections.get(d)))
        .attr('height', d => vis.height - vis.yScale(vis.data_selections.get(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('fill', d => vis.getColor(d))
        .on('mouseover', (event,d) => {
          console.log(d);
          d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + 10) + 'px')   
              .style('top', (event.pageY + 10) + 'px')
              .html(`<div class="tooltip">Count for ${d}: </div>
                  <li>${vis.data_selections.get(d)}</li>`);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        })
        .on('click', (_event, d) => {
          let filterSelection = Array.from(monthToNumber.keys()).includes(d) ? monthToNumber.get(d) : d;
          let newData = null;
          if (filterSelection == 'Other') {
            newData = vis.filtered_data.filter((element) => !(Array.from(vis.data_selections.keys()).includes(vis.getColumnName(element))));
          } else {
            newData = vis.filtered_data.filter((element) => vis.getColumnName(element) == filterSelection );
          }
          UpdateAllCharts(newData);
        });

    vis.yAxisG.transition().duration(1000).call(vis.yAxis);

  }
}

function UpdateBarCharts(filteredData) {
  BarChart.DisplayedCharts.forEach(chart => {
    chart.updateVis(filteredData);
  });
}