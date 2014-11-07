netClustering.js
================

netClustering allows you to detect clusters in networks using the Clauset, Newman and Moore community detection algorithm directly from the browser, as simple as:

```js
netClustering.cluster(nodes, edges);
```

and the clusters will be stored in the .cluster attribute of the nodes.

The code is based on an implementation created by Robin W. Spencer for his site [scaledinnovation.com](http://scaledinnovation.com/analytics/communities/communities.html), I wrapped it up on a container so it could be reused as a library

