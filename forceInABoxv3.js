/* global d3 */

d3.layout.forceInABox = function () {
  "use strict";
  var force = d3.layout.force(),
    tree,
    foci = {},
    oldStart = force.start,
    oldLinkStrength = force.linkStrength(),
    oldGravity = force.gravity(),
    templateNodes = [],
    templateForce,
    templateNodesSel,
    groupBy = function (d) { return d.cluster; },
    template = "treemap",
    enableGrouping = true,
    gravityToFoci = 0.1,
    gravityOverall = 0.01,
    linkStrengthInterCluster = 0.05,
    showingTemplate = false;

  force.template = function (x) {
    if (!arguments.length) return template;
    template = x;
    return force;
  };

  force.groupBy = function (x) {
    if (!arguments.length) return groupBy;
    if (typeof x === "string") {
      groupBy = function (d) {return d[x]; };
      return force;
    }
    groupBy = x;
    return force;
  };

  var update = function () {
    if (enableGrouping) {
      force.gravity(gravityOverall);
    } else {
      force.gravity(oldGravity);
    }
  };

  force.enableGrouping = function (x) {
    if (!arguments.length) return enableGrouping;
    enableGrouping = x;
    update();
    return force;
  };

  force.gravityToFoci = function (x) {
    if (!arguments.length) return gravityToFoci;
    gravityToFoci = x;
    return force;
  };

  force.gravityOverall = function (x) {
    if (!arguments.length) return gravityOverall;
    gravityOverall = x;
    return force;
  };

  force.linkStrengthInterCluster = function (x) {
    if (!arguments.length) return linkStrengthInterCluster;
    linkStrengthInterCluster = x;
    return force;
  };


  force.linkStrength(function (e) {
    if (!enableGrouping || groupBy(e.source) === groupBy(e.target)) {
      if (typeof(oldLinkStrength)==="function") {
        return oldLinkStrength(e);
      } else {
        return oldLinkStrength;
      }
    } else {
      if (typeof(linkStrengthInterCluster)==="function") {
        return linkStrengthInterCluster(e);
      } else {
        return linkStrengthInterCluster;
      }
    }
  });


  function getLinkKey(l) {
    var sourceID = groupBy(l.source),
      targetID = groupBy(l.target);

    return sourceID <= targetID ?
      sourceID + "~" + targetID :
      targetID + "~" + sourceID;
  }

  function computeClustersNodeCounts(nodes) {
    var clustersCounts = d3.map();

    nodes.forEach(function (d) {
      if (!clustersCounts.has(groupBy(d))) {
        clustersCounts.set(groupBy(d), 0);
      }
    });

    nodes.forEach(function (d) {
      // if (!d.show) { return; }
      clustersCounts.set(groupBy(d), clustersCounts.get(groupBy(d)) + 1);
    });

    return clustersCounts;
  }

  //Returns
  function computeClustersLinkCounts(links) {
    var dClusterLinks =  d3.map(),
      clusterLinks = [];
    links.forEach(function (l) {
      var key = getLinkKey(l), count;
      if (dClusterLinks.has(key)) {
        count = dClusterLinks.get(key);
      } else {
        count = 0;
      }
      count += 1;
      dClusterLinks.set(key, count);
    });

    dClusterLinks.entries().forEach(function (d) {
      var source, target;
      source = d.key.split("~")[0];
      target = d.key.split("~")[1];
      clusterLinks.push({
        "source":source,
        "target":target,
        "count":d.value,
      });
    });
    return clusterLinks;
  }

  //Returns the metagraph of the clusters
  function getGroupsGraph() {
    var nodes = [],
      links = [],
      edges = [],
      dNodes = d3.map(),
      totalSize = 0,
      clustersList,
      c, i, size,
      clustersCounts,
      clustersLinks;

    clustersCounts = computeClustersNodeCounts(force.nodes());
    clustersLinks = computeClustersLinkCounts(force.links());

    //map.keys() is really slow, it's crucial to have it outside the loop
    clustersList = clustersCounts.keys();
    for (i = 0; i< clustersList.length ; i+=1) {
      c = clustersList[i];
      size = clustersCounts.get(c);
      nodes.push({id : c, size :size });
      dNodes.set(c, i);
      totalSize += size;
    }

    clustersLinks.forEach(function (l) {
      links.push({
        "source":dNodes.get(l.source),
        "target":dNodes.get(l.target),
        "count":l.count
      });
    });


    return {nodes: nodes, links: links};
  }


  function getGroupsTree() {
    var children = [],
      totalSize = 0,
      clustersList,
      c, i, size, clustersCounts;

    clustersCounts = computeClustersNodeCounts(force.nodes());

    //map.keys() is really slow, it's crucial to have it outside the loop
    clustersList = clustersCounts.keys();
    for (i = 0; i< clustersList.length ; i+=1) {
      c = clustersList[i];
      size = clustersCounts.get(c);
      children.push({id : c, size :size });
      totalSize += size;
    }
    return {id: "clustersTree", size: totalSize, children : children};
  }


  function getFocisFromTemplate() {
    //compute foci
    foci.none = {x : 0, y : 0};
    templateNodes.forEach(function (d) {
      if (template==="treemap") {
        foci[d.id] = {
          x : (d.x + d.dx / 2),
          y : (d.y + d.dy / 2)
        };
      } else {
        foci[d.id] = {x : d.x , y : d.y };

      }
    });
  }
  function recomputeWithTreemap() {
    var treemap = d3.layout.treemap()
      .size(force.size())
      .sort(function (p, q) { return d3.ascending(p.size, q.size); })
      .value(function (d) { return d.size; });

    tree = getGroupsTree();
    templateNodes = treemap.nodes(tree);

    getFocisFromTemplate();
  }

  function recomputeWithForce() {
    var net;

    templateForce = d3.layout.force()
      .size(force.size())
      .gravity(0.5)
      .charge(function (d) { return -100 * d.size; });

    net = getGroupsGraph();
    templateForce.nodes(net.nodes);
    templateForce.links(net.links);


    templateForce.start();
    templateNodes = templateForce.nodes();

    getFocisFromTemplate();
  }

  force.recompute = function () {
    if (template==="treemap") {
      recomputeWithTreemap();
    } else {
      recomputeWithForce();
    }
    // Draw the treemap
    return force;
  };

  function drawTreemap(container) {
    container.selectAll("cell").remove();
    container.selectAll("cell")
      .data(templateNodes)
      .enter().append("svg:rect")
      .attr("class", "cell")
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      .attr("width", function (d) { return d.dx; })
      .attr("height", function (d) { return d.dy; });

  }

  function drawGraph(container) {
    container.selectAll("cell").remove();
    templateNodesSel = container.selectAll("cell")
      .data(templateNodes);
    templateNodesSel
      .enter().append("svg:circle")
      .attr("class", "cell")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.size; });

  }

  force.drawTemplate = function (container) {
    showingTemplate = true;
    if (template === "treemap") {
      drawTreemap(container);
    } else {
      drawGraph(container);
    }
    return force;
  };





  //Backwards compatibility
  force.drawTreemap = force.drawTemplate;

  force.deleteTreemap = function (container) {
    showingTemplate = false;
    container.selectAll("rect.cell").remove();

    return force;
  };


  force.onTick = function (e) {
    if (!enableGrouping) {
      return force;
    }
    if (template==="force") {
      //Do the tick of the template force and get the new focis
      templateForce.tick();
      getFocisFromTemplate();
    }

    var k;
    k = force.gravityToFoci() * e.alpha;
    force.nodes().forEach(function (o) {
      if (!foci.hasOwnProperty(groupBy(o))) { return; }
      o.y += (foci[groupBy(o)].y - o.y) * k;
      o.x += (foci[groupBy(o)].x - o.x) * k;
    });

    if (showingTemplate && template === "force") {
      templateNodesSel
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return d.size; });
    }
    return force;
  };

  force.start = function () {
    update();

    if (enableGrouping) {
      force.recompute();
    }
    oldStart();
    return force;
  };

  return force;
};