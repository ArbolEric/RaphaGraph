<a href="https://raphagraph.arbol.org/documentation.html" target="_blank">View Documentation</a>.

Example initialization:

`` var rg = new RaphaGraph({
		container:'container',
		type:'pie',
		variables:'concentric',
		additive:true,
		h:425,
		aData:[
			[
				[.36,.12],
				[.28,.10]
			],[
				[.41, .08],
				[.23, .05]
			],[
				[.84, .23],
				[.52, .25]
			]
		],
		names:{group:['Indian', 'Pacific', 'Atlantic'], cat:['Northern Hemisphere', 'Southern Hemisphere'], var:['0-700m', '700-2000m']},
		title:'Thermostatic Component of Sea Level Change',
		subtitle:'by Ocean, Hemisphere, and Ocean Depth',
		units:'mm/year'
	});``
	
View <a href="https://raphagraph.arbol.org/examples/concentric additive pies.html" target="_blank">result here</a>.