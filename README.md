forceInABox.js
==============

A d3.js force extension that implements the Group-in-a-box layout algorithm to distribute nodes in a network according to their clusters. The algorithm uses a treemap to compute focis that are later used to distribute each cluster into it's own box.

To use it you need to include the library, and use the forceInABox instead of the normal d3.layout.force

```html
	<script type="text/javascript" src="forceInABox.js">   </script>
```
```js
	//create the force and specify the grouping parameter
	var force = d3.layout.forceInABox()
					.groupBy("group");

	//Add nodes and edges
	force.nodes(nodes)
		.edges(edges)
		.start();

	//Add the onTick method to the tick event
	force.on("tick", function(e) {
      force.onTick(e);
    };
```