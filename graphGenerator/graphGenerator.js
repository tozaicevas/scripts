const fs = require('fs');

const N_ARGUMENT_INDEX = 2;
const FIRST_LINE = "digraph randomDigraph {";
const LAST_LINE = "}";

const n = process.argv[N_ARGUMENT_INDEX] || 50;
const vertices = [...Array(parseInt(n)).keys()];
const levelMap = {};

const getEdge = (from, to) => `${from} -> ${to};`;
const edgeToString = (edge) => `\t${edge}`;
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
			const shuffledNonCyclicVertices = nonCyclicVertices.sort(() => Math.random() - 0.5);	
			const verticesForNewEdges = shuffledNonCyclicVertices.slice(0, randomEdgesCount);
			return verticesForNewEdges.map(vertice => getEdge(vertice, i));
		}).flat();
};

const getDotFormattedGraph = () => {
	const initialEdges = getInitialEdges(vertices);
	const moreEdges = getMoreEdges(vertices);
	const initialEdgesDotFormatted = `${edgesToString(initialEdges)}\n`;	
	const moreEdgesDotFormatted = edgesToString(moreEdges);
	const fullGraph = `${initialEdgesDotFormatted}${moreEdgesDotFormatted}`;
	return `${FIRST_LINE}\n${fullGraph}\n${LAST_LINE}`;
}

const graph = getDotFormattedGraph();

fs.writeFile("graph.dot", graph, (err) => {
	if (err)
		return console.log(err);
	
	console.log(`Graph with ${n} vertixes has been successfully saved to graph.dot`);
});
