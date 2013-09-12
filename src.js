/*
 * Utilities
 */
// object-based string formatting
String.prototype.format = function(valHash) {
  return this.replace(/{{([^{}]+)}}/g, function(match, key) { 
	return typeof valHash[key] != 'undefined' ? valHash[key] : 'N/A' ;
  });
};

// make current mouse position query-able
var currentMousePos = { x: -1, y: -1 };
$(document).on('mousemove', function(e) {
	currentMousePos.x = e.pageX //- $(document).scrollLeft();
	currentMousePos.y = e.pageY //- $(document).scrollTop();
});
currentMousePos.offset = function(id){
	return {
		x: this.x - $('#'+id).offset().left,
		y: this.y - $('#'+id).offset().top
	}
}

 
function fnLighten(rgb, p){
	var m = rgb.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/),
		R1 = m[1],
		G1 = m[2],
		B1 = m[3],
		R2 = (1-p)*R1 + p*255,
		G2 = (1-p)*G1 + p*255,
		B2 = (1-p)*B1 + p*255;
	return 'rgb('+R2+','+G2+','+B2+')'
}

function Doll(x, y, w, h) {
	var x0 = x - w/2,
		y0 = y,
		r = Math.min(w/10, h),
		x1 = x0 + r,
		x2 = x0 + w - r,
		x3 = x0 + w,
		y1 = y0 - h + r,
		y2 = y0 - h;
	return 'M'+x0+' '+y0+'L'+x0+' '+y1+'Q'+x0+' '+y2+' '+x1+' '+y2+'L'+x2+' '+y2+'Q'+x3+' '+y2+' '+x3+' '+y1+'L'+x3+' '+y0+'L'+x0+' '+y0+'Z';
}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

function getIntervals(min, max, plotH, maxInt) {
	var aRounds = [2, 2.5, 5, 10],
		nMin = 2,
		nMax = 10, n;
	min = Math.min(min, 0);
	var RANGE = max - min;
	for (var i=nMax; i>=nMin; i--){
		if (plotH/i > maxInt){
			n = i;
			break;
		}
	}
	if (n) { // draw axes
		var x = Math.floor(log10(RANGE)) - 1,
			optInterval;
		while (!optInterval) {
			for (var i=0; i<aRounds.length; i++){
				var yLabels = Math.ceil(RANGE/(aRounds[i]*Math.pow(10, x)));
				if (yLabels <= n) {
					optInterval = aRounds[i]*Math.pow(10,x);
					var aLabels = [],
						sign = min < 0 ? -1 : 1,
						start = Math.ceil(Math.abs(min)/optInterval)*optInterval*sign,
						end = Math.ceil(max/optInterval)*optInterval;
					if (end == max) { end += optInterval; }
					for (var j=start; j<=end; j+=optInterval) {
						aLabels.push(j);
					}
					var oGrid = {
							labels: aLabels, 
							range: aLabels[aLabels.length-1] - aLabels[0],
							'value-interval': optInterval,
							min: aLabels[0], 
							max:aLabels[aLabels.length-1]
						};
					oGrid.scale = plotH/oGrid.range;
					oGrid['pixel-interval'] = optInterval*oGrid.scale;
					return oGrid
				}
			}
			x++;
		}
	}
	return false
}

