const fs = require('fs');

const VERTICES_ARGUMENT_INDEX = 2;
const MAX_EDGES_ARGUMENT_INDEX = 3;
const FIRST_LINE = "digraph randomDigraph {";
const LAST_LINE = "}";

const n = process.argv[VERTICES_ARGUMENT_INDEX] || 50;
const maxEdges = process.argv[MAX_EDGES_ARGUMENT_INDEX] || 5;
const vertices = [...Array(parseInt(n)).keys()];
const levelMap = {};

const getEdge = (from, to) => `${from} -> ${to}`;
const edgeToString = (edge) => `\t${edge};`;
const edgesToString = (edges) => edges.map(edge => edgeToString(edge)).join('\n');

const getInitialEdges = (vertices) => {
	levelMap[0] = 0;
	return vertices
		.filter(i => i > 0)
		.map(i => {
			const randomVertice = Math.floor(Math.random() * i);	
			levelMap[i] = levelMap[randomVertice] + 1;
			return getEdge(randomVertice, i);
		});
}

const getMoreEdges = (vertices) => {
	return vertices
		.map(i => {
			const nonCyclicVertices = vertices
				.filter(j => levelMap[j] <= levelMap[i] && i != j);	
			const randomEdgesCount = Math.floor(Math.random() * nonCyclicVertices.length);	
			const minimizedRandomEdgesCount = Math.min(randomEdgesCount, maxEdges);
			const shuffledNonCyclicVertices = nonCyclicVertices.sort(() => Math.random() - 0.5);	
			const verticesForNewEdges = shuffledNonCyclicVertices.slice(0, minimizedRandomEdgesCount);
			return verticesForNewEdges.map(vertice => getEdge(vertice, i));
		}).flat();
};

const addWeights = edges => {
	return edges.map(edge => {
		const weight = Math.floor(Math.random() * 100) + 1;
		return `${edge} [label="${weight}"]`;
	});
};

const getDotFormattedGraph = () => {
	const initialEdges = getInitialEdges(vertices);
	const moreEdges = getMoreEdges(vertices);
	const allEdges = [...initialEdges, ...moreEdges];
	const allEdgesWithWeights = addWeights(allEdges);
	const fullGraph = edgesToString(allEdgesWithWeights);
	return `${FIRST_LINE}\n${fullGraph}\n${LAST_LINE}`;
}

const graph = getDotFormattedGraph();

fs.writeFile("graph.dot", graph, (err) => {
	if (err)
		return console.log(err);
	
	console.log(`Graph with ${n} vertixes has been successfully saved to graph.dot`);
});
