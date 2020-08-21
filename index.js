// get the value on the action of radio button
$(document).ready(function(){
  $('#data-selector').change(function(){
    var newDataType = $("input[name='dataradio']:checked").val();
    updateData(newDataType);
  });

// set initial value
const w = 1000;
const h = 600;
const padding = 1;
const Datasets = {
  videos:{
    Title: "Video Game Sales",
    Description: "Top 100 Most Sold Video Games Grouped by Platform",
    Path: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"    
  },
  movies:{
    Title: "Movie Sales",
    Description: "Top 100 Highest Grossing Movies Grouped By Genre",
    Path: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"     
},
  kickstarters:{
    Title: "Kickstarter Pledges",
    Description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    Path: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"     
  }
}

function updateData(type) {
  $('svg').remove();
  
  if (type == "movies" || type == "videos" || type == "kickstarters") {
    var currenttype = type
  }
  var Data = Datasets[currenttype]
  document.getElementById("title").innerHTML = Data.Title;  //put tilt to html
  document.getElementById("description").innerHTML = Data.Description;
  
  d3.queue()
    .defer(d3.json, Data.Path)
    .await(ready)
}

function ready(error, dataset) {  

  root = d3.hierarchy(dataset)     //changed to hierarchy data
           .sum(function(d) { return d.value; })  // sum data
           .sort(function(a , b) { return b.height - a.height || b.value - a.value; }); // sorted for treemap
  
// to filter the duplicate dates  
  var categories = root.leaves().map(function(d){
    return d.data.category
  })    
  categories = categories.filter(function(category, index, self){
    return self.indexOf(category)===index; //https://www.sejuku.net/blog/21887#filter-3   
  })
    
  var treemap = d3.treemap()
                  .size([w, h])
                  .padding(padding)  
  treemap(root); //change to data for treemap
  
  var svg = d3.select("#treemap") //selected id in html
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .selectAll("rect")
            .data(root.leaves())  // array data which is the edge datas of root
            .enter()
            .append("g")
            .attr("class", "")
            .attr("transform", function(d) { return "translate(" + d.x0 + "," + (d.y0) + ")"; });
  
  var colorScale = d3.scaleOrdinal(d3.schemeCategory20)  // random color data
  
  svg.append("rect")
   .style("width", function(d) { return d.x1 - d.x0; })
   .style("height", function(d) { return d.y1 - d.y0; })
   .style("fill", (d) => colorScale(d.data.category))
   .attr("class", "tile")
   .attr("data-name", (d) => d.data.name)
   .attr("data-category", (d) => d.data.category)
   .attr("data-value", (d) => d.data.value)
   .on("mouseover", function(d) {
    d3.select(".js_toolTip")
      .html("Name:" + d.data.name + "<br>" + "Category:" + d.data.category + "<br>" + "Value:" + d.data.value)
      .style("top", (d3.event.pageY + 10) + "px")
      .style("left", (d3.event.pageX + 10) + "px")    
      .style("display", "inline-block")
      .attr("id", "tooltip")
      .attr("data-value", d.data.value)
  })
   .on("mouseout", function() {
    d3.select(".js_toolTip")
      .style("display", "none")    
  })
  
  svg.append("text")
     .attr("font-size", "60%")
     .selectAll("tspan")
     .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))  // split datas
     .enter()
     .append('tspan') // change the row of the datas as there is no function of text of D3
          .attr('dy', '1.3em')
          .attr('x', 4)
          .text(d => d)
  
  const legend = d3.select(".legends")
                   .append('svg')
                   .attr("id", "legend")
                   .attr("width", 1000)
                   .attr("height", 150)
                   .selectAll('rect')
                   .data(categories)  // use the no duplicated data
                   .enter()
                   .append("g")       
                   .attr("transform", function(d, i) { return "translate(" + (100 * (i%3) + 300) + "," + (20*Math.floor(i/3) + 20) + ")"; })   // for 3 rows
  
  legend.append('rect')
        .attr("width", 10)
	      .attr("height", 10)
        .attr("class", "legend-item")
        .attr("fill", (d) =>colorScale(d))
  
  legend.append('text')
        .text((d) => d)
        .style("font-size", 10)    
        .attr('y', 20 * 0.5)
        .attr('x', 20)

}
  updateData("videos");      // call the default treemap
})