function formatNo(val){
	while (/(\d+)(\d{3})/.test(val.toString())){
	  val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}

function fnBlank(){}

function fnErase(){
	this.rData.remove();
}

// Flexible Iteration Function
function fnIter(o){
	var oG = this, //graph object
		cont = true;
	if (o.a[0] instanceof Array){
		for (var i=0; i<o.a.length; i++){
			var name = oG.o.names[o.scope][i];
			cont = o.fn1(o.a[i], i, name);
			if (cont === false) { break }
		}
	} else if (o.a[0] instanceof Object) {
		for (var i=0; i<o.a.length; i++){
			var name = o.a[i].name || oG.o.names[o.scope][i];
			if (o.a[i].value) {
				cont = o.fn2(o.a[i].value, i, name);
			} else {
				cont = o.fn1(o.a[i].data, i, name);
			}
			if (cont === false) { break }
		} 
	} else if (typeof(o.a[0]) == 'number'){
		for (var i=0; i<o.a.length; i++){
			var name = oG.o.names[o.scope][i];
			cont = o.fn2(o.a[i], i, name);
			if (cont === false) { break }
		}
	}
}

function fnDonut(x, y, innerRadius, outerRadius) {
  y -= outerRadius;
  return 'M'+x+' '+y+'a'+outerRadius+' '+outerRadius+' 0 1 0 1 0m-1 '+(outerRadius - innerRadius)+'a'+innerRadius+' '+innerRadius+' 0 1 1 -1 0';
};

// Create text box
function fnBox(o){
	o.boxAttr = $.extend({
		opacity:1,
		fill:'#FFFFFF',
		'stroke-width':5,
		stroke:'#000'
	}, o.boxAttr);
	o.textAttr = $.extend({
		'font-size':14
	}, o.textAttr);
	var _div = document.createElement('div'),
		maxWidth = 0,
		height = 0,
		width = 0;
	_div.innerHTML = o.s;
	this.paper.setStart();
	var aNodes = _div.childNodes;
	for (var i=0; i<aNodes.length; i++){
		var oTextAttr = $.extend({}, o.textAttr);
		if (aNodes[i].tagName == 'I') {
			oTextAttr['font-style'] = 'italic';
		} else if (aNodes[i].tagName == 'B') {
			oTextAttr['font-weight'] = 'bold';
		}
		var aText = aNodes[i].textContent.split('\n');
		for (var j=0; j<aText.length; j++){
			var rText = this.paper.text(0, 0, aText[j]).attr(oTextAttr),
				BBox = rText.getBBox();
			if (j>0){ width = 0; }
			if (i == 0 && j == 0 || j > 0){ 
				height += BBox.height + 3;
			}
			//if (!text) { text = ' '; }
			rText.attr({
				x:width + BBox.width/2,
				y:height - BBox.height/2
			});
			width += BBox.width;
			maxWidth = Math.max(width, maxWidth);
		}
	}
	/*
	 *  Properly place Pop up
	 */
	var oBBox = this.getBBox(),
		scale = 1;
	if (!o.x) {
		o.x = oBBox.x + oBBox.width/2;
	}
	if (!o.y){
		o.y = oBBox.y + oBBox.height/2;
	}
	if (maxWidth+20 > this.paper.width){
		scale = this.paper.width/maxWidth+20;
		o.x = this.paper.width/2;
	} else {
		if (o.x - (maxWidth+20)/2 < 0){
			o.x += (maxWidth+20)/2 - o.x;
		} else if (o.x + (maxWidth+20)/2 > this.paper.width){
			o.x -= (maxWidth+20)/2 + o.x - this.paper.width;
		}		
	}
	if (height+20 > this.paper.height){
		scale = this.paper.height/height+20;
		o.y = this.paper.height/2;
	} else {
		if (o.y - (height+20)/2 < 0){
			o.y += (height+20)/2 - o.y;
		} else if (o.y + (height+20)/2 > this.paper.height){
			o.y -= (height+20)/2 + o.y - this.paper.height;
		}
	}
	var rText = this.paper.setFinish(),
		rBox = this.paper.rect(o.x-10, o.y-9, maxWidth+20, height+20, 4).attr(o.boxAttr);
	rText.transform('t'+o.x+','+o.y+'s'+scale).toFront();
	rText.push(rBox);
	rText.container = rBox;
	return rText
}

function fnHoverIn(){
	var self = this,
		oG = self.paper.oG;
	if (!self.mouseIn){
		self.mouseIn = true;
		oG.rBoxes.items.forEach(function(rBox){ rBox.fnOut(); });
		self.attr({stroke:'white', 'stroke-width':'2'});
		self.toFront();
		var s = self.data('cat') ? '<b>'+self.data('cat')+' ' : '<b>';
		s += self.data('var')+':</b>\n'+self.data('val');
		
		self.rBox = fnBox.call(self, {
			boxAttr:({stroke:self.data('color'), 'stroke-width':2}),
			s: s
		})
		self.fnOut = function(){
			if (self.mouseIn){
				self.mouseIn = false;
				self.attr({stroke:'black', 'stroke-width':'1'});
				self.toBack();
				var aBacks = self.data('aBacks');
				for (var i=0; i<aBacks.length; i++){
					self.paper.getById(aBacks[i]).toBack();
				}
				oG.rPlot.toBack();
				self.rBox.remove();
				oG.rBoxes.exclude(self);
			}
		}
		self.rBox.container.hover(
			fnBlank, 
			function(e) {
				setTimeout(function(){
					var oPos = currentMousePos.offset(self.paper.canvas.parentElement.id);
					if (!self.isPointInside(oPos.x, oPos.y) &&
					!self.rBox.container.isPointInside(oPos.x, oPos.y)){
						self.fnOut();
					}
				}, 500);
			}
		);
		oG.rBoxes.push(self);
	}
}
function fnHoverOut(e){
	var self = this,
		oG = self.paper.oG;
	if (this.mouseIn){
		setTimeout(function(){
			var oPos = currentMousePos.offset(self.paper.canvas.parentElement.id);
			if (!self.isPointInside(oPos.x, oPos.y) && !self.rBox.container.isPointInside(oPos.x, oPos.y)){
				self.fnOut();
			}
		}, 500);
	}
}

//
function fnFilter(oExcludes){
	var oG = this;
	//console.log(oG);
	oG.rBoxes.items.forEach(function(rBox){ rBox.fnOut(); });	
	oG.o.animate = false;
	oG.rData.remove();
	$.extend(oG.oExcludes, oExcludes || {});
	oG.fnTotal();
	oG.plot();
	return oG
};

/*
 * Create Legend
 */
function fnLegend(o){
	var oG = this,
		maxW = .8*oG.o.w,
		legendX = oG.o.w/2,
		legendY = 0,
		legendYo = legendY,
		lines = 1,
		labelSpace = 5,
		markerH = 12,
		markerW = 12,
		markerSpace = 10,
		maxLineW = 0,
		oGroup = oG.o.aData[0],
		lineW = 0,
		paper = oG.o.paper || oG.paper,
		rLine = paper.set(),
		rLegend = paper.set().hide(),
		lines = 0;
	if (!o.fnClick){
		o.fnClick = function(){
			var text = this.data('text');
			if (this.data('on')) {
				this.data('on', false);
				this.attr({fill:'#BDBDBD'});
				if (oG.oExcludes[o.scope].indexOf(text) < 0) {
					oG.oExcludes[o.scope].push(text);
				}
				console.log(oG.oExcludes);
				oG.filter();
			} else {
				this.data('on', true);
				this.attr({fill:this.data('color')});
				oG.oExcludes[o.scope].splice(oG.oExcludes[o.scope].indexOf(text), 1);
				oG.filter();
			}
		}
	}
	
	function fnLegendItem(text, color){
		var rMarker = paper.rect(legendX, legendY, markerH, markerW, 3),
			rLabel = paper.text(legendX, legendY, text).attr({'font-size':oG.o['legend-font']}),
			labelW = rLabel.getBBox().width,
			setW = markerSpace + markerW + labelSpace + labelW;
		rMarker.attr({color:color, 'stroke-width':0});
		if (lineW + setW >= maxW) {
			rLegend.push(rLine);
			rline = paper.set();
			legendY += oG.o['legend-font']/2 + 8;
			lineW = 0;
			lines++;
		}
		var lineTransform = -setW/2,
			markerX = legendX + lineW/2 + markerSpace - setW/2,
			labelX = markerX + markerW/2 + markerSpace + labelW/2,
			rItem = paper.set();
		rLabel.attr({x:labelX, cursor:'pointer'});
		rMarker.attr({x:markerX, y:legendY-markerH/2, fill:color, cursor:'pointer'});
		rLabel.id = Raphael.createUUID();
		rMarker.id = Raphael.createUUID();
		rLabel.data('rMarker', rMarker.id);
		rMarker.data('on', true);
		rMarker.data('color', color);
		rMarker.data('text', text);
		rMarker.click(o.fnClick);
		rLabel.click(function(){
			o.fnClick.call(paper.getById(this.data('rMarker')));
		})
		
		rItem.push(rLabel);
		rItem.push(rMarker);
		
		rLine.transform('...t'+lineTransform+',0');
		rLine.push(rItem);
		lineW += setW - markerSpace;
		maxLineW = lineW > maxLineW ? lineW : maxLineW;
	}
	// Iterate at color-scope to display legend
	oG.fnIter({a:o.aData, scope:o.scope, 
		fn2:function(aData, i, name, color, data){
			if (!color) { color = oG.o.oColors[name] || oG.o.aColors[i] }
			if (oG.o.gradient == o.scope) { color = fnLighten(color, 1-Math.pow(.8, i)) }
			fnLegendItem(name, color);
		}, 
		fn1:function(aData, i, name){
			var color = oG.o.oColors[name] || oG.o.aColors[i];
			if (oG.o.gradient == o.scope) { color = fnLighten(color, 1-Math.pow(.8, i)) }
			fnLegendItem(name, color);
		}
	});
	rLegend.push(rLine);
	var rLegendBox = paper.rect(
		legendX - (maxLineW+40)/2 - labelSpace, 
		(legendYo+lines*(oG.o['legend-font']/2 + 4) - (lines+1)*(oG.o['legend-font'] + 8)/2),
		maxLineW + 40 + labelSpace, 
		(lines+1)*(oG.o['legend-font'] + 8), 
		5
	);
	rLegend.push(rLegendBox);
	oG.legendHeight = (lines+1)*oG.o['legend-font'] + 8;
	rLegend.transform('...t0 '+(oG.o.h - oG.legendHeight/2 - 5)).show();
}

/*
 * Execute Animation Array
 */
function fnAnimate(o){
	var oG = this;
	setTimeout(function(){
		var rAnimation = Raphael.animation({path:o.aAnimation[0].path}, oG.o.animationLength, o.easing || 'elastic'),
			elem = o.aAnimation[0].elem;
		console.log('aAnimation', o.aAnimation);
		for (var i=1; i<o.aAnimation.length; i++){
			o.aAnimation[i].elem.animateWith(rAnimation, elem, {path:o.aAnimation[i].path}, oG.o.animationLength, o.easing || 'elastic');
		}
		elem.animate(rAnimation);
	}, o.delay);
}
	
/*
 * Russian Doll Graphing Object
 */

window.RussianDoll = function(o){
	var rd = this;
	this.o = $.extend({
		'x-label-font': 18,
		'x-label-padding-x': 3,
		'x-label-padding-y': 3,
		'x-label-padding-top': 3,
		'x-label-padding-bottom': 3,
		'y-label-font': 18,
		'y-label-padding-left': 8,
		'y-label-padding-right': 10,
		legend: true,
		'legend-font': 18,
		'legend-padding-x': 3,
		'legend-padding-y': 3,
		'legend-padding-top': 3,
		'legend-padding-bottom': 3,
		'x-axis-font': 14,
		'x-axis-label-rotate':0,
		'y-axis-font': 14,
		'x-axis-padding': 15,
		'y-axis-padding': 15,
		'font-family': '"Trebuchet MS", Helvetica, sans-serif',
		'title-font': 18,
		'title-padding-top': 3,
		'title-padding-bottom': 7,
		'subtitle-font': 14,
		'subtitle-padding-top': 3,
		'subtitle-padding-bottom': 10,
		animate: true,
		animationLength: 1000,
		frames: false,
		interval: 4000, // between frames
		'x-axis-label-scope':'group', // 'cat', 'group'
		gradient: 'var', // 'group', 'cat', 'var', false
		'color-scope': 'cat', // 'group', 'cat', 'var'
		oColors: false,
		aColors:[
			'rgb(255,189,35)',
			'rgb(61,147,33)',
			'rgb(0,128,166)',
			'rgb(120,64,176)',
			'rgb(236,48,48)',
			'rgb(6,28,124)'
		],
		groupPadding:10,
		catPadding:5,
		fnHoverIn: fnHoverIn,
		fnHoverOut: fnHoverOut	,
		fnClick: function(){
			var state = this.data('state');
			if (state == 'on'){
				this.data('state', 'off');
			} else {
				this.data('state', 'on');
			}
		}
	}, o);
	// Clear Container of Contents
	$('#'+this.o.container).html('');
	rd.paper = Raphael(rd.o.container, rd.o.w, rd.o.h);
	rd.paper.oG = rd;
	rd.rBoxes = rd.paper.set();
	
	rd.oExcludes = {group:[], cat:[], var:[]}
	
	rd.fnTotal();
	
	// Display frame datasets in intervals
	if (rd.o.frames) {
		rd.o.frames.fnPre = rd.o.frames.fnPre ? rd.o.frames.fnPre : fnBlank;
		rd.o.frames.fnPost = rd.o.frames.fnPost ? rd.o.frames.fnPost : fnBlank;
		rd.o.aData = rd.o.frames.aData[0].aData || rd.o.frames.aData[0];
		rd.drawPlot();
		rd.plot();
		
		var frame = 1,
			motion = true;
		function goToFrame(){
			//console.log('MOTION', motion);
			if (!motion) { return }
			rd.rBoxes.items.forEach(function(rBox){ console.log('rBox', rBox); rBox.fnOut(); });	
			rd.o.frames.fnPre.call(frame);
			rd.erase();
			rd.o.aData = rd.o.frames.aData[frame];
			if (frame == rd.o.frames.aData.length - 1){
				frame = 0;
			} else { frame++; }
			rd.plot();
			rd.o.frames.fnPost.call(rd.o.frames.aData[frame]);
			motion = true;
		}
		var SI = setInterval(goToFrame, rd.o.frames.interval);
		rd.pause = function(idx){
			if (parseInt(idx) >= 0) { motion=true;frame = idx;goToFrame(); }
			motion = false;
		}
		rd.resume = function(){
			motion = true;
		}
	//  Draw	
	} else {
		rd.drawPlot();
		rd.plot();
	}
	return rd
}

RussianDoll.prototype.fnTotal = function(){
	var rd = this;
	function getMinMax(aData){
		var min = 0, max = 0;
		function compare(val){
			max = Math.max(max, val);
			min = Math.min(min, val);
		}
		rd.fnIter({a:aData, scope:'group', fn2:compare, fn1:function(a2, i){
			rd.fnIter({a:a2, scope:'cat', fn2:compare, fn1:function(a3, j){
				rd.fnIter({a:a3, scope:'var', fn1:fnBlank, fn2:compare});
			}});
		}});
		return [min, max];
	}
	rd.min = 0; rd.max = 0;
	if (rd.o.frames){
		rd.fnIter({a:rd.o.frames.aData, scope:'frame', fn1:function(a, i, name){
			var aMinMax = getMinMax(a);
			rd.min = Math.min(aMinMax[0], rd.min);
			rd.max = Math.max(aMinMax[1], rd.max);
		}});
	} else {
		var aMinMax = getMinMax(rd.o.aData);
		rd.min = aMinMax[0];
		rd.max = aMinMax[1];
	}
}

RussianDoll.prototype.drawPlot = function(){
	var rd = this,
		paper = rd.paper;
	
	/*
	 * X Axis Labels
	 */
	var axLabels = [],
		labelScope,
		aData;
	rd.o.xLabelHeight = 0;
	if (rd.o['x-axis-label-scope'] == 'cat'){
		aData = rd.o.aData[0].data || rd.o.aData[0];
		labelScope = 'cat'
	} else if (rd.o['x-axis-label-scope'] == 'group'){
		aData = rd.o.aData;
		labelScope = 'group';
	}
	console.log(aData);
	rd.fnIter({scope:labelScope, a:aData,
		fn1:function(aVars, i, name){
			var rText = paper.text(10, 10, name).transform('r-'+rd.o['x-axis-label-rotate']).attr({fill:'white'});
			rd.o.xLabelHeight = Math.max(rText.getBBox().height, rd.o.xLabelHeight);
			axLabels.push(rText);
		},
		fn2:function(val, i, name, color, data){
			var rText = paper.text(10, 10, name).transform('r-'+rd.o['x-axis-label-rotate']).attr({fill:'white'});
			rd.o.xLabelHeight = Math.max(rText.getBBox().height, rd.o.xLabelHeight);
			axLabels.push(rText);
		}
	});
	rd.axLabels = axLabels;
	
	// Create legend if desired
	rd.legendHeight = 0; 
	if (rd.o.legend){
		var aCats = rd.o.aData[0].data || rd.o.aData[0],
			aVars = aCats[0].data || aCats[0],
			aData = rd.o['color-scope'] == 'group' ? 
				rd.o.aData : rd.o['color-scope'] == 'cat' ? 
				aCats : aVars;
		rd.fnLegend({
			scope:rd.o['color-scope'],
			aData: aData
		});
	}
	/*
	 * Calculate Plot Vertical Dimensions
	 */
	var plotY = rd.o['title-padding-top']+rd.o['title-padding-bottom']+rd.o['title-font'],
		plotH = rd.o.h - (plotY + rd.o['x-label-padding-top']+rd.o['x-label-padding-bottom']+rd.o.xLabelHeight+rd.o['x-axis-padding']+rd.o['legend-padding-top']+rd.o['legend-padding-bottom']+rd.legendHeight) - 20;
	console.log(rd.o['title-padding-top'], rd.o['title-padding-bottom'], rd.o['title-font']);
	/*
	 * Title and Sub-Title
	 */	 
	// Title
	var n = (rd.o.title.match(/\n/g) ? rd.o.title.match(/\n/g).length : 0) + 1,
		oTitle = {
			center: rd.o.w/2,
			middle: rd.o['title-padding-top'] + rd.o['title-font']*n/2,
			submiddle:  rd.o['title-padding-top'] + rd.o['title-padding-bottom'] + rd.o['title-font'] + rd.o['subtitle-padding-top'] + rd.o['subtitle-font']*n/2,
		},
		rTitle = paper.text(oTitle.center, oTitle.middle, rd.o.title).attr({'font-size':rd.o['title-font'], fill:'white'});
	console.log('TITLE', plotH);
	// Sub-title
	if (rd.o.subtitle) {
		rSubtitle = paper.text(oTitle.center, oTitle.submiddle, rd.o.subtitle).attr({'font-size':rd.o['subtitle-font'], fill:'white'});
		var subH = rd.o['subtitle-padding-top']+rd.o['subtitle-padding-bottom']+rd.o['subtitle-font'];
		plotY += subH;
		plotH -= subH;
	} 
	console.log('SUBTITLE', plotH);
	
	/*
	 * Y Axis Labels
	 */
	paper.setStart();
	var oGrid = getIntervals(rd.min, rd.max, plotH, rd.o['y-axis-font']+10), 
		y = 0,
		aAnimations = [],
		ayLabels = [];
	rd.o.yLabelWidth = 0;
	for (var i=0; i<oGrid.labels.length; i++){
		var rText = paper.text(rd.o.w/2, rd.o.h/2, formatNo(oGrid.labels[i])).attr({'font-size':rd.o['x-axis-font'], fill:'white'});
		//var rText = paper.text(500, 350, 'shit', paper.getFont('Museo'), 14)
		rd.o.yLabelWidth = Math.max(rText.getBBox().width, rd.o.yLabelWidth);
		ayLabels.push(rText);
	}
	console.log('width', rd.o.yLabelWidth);
	
	/*
	 * Calculate Plot Horizontal Dimensions
	 */
	var	plotX = rd.o['y-label-padding-left']+rd.o['y-label-padding-right']+rd.o['y-label-font']+rd.o['y-axis-padding'] + rd.o.yLabelWidth,
		plotW = rd.o.w - plotX - 20;
	
	// x-Axis Label
	var rXLabel = paper.text(
		rd.o.w/2, 
		plotY + plotH + rd.o['x-axis-padding'] + rd.o['x-axis-font'],
		rd.o['x-label']
	).attr({'font-size':rd.o['x-label-font'], fill:'white'});
	
	/*
	 * Display Y-Axis Labels
	 */
	for (var i=0; i<ayLabels.length; i++){
		var rLabel = ayLabels[i].show(),
			y = plotY + plotH - i*oGrid['pixel-interval'],
			rGrid = paper.path('M'+plotX+' '+y+'L'+(plotX+plotW)+' '+y+'Z');
		rLabel.attr({x:plotX-rLabel.getBBox().width/2-2, y:y, fill:'white'});
		if (oGrid.labels[i] == 0) {
			rGrid.attr({'stroke-width':2, stroke:'white'});
			console.log('X AXIS', y, i)
		} else {
			rGrid.attr({'stroke-dasharray':'. ', 'stroke-width':1, stroke:'white'});
		}
	};
	// Y-Axis Label
	var yn = (rd.o['y-label'].match(/\n/g) ? rd.o['y-label'].match(/\n/g).length : 0)+1,
		rYLabel = paper.text(
			rd.o['y-label-padding-left']+rd.o['y-label-font']*yn/2, 
			plotX + plotH/2,
			rd.o['y-label']
		).transform('r-90').attr({'font-size':rd.o['y-label-font'], fill:'white'});
	
	/*
	 *  Cache References
	 */
	this.rPlot = paper.setFinish();
	this.paper = paper;
	this.plotX = plotX;
	this.plotY = plotY;
	this.plotH = plotH;
	this.plotW = plotW;
	this.oGrid = oGrid;
	this.y0 = y;
	return rd;
}	

/*
 * Plot Data
 */

RussianDoll.prototype.plot = function(){
	var paper = this.paper,
		rd = this;
	rd.o.groupW = rd.plotW/(rd.o.aData.length - rd.oExcludes.group.length);
	var groupInnerW = rd.o.groupW - 2*rd.o.groupPadding,
		plotX = this.plotX,
		x = plotX + rd.o.groupW/2,
		scale = this.oGrid.scale,
		y0 = rd.plotY + rd.plotH,
		aAnimations = [],
		axLabels = rd.axLabels;
	paper.setStart();
	
	/*
	 * Display x-Axis Labels
	 */
	
	var yXAxisLabels = rd.plotY + rd.plotH + rd.o['x-label-padding-top'] + rd.o.xLabelHeight/2,
		xX = plotX + rd.o.groupW/2,
		groupI = 0;
	rd.fnIter({a:rd.o.aData, scope:'group',
		fn1:function(aCats, i, name){
			if (rd.oExcludes.group.indexOf(name) < 0){
				var groupX = xX + rd.o.groupW*groupI;
				if (rd.o['x-axis-rotate']){ groupX -= axLabels[i].getBBox().width/2; }
				if (rd.o['x-axis-label-scope'] == 'group'){
					axLabels[i].attr({x:groupX, y:yXAxisLabels, 'font-size':rd.o['x-axis-font']}).show();
				} else {
					var len = aCats.length - rd.oExcludes.cat.length,
						catW = (rd.o.groupInnerW - rd.o.catPadding)/len,
						catI = 0;
					rd.fnIter({a:aCats, scope:'group',
						fn1:function(aVars, j, sCat){
							if (rd.oExcludes.cat.indexOf(sCat) < 0){
								var catX = groupX + (2*catI+1-len)/2*catW;
								axLabels[i].attr({x:catX, y:yXAxisLabels, 'font-size':rd.o['x-axis-font']}).show();
								catI++;
							}
						},
						fn2:function(val, j, name, color, data){
							if (rd.oExcludes.cat.indexOf(sCat) < 0){
								var catX = groupX + (2*catI+1-len)/2*catW;
								axLabels[i].attr({x:catX, y:yXAxisLabels, 'font-size':rd.o['x-axis-font']}).show();
								catI++;
							}
						}
					});
				}
				groupI++;
			}
		},
		fn2:function(val, i, name, color, data){
			if (rd.oExcludes.group.indexOf(name) < 0){
				var groupX = xX+rd.o.groupW*groupI;
				if (rd.o['x-axis-rotate']){ groupX -= axLabels[i].getBBox().width/2; }
				if (rd.o['x-axis-label-scope'] == 'group'){
					axLabels[i].attr({x:groupX, y:yXAxisLabels, 'font-size':rd.o['x-axis-font']}).show();
				} 
				groupI++;
			}
		}
	});
	
	// draw doll for given piece of data
	function draw(o){
		var color;
		if (o.color){ color = o.color; }
		else {
			if (rd.o.oColors) {
				color = rd.o.oColors[o.data[rd.o['color-scope']]];
			} else {
				color = rd.o.aColors[o.colorIdx];
			}
			if (rd.o.gradient == o.scope){
				color = fnLighten(color, 1-Math.pow(.8, o.i));
			}
		}
		var varH = o.val*scale,
			rDoll;
		if (!rd.o.animate){
			rDoll = paper.path(Doll(o.x, y0, o.varW, varH));
		} else {
			rDoll = paper.path('M'+o.x+' '+y0+'Z');
			var idx = o.scope == 'var' ? o.i : 0;
			aAnimations[idx].push({
				elem:rDoll,
				path:Doll(o.x, y0, o.varW, varH)
			});
		}
		rDoll.id = Raphael.createUUID();
		// Assign data for each doll
		for (var sAttr in o.data){
			rDoll.data(sAttr, o.data[sAttr]);
		}
		rDoll.data('color', color);
		rDoll.attr({
			fill: color,
			stroke: 'rgb(0,0,0)',
			'stroke-width': '1'
		}).hover(rd.o.fnHoverIn, rd.o.fnHoverOut).click(rd.o.fnClick);
		return rDoll;
	}
	
	// Iterate through data and plot as necessary
	var aBacks,
		groupI = 0;
	rd.fnIter({a:rd.o.aData, scope:'group',
		fn1:function(aCats, i, sGroup){
			if (rd.oExcludes.group.indexOf(sGroup) < 0) {
				var groupX = plotX + rd.o.groupW/2 + rd.o.groupW*groupI;
					len = aCats.length - rd.oExcludes.cat.length,
					catW = (groupInnerW - rd.o.catPadding)/len,
					catInnerW = catW - 2*rd.o.catPadding,
					catI = 0;
				aBacks = [];
				rd.fnIter({a:aCats, scope:'cat', 
					fn1:function(aVars, j, sCat){
						if (rd.oExcludes.cat.indexOf(sCat) < 0) {
							x = groupX + (2*catI+1-len)/2*catW;
							aBacks = [];
							rd.fnIter({a:aVars, scope:'var', 
								fn2:function(val, k, sVar, color, data){
									if (rd.oExcludes.var.indexOf(sVar) < 0) {
										var o = {x:x, val:val, i:k, name:sVar, color:color, data:data||{}, varW:catInnerW*Math.pow(.75, k), scope:'var'};
										o.data.group = sGroup;
										o.data.cat = sCat;
										o.data.var = sVar;
										o.data.val = val;
										o.data.aBacks = aBacks.slice(0).reverse();
										if (j==0 && i==0) { aAnimations.push([]); }
										var colorIdx = rd.o['color-scope'] == 'group' ? 
											i : rd.o['color-scope'] == 'cat' ? 
											j : rd.o['color-scope'] == 'var' ?
											k : 0;
										o.colorIdx = colorIdx;
										var rPiece = draw(o);
										aBacks.push(rPiece.id);
									}
								}, 
								fn1:fnBlank
							});
							catI++;
						}
					},
					fn2:function(val, j, sCat, color, data){
						if (rd.oExcludes.cat.indexOf(sCat) < 0) {
							var o = {val:val, i:j, name:name, color:color, data:data, varW:catW, scope:'cat', data:{}}, 
								colorIdx = rd.o['color-scope'] == 'group' ? 
								i : rd.o['color-scope'] == 'cat' ? 
								j : 0;
							o.data.group = sGroup;
							o.data.cat = sCat;
							o.data.val = val;
							o.data.aBacks = aBacks.slice(0).reverse();
							o.colorIdx = colorIdx;
							var rPiece = draw(o);
							aBacks.push(rPiece.id);
						}
					}
				});
				groupI++;
			}
		},
		fn2:function(val, i, sGroup, color, data){
			if (rd.oExcludes.group.indexOf(sGroup) <= 0) {
				var o = {val:val, i:i, name:name, color:color, data:data, varW:groupInnerW, scope:'group'},
					colorIdx = rd.o['color-scope'] == 'group' ? i : 0;
				o.colorIdx = colorIdx;
				o.data.group = sGroup;
				o.data.val = val;
				o.data.aBacks = aBacks.slice(0);
				var rPiece = draw(o);
				aBacks.push(rPiece.id);
			}
		}
	});
	if (rd.o.animate){
		console.log('aAnimations', aAnimations);
		for (var i=0; i<aAnimations.length; i++){
			rd.animate({
				aAnimation: aAnimations[i],
				delay: i*rd.o.animationLength,
				easing:'<>'
			});
		}
	}
	this.rData = paper.setFinish();
}

RussianDoll.prototype.erase = function(){
	this.rData.remove();
}

RussianDoll.prototype.fnIter = fnIter;

RussianDoll.prototype.filter = fnFilter;

RussianDoll.prototype.fnLegend = fnLegend;

RussianDoll.prototype.animate = fnAnimate;

/** 
  *  Nightengale Pie Charts
  Add extra dimesions to your pie charts.
  */

/*
 *  Nightengale Object
 */
Nightengale = function(o){
	var N = this;
	this.o = $.extend({
		w: 600,
		h: 400,
		dy:0,// shift coordinates up or down
		dx:0,// shift coordinates left or right
		container:'container',
		'title-font': 18,
		'title-padding-top': 3,
		'title-padding-bottom': 7,
		'subtitle-font': 14,
		'subtitle-padding-top': 3,
		'subtitle-padding-bottom': 10,
		title:false,
		subtitle:'TOTAL',
		'text-attr':{
			'font-family': '"Trebuchet MS", Helvetica, sans-serif',
			'font-size':14
		},
		units: '',
		'title-attr':{'font-size':16},
		'subtitle-attr':{},
		'data-attr':{},
		'crust-attr':{},
		'wedge-attr':{},
		'legend-font': 18,
		'legend-padding-x': 3,
		'legend-padding-y': 3,
		'legend-padding-top': 3,
		'legend-padding-bottom': 3,
		legend: true,
		fnHoverIn: fnHoverIn,
		fnHoverOut: fnHoverOut,
		fnClick: function(){
			var state = this.data('state');
			if (state == 'on'){
				this.data('state', 'off');
			} else {
				this.data('state', 'on');
			}
		},
		additive: false, // if set to true, will calculate category totals; if set to false, first var is used as category total.
		animate: true,
		animationLength: 2500,
		frames: false,
		interval: 4000, // between frames
		gradient: 'var', // 'cat', 'var', false
		opacity:false, // 'cat', 'var', false
		'color-scope': 'cat', // 'cat', 'var'
		oColors: false,
		aColors:[
			'rgb(255,189,35)',
			'rgb(61,147,33)',
			'rgb(0,128,166)',
			'rgb(120,64,176)',
			'rgb(236,48,48)',
			'rgb(6,28,124)'
		],
		aNightengales: false
	}, o);
	N.titleAttr = $.extend(N.o['text-attr'], N.o['title-attr']);
	N.subtitleAttr = $.extend(N.o['text-attr'], N.o['subtitle-attr']);
	N.crustAttr = $.extend(N.o['data-attr'], N.o['crust-attr']);
	N.wedgeAttr = $.extend(N.o['data-attr'], N.o['wedge-attr']);
	
	N.oExcludes = {cat:[], var:[]}
	
	if (!o.aNightengales) {
		// Display frame datasets in intervals
		N.fnTotal().drawPlot();
		N.plot();
	}
	return N;
}

Nightengale.prototype.fnTotal = function(){
	var N = this;
	
	// Get Largest Total
	if (!N.TOTAL) { N.maxRatio = 1; }
	function check(){
		if (N.o.additive) {
			// calculate total
			N.fnIter({a:N.o.aData, scope:'cat',
				fn1:function(aVars, i, sCat){
					if (N.oExcludes.cat.indexOf(sCat) < 0){
						var catTotal = 0;
						N.fnIter({a:aVars, scope:'var',
							fn1:fnBlank,
							fn2:function(val, i, sVar, color, data){
								if (N.oExcludes.var.indexOf(sVar) < 0){
									N.total += val;
									catTotal += val;
								}
							}
						});
						N.catTotals.push(catTotal);
					} else { N.catTotals.push(0); }
				},
				fn2:function(val, i, sCat, color, data){
					if (N.oExcludes.cat.indexOf(sCat) < 0){
						N.total += val;
						N.catTotals.push(val);
					} else { N.catTotals.push(0); }
				}
			});
		} else {
			// calculate total
			N.fnIter({a:N.o.aData, scope:'cat',
				fn1:function(aVars, i, sCat){
					if (N.oExcludes.cat.indexOf(sCat) < 0) {
						N.fnIter({a:aVars, scope:'var',
							fn1:fnBlank,
							fn2:function(val, j, sVar, color, data){
								if (j == 0) {
									N.total += val;
									N.catTotals.push(val);
								} else if (!N.TOTAL) {
									var maxRatio = val/N.catTotals[i];
									if (!isNaN(maxRatio) && maxRatio !== Infinity){
										N.maxRatio = Math.max(N.maxRatio, maxRatio);
									}
								}
							}
						});
					} else { N.catTotals.push(0); }
				},
				fn2:function(val, i, sCat, color, data){
					if (N.oExcludes.cat.indexOf(sCat) == 0) { val = 0; }
					N.total += val;
					N.catTotals.push(val);
				}
			});	
		}
	}
	// Get totals
	N.total = 0;
	N.catTotals = [];
	check();
	if (!N.TOTAL) { N.TOTAL = N.total; } // total without filters applied
	return N
}
	
Nightengale.prototype.drawPlot = function(){
	var N = this;
	//  Get Paper Width and Height
	if (!N.o.paper){
		// Clear Container of Contents
		$('#'+N.o.container).html('');
		N.o.paper = Raphael(N.o.container, N.o.w, N.o.h);
	}
	N.o.paper.oG = N;
	N.o.w = N.o.w || N.o.paper.width;
	N.o.h = N.o.h || N.o.paper.height;
	N.rBoxes = N.o.paper.set();
	N.o.paper.setStart();
	
	// Create legend if desired
	N.legendHeight = 0; 
	if (N.o.legend){
		var aData = N.o['color-scope'] == 'cat' ? 
			N.o.aData : 
			N.o.aData[0].data || N.o.aData[0];
		N.fnLegend({
			scope:N.o['color-scope'],
			aData: aData
		});
	}
	
	// Get dimensions for Graph Area
	N.plotH = N.o.h;
	var offset = N.o.dy || 0;
	if (N.o.title){
		N.o.paper.text(
			N.o.dx + N.o.w/2, 
			offset + N.o['title-padding-top'] + N.o['title-font']/2, 
			N.o.title
		).attr(N.titleAttr);
		N.plotH -= (N.o['title-padding-top']+N.o['title-padding-bottom']+N.o['title-font']);
	}
	if (N.o.subtitle){
		var y = N.o.h - N.plotH  + offset + N.o['subtitle-padding-top'] + N.o['subtitle-font']/2;
		if (N.o.subtitle === 'TOTAL'){
			N.o.subtitle = N.TOTAL.toString().replace(/0{3,}\d{1}$/, '');
		}
		N.o.paper.text(
			N.o.dx + N.o.w/2, 
			y, 
			N.o.subtitle + ' ' + N.o.units
		).attr(N.subtitleAttr);
		N.plotH -= N.o['subtitle-padding-top'] + N.o['subtitle-font'] + N.o['subtitle-padding-bottom'];
	}
	N.plotH -= N.legendHeight;
	N.maxR = Math.min(N.plotH/2-5, N.o.w/2);

	// Get Center of Graph Area
	if (!N.o.cx) { N.o.cx = N.o.dx + N.o.w/2; }
	if (!N.o.cy) { N.o.cy = N.o.h - N.maxR + N.o.dy - (N.legendHeight+10); }
	
	if (!N.scale) { 
		N.scale = Math.pow(N.maxR, 2)*Math.PI/(N.total*N.maxRatio);
	}
	
	N.R = N.R || N.maxR/Math.sqrt(N.maxRatio);
	if (!N.rPlot && !N.o.aNightengales && !N.o.additive){
		N.rPlot = N.o.paper.circle(N.o.cx, N.o.cy, N.R).attr({'stroke-dasharray':'- '});
	}
	N.rLabels = N.o.paper.setFinish();
	return N
}

Nightengale.prototype.plot = function(){
	var N = this,
		startAngle = 0,
		params = {},
		aAnimation = [];
	//console.log('PLOTTING', N.o.title);
	//console.log('aData', N.o.aData);
	
	N.arCats = [];
	N.o.paper.setStart();
	N.fnIter({a:N.o.aData, scope:'cat',
		fn1:function(aVars, i, sCat){
			if (N.oExcludes.cat.indexOf(sCat) < 0){
				var delta = N.catTotals[i]/N.total*360,
					r0 = 0,
					aBacks = [],
					rCat = N.o.paper.set(),
					rMax = 0;
				//console.log(sCat, 'aVars', aVars)
				N.fnIter({a:aVars, scope:'var',
					fn1:fnBlank,
					fn2:function(val, j, sVar, color, data){
						if (N.oExcludes.var.indexOf(sVar) < 0){
							if (N.o.oColors) {
								color = N.o['color-scope'] == 'cat' ? 
									N.o.oColors[sCat]: N.o.oColors[sVar];
							} else {
								var colorIdx = N.o['color-scope'] == 'cat' ? 
									i : N.o['color-scope'] == 'var' ? 
									j : 0;
								color = N.o.aColors[colorIdx];
							}
							if (N.o.gradient == 'var'){
								color = fnLighten(color, 1-Math.pow(.8, j));
							}
							if (N.o.opacity == 'var') {
								params['fill-opacity'] = Math.pow(.8, j);
							}
							params.fill = color;
							var rPiece,
								r = Math.sqrt(N.scale*val*360/delta/Math.PI + Math.pow(r0, 2))
							if (N.o.additive) {
								if (j == 0){
									rPiece = N.wedge(N.o.cx, N.o.cy, r, startAngle, startAngle+delta, params);
								} else {
									rPiece = N.crust(N.o.cx, N.o.cy, r0, r, startAngle, startAngle+delta, params);
								}
								r0 += r - r0;
								rMax = Math.max(rMax, r0);
							} else {
								var r = Math.sqrt(N.scale*val*360/delta/Math.PI);
								rPiece = N.wedge(N.o.cx, N.o.cy, r, startAngle, startAngle+delta, params);
							}
							if (N.o.animate){
								aAnimation.push({
									elem: rPiece,
									path: rPiece.data('path')
								});
							}
							rPiece.id = Raphael.createUUID();
							rCat.push(rPiece);
							rPiece.data('color', params.fill);
							rPiece.data('val', val);
							rPiece.data('var', sVar);
							rPiece.data('cat', sCat);
							rPiece.data('group', N.o.names.group || N.o.title);
							rPiece.data('aBacks', aBacks.slice(0));
							aBacks.unshift(rPiece.id);
						}
					}
				});
				N.arCats.push(rCat);
				startAngle += delta;
			}
		},
		fn2:function(val, i, sVar, color, data){
			if (N.oExcludes.var.indexOf(sVar) < 0){
				if (N.o.oColors) {
					color = N.o['color-scope'] == 'var' ? 
						N.o.oColors[sVar] : N.o.aColors[i];
				} else {
					var colorIdx = N.o['color-scope'] == 'cat' ? 
						i : 0;
					color = N.o.aColors[colorIdx];
				}
				if (N.o.gradient == 'cat'){
					color = fnLighten(color, 1-Math.pow(.8, i));
				}
				if (N.o.opacity == 'cat') {
					params['fill-opacity'] = Math.pow(.8, i);
				}
				params.fill = color;
				var delta = N.catTotals[i]/N.total*360,
					rCat = N.wedge(N.o.cx, N.o.cy, N.R, startAngle, startAngle+delta, params);
				rCat.data('color', params.fill);
				rCat.data('var', sVar);
				N.arCats.push(rCat);
				startAngle += delta;
			}
		}
	});
	N.rData = N.o.paper.setFinish();
	if (N.o.animate){
		N.animate({
			delay:0,
			aAnimation:aAnimation
		});
	}
	return N
}

Nightengale.prototype.wedge = function(cx, cy, r, startAngle, endAngle, params) {
	var N = this,
		rad = Math.PI / 180,
		x1 = cx + r * Math.sin(startAngle * rad),
		x2 = cx + r * Math.sin(endAngle * rad),
		y1 = cy - r * Math.cos(startAngle * rad),
		y2 = cy - r * Math.cos(endAngle * rad),
		sPath, path;
		params.cursor = 'pointer';
	if (endAngle - startAngle == 360) {
		sPath = 'M {{cx}}, {{cy}} m -{{r}}, 0 a {{r}},{{r}} 0 1,0 {{2r}},0 a {{r}},{{r}} 0 1,0 -{{2r}},0'.format({cx:cx, cy:cy, r:r, '2r':2*r});
	} else {
		var large;
		if (endAngle - startAngle < 180) { large = 0; }
		else { large = 1; }
		sPath = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, large, 1, x2, y2, "Z"];
	}
	if (N.o.animate){
		path = N.o.paper.path('M'+cx+' '+cy+'Z');
		path.data('path', sPath);
	} else {
		path = N.o.paper.path(sPath);
	}
	path.attr(params).hover(N.o.fnHoverIn, N.o.fnHoverOut).click(N.o.fnClick);
	return path
}
Nightengale.prototype.crust = function(cx, cy, r, R, startAngle, endAngle, params) {
	var N = this,
		rad = Math.PI / 180,
		dr = R - r,
		x1 = cx + r * Math.sin(startAngle * rad),
		x2 = x1 + dr * Math.sin(startAngle * rad),
		x3 = cx + r * Math.sin(endAngle * rad),
		x4 = x3 + dr * Math.sin(endAngle * rad),
		y1 = cy - r * Math.cos(startAngle * rad),
		y2 = y1 - dr * Math.cos(startAngle * rad),
		y3 = cy - r * Math.cos(endAngle * rad),
		y4 = y3 - dr * Math.cos(endAngle * rad),
		large, sPath, path;
	params.cursor = 'pointer';
	if (endAngle - startAngle < 180) { large = 0 }
	else { large = 1 }
	if (endAngle - startAngle == 360) {
		sPath = fnDonut(cx, cy, r, R);
	} else {
		sPath = ["M", x1,y1, "L", x2,y2, "A", R, R, 0, large, 1, x4,y4, "L", x3,y3, "A", r, r, 0, large, 0, x1,y1, "Z" ];
	}
	if (N.o.animate){
		path = N.o.paper.path('M'+cx+' '+cy+'Z');
		path.data('path', sPath);
	} else {
		path = N.o.paper.path(sPath);
	}
	path.attr(params).hover(N.o.fnHoverIn, N.o.fnHoverOut).click(N.o.fnClick);
	return path
}

