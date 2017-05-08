forceInABox.js
==============

Updated for d3.v4

A d3.js v4 force that implements the Group-in-a-box layout algorithm to distribute nodes in a network according to their clusters. The algorithm uses a treemap or a force diagram to compute focis that are later used to distribute each cluster into it's own box.

To use it just add the forceInABox as another force in your simulation and make sure your other forces don't overpower it

```html
	<!-- Include d3.v4 or forceSimulation -->
	<script type="text/javascript" src="forceInABox.js">   </script>
```
```js
		// Create the simulation with a small forceX and Y towards the center
		var force = d3.forceSimulation()
	    .force("charge", d3.forceManyBody())
	    .force("x", d3.forceX(width/2).strength(0.05))
	    .force("y", d3.forceY(height/2).strength(0.05));

 		simulation
      .nodes(graph.nodes)
      // Add the forceInABox force
      .force("group", forceInABox()
          .nodes(graph.nodes)
          .links(graph.links)
          .strength(0.1)
          .gravityOverall(0.05)
          .template(template)
          .groupBy("group")
          .size([width, height])
        )
			// Add a link force that only pulls together nodes that are in the same group
      .force("link", d3.forceLink(graph.links).distance(50).strength(
        function (l) { return l.source.group!==l.target.group ? 0 : 0.1;
      }))
```