Nightengale.prototype.filter = fnFilter;

Nightengale.prototype.fnIter = fnIter;

Nightengale.prototype.fnLegend = fnLegend;

Nightengale.prototype.animate = fnAnimate;

Nightengale.prototype.erase = fnErase;
Nightengale.prototype.hide = function(){
	this.rData.hide();
	this.rPlot.hide();
	this.rLabels.hide();
};

aNightengales = function(o){
	var aN = this;
	this.o = $.extend({
		w: 600,
		h: 400,
		container:'container',
		'title-font': 18,
		'title-padding-top': 3,
		'title-padding-bottom': 7,
		'subtitle-font': 14,
		'subtitle-padding-top': 3,
		'subtitle-padding-bottom': 10,
		title:false,
		subtitle:false,
		'text-attr':{
			'font-family': '"Trebuchet MS", Helvetica, sans-serif',
			'font-size':14
		},
		'title-attr':{'font-size':16},
		'subtitle-attr':{},
		'data-attr':{},
		'crust-attr':{},
		'wedge-attr':{},
		'legend-font': 18,
		'legend-padding-x': 3,
		'legend-padding-y': 3,
		'legend-padding-top': 3,
		'legend-padding-bottom': 3,
		legend: true,
		additive: false, // if set to true, will calculate category totals; if set to false, first var is used as category total.
		animate: true,
		animationLength: 2500,
		frames: false,
		interval: 4000, // between frames
		gradient: 'var', // 'cat', 'var', false
		opacity:false, // 'cat', 'var', false
		'color-scope': 'cat', // 'cat', 'var'
		oColors: false,
		aColors:[
			'rgb(255,189,35)',
			'rgb(61,147,33)',
			'rgb(0,128,166)',
			'rgb(120,64,176)',
			'rgb(236,48,48)',
			'rgb(6,28,124)'
		]
	}, o);
	aN.titleAttr = $.extend(aN.o['text-attr'], aN.o['title-attr']);
	aN.subtitleAttr = $.extend(aN.o['text-attr'], aN.o['subtitle-attr']);
	aN.crustAttr = $.extend(aN.o['data-attr'], aN.o['crust-attr']);
	aN.wedgeAttr = $.extend(aN.o['data-attr'], aN.o['wedge-attr']);
	console.log('TITLE ATTR', aN.titleAttr);
	
	console.log('aData', aN.o.aData);
	
	// Array to Store All Nightengale Objects
	aN.a = [];
	
	// Object to store filtered categories
	aN.oExcludes = {cat:[], var:[]};
	
	//  Get Paper Width and Height
	if (!aN.o.paper){
		// Clear Container of Contents
		$('#'+aN.o.container).html('');
		aN.o.paper = Raphael(aN.o.container, aN.o.w, aN.o.h);
	} else {
		aN.o.w = aN.o.paper.width;
		aN.o.h = aN.o.paper.height;
	}
	aN.rBoxes = aN.o.paper.set();
	
	// Create legend if desired
	if (aN.o.frames) { 
		aN.o.aData = aN.o.frames.aData[0];
		aN.o.animate = false;
	}
	if (aN.o.legend){
		var aCats = aN.o.aData[0].data || aN.o.aData[0],
			aVars = aCats[0].data || aCats[0],
			aData = aN.o['color-scope'] == 'group' ? 
				aN.o.aData : aN.o['color-scope'] == 'cat' ? 
				aCats : aVars;
		aN.fnLegend({
			scope:aN.o['color-scope'],
			aData: aData
		});
	} else { aN.legendHeight = 0; }
	
	// Get dimensions for Graph Area
	aN.plotH = aN.o.h;
	var deltaTitle = 0;
	if (aN.o.title){
		aN.o.paper.text(aN.o.w/2, aN.o['title-padding-top']+aN.o['title-font']/2, aN.o.title).attr(aN.titleAttr);
		var delta = (aN.o['title-padding-top']+aN.o['title-padding-bottom']+aN.o['title-font']);
		deltaTitle += delta;
		aN.plotH -= delta;
	}
	if (aN.o.subtitle){
		var y = aN.o.h - aN.plotH + aN.o['subtitle-padding-top'] + aN.o['subtitle-font']/2,
			delta = aN.o['subtitle-padding-top'] + aN.o['subtitle-font'] + aN.o['subtitle-padding-bottom'];
		aN.o.paper.text(aN.o.w/2, y, aN.o.subtitle).attr(aN.subtitleAttr);
		deltaTitle += delta;
		aN.plotH -= delta;
	}
	aN.plotH -= aN.legendHeight;

	// Get dimensions for each Nightengale
	var len = aN.o.aData.length,
		s = Math.sqrt(aN.plotH*aN.o.w/len),
		maxCol = Math.floor(aN.o.w/s),
		maxRow = Math.floor(aN.plotH/s),
		nTotal = maxRow*maxCol;
	while (nTotal < len){
		s--;
		maxCol = Math.floor(aN.o.w/s);
		maxRow = Math.floor(aN.plotH/s);
		nTotal = maxRow*maxCol;
	}
	var rowGap = (aN.plotH - maxRow*s)/(maxRow + 1);
	
	aN.maxTotal = 0;
	aN.maxR = Infinity;
	aN.R = 0;
	if (aN.o.frames){
		aN.o.frames.a = [];
		for (var i=0; i<aN.o.frames.aData.length; i++){
			aN.o.aData = aN.o.frames.aData[i];
			nRow = 0;
			aN.o.frames.a.push(setFrame());
		}
		console.log('calculating scale from ', aN.maxR, aN.maxTotal);
		aN.scale = Math.PI*Math.pow(aN.maxR, 2)/aN.maxTotal;
		aN.o.paper.oG = aN;
		aN.o.frames.fnPre = aN.o.frames.fnPre ? aN.o.frames.fnPre : fnBlank;
		aN.o.frames.fnPost = aN.o.frames.fnPost ? aN.o.frames.fnPost : fnBlank;
		aN.a = aN.o.frames.a[0];
		for (var i=0; i<aN.o.frames.a.length; i++){
			aN.o.frames.a[i].forEach(function(N){
				aN.R = Math.max(aN.R, Math.sqrt(N.TOTAL*aN.scale/Math.PI));
			});
		}
		aN.rPlot = aN.o.paper.set();
		for (var i=0; i<aN.o.frames.a.length; i++){
			drawFrame(aN.o.frames.a[i]);
			aN.o.frames.a[i].forEach(function(N){
				aN.rPlot.push(N.rPlot);
			});
		}
		var frame = 1,
			motion = true;
		function goToFrame(){
			if (!motion) { return }
			aN.o.frames.fnPre.call(frame);
			aN.erase();
			aN.a = aN.o.frames.a[frame];
			if (frame == aN.o.frames.a.length - 1){
				frame = 0;
			} else { frame++; }
			for (var i=0; i<aN.a.length; i++){
				aN.a[i].scale = aN.scale;
				aN.a[i].maxR = aN.maxR;
				aN.a[i].R = aN.R;
				aN.a[i].rPlot = aN.o.paper.circle(aN.a[i].o.cx, aN.a[i].o.cy, aN.R).attr({'stroke-dasharray':'- '});
				aN.a[i].rLabels.show();
				aN.a[i].plot();
			}
			aN.o.frames.fnPost.call(aN.o.frames.aData[frame]);
			motion = true;
		}
		showFrame();
		var SI = setInterval(goToFrame, aN.o.frames.interval);
		aN.pause = function(idx){
			if (parseInt(idx) >= 0) { motion=true;frame = idx;goToFrame(); }
			motion = false;
		}	
	} else {
		aN.a = setFrame();
		aN.o.paper.oG = aN;
		aN.scale = Math.PI*Math.pow(aN.maxR, 2)/aN.maxTotal;
		for (var i=0; i<aN.a.length; i++){
			console.log('Nightengale title', aN.a[i].o.title);
			aN.R = Math.max(aN.R, Math.sqrt(aN.a[i].TOTAL*aN.scale/Math.PI));
		}
		drawFrame(aN.a);
		aN.rPlot = aN.o.paper.set();
		aN.a.forEach(function(N){
			aN.rPlot.push(N.rPlot);
		});
		showFrame();
	}
	function setFrame(){
		var a = [],
			nCol = 0,
			nRow = 0;
		function createN(aCats, i, sGroup, color, data){
			var colGap;
			if (nRow+1 == maxRow){
				colGap = (aN.o.w - s*(len - maxCol*nRow))/(len - maxCol*nRow + 1)
			} else { colGap = (aN.o.w - s*maxCol)/(maxCol + 1); }
			var dx = colGap*(nCol+1) + s*nCol,
				dy = deltaTitle + rowGap*(nRow+1) + s*nRow,
				N = new Nightengale({
					title: sGroup,
					aData: aCats,
					dx: dx,
					dy: dy,
					w: s-10,
					h: s-10,
					names: aN.o.names,
					legend: false,
					additive: aN.o.additive,
					paper: aN.o.paper,
					aNightengales:true,
					animate:aN.o.animate,
					'title-attr':aN.o['title-attr'],
					'subtitle-attr':aN.o['subtitle-attr'],
					units:aN.o.units,
					fnClick: aN.o.fnClick
				});
			// Calculate totals and scale
			N.fnTotal().drawPlot().rLabels.hide();
			console.log(sGroup, N.maxRatio);
			aN.maxTotal = Math.max(aN.maxTotal, N.total*N.maxRatio);
			aN.maxR = Math.min(aN.maxR, N.maxR);
			
			nCol++;
			if (nCol == maxCol) {
				nCol = 0;
				nRow++;
			}
			a.push(N);
		}
	console.log('setting frame', aN.o.aData);
		aN.fnIter({scope:'group', a:aN.o.aData,
			fn1: createN,
			fn2:function(val, i, sGroup, color, data){
				createN([val], i, sGroup, color, data);
			}
		});
		return a;
	}
	
	function drawFrame(a){
		for (var i=0; i<a.length; i++){
			a[i].rPlot = aN.o.paper.circle(a[i].o.cx, a[i].o.cy, aN.R).attr({'stroke-dasharray':'- '});
			if (aN.o.animate){
				(function(i){
					setTimeout(function(){
						a[i].scale = aN.scale;
						a[i].maxR = aN.maxR;
						a[i].R = aN.R;
						a[i].plot().rLabels.show();
					}, i*500);
				})(i)
			} else {
				a[i].scale = aN.scale;
				a[i].maxR = aN.maxR;
				a[i].R = aN.R;
				a[i].plot().hide();
			}
		}
	}
	function showFrame(){
		for (var i=0; i<aN.a.length; i++){
			aN.a[i].rPlot.show();
			aN.a[i].rLabels.show();
			aN.a[i].rData.show();
		}
	}
	return aN;	
}

aNightengales.prototype.fnIter = fnIter;
aNightengales.prototype.fnLegend = fnLegend;
aNightengales.prototype.erase = function(){
	this.rBoxes.items.forEach(function(rBox){ console.log('rBox', rBox.paper.oG.o.subtitle);rBox.fnOut(); });
	for (var i=0; i<this.a.length; i++){
		this.a[i].rData.hide();
		this.a[i].rPlot.hide();
		this.a[i].rLabels.hide();
	}
}
aNightengales.prototype.filter = function(oExcludes){
	var aN = this;
	$.extend(aN.oExcludes, oExcludes || {});
	if (aN.o.frames){
		for (var i=0; i<aN.o.frames.a.length; i++){
			aN.o.frames.a[i].forEach(function(N){
				N.oExcludes = aN.oExcludes;
				N.fnTotal();
			});
		}
	}
	for (var i=0; i<aN.a.length; i++){
		aN.a[i].oExcludes = aN.oExcludes;
		aN.a[i].fnTotal().filter();
	}
	return aN
};