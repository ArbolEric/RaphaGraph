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
	rgb = Raphael.getRGB(rgb);
	var R1 = rgb.r,
		G1 = rgb.g,
		B1 = rgb.b,
		R2 = (1-p)*R1 + p*255,
		G2 = (1-p)*G1 + p*255,
		B2 = (1-p)*B1 + p*255;
	return 'rgb('+R2+','+G2+','+B2+')'
}

function fnPiece(o){
	var oG = this, rg, rPiece, ids = [];
	if (oG instanceof RaphaGraph) rg = oG;
	else rg = oG.o.rg;
	o.params.cursor = 'pointer';
	o.data.color = o.params.fill;
	o.data.group = oG.o.title || rg.o.names.group[oG.o.index];
	if (o.rPiece) {
		rPiece = o.rPiece;
	} else {
		var sPath = rg.o.animate && o.sPath0 ? o.sPath0 : o.sPath;
		rPiece = rg.o.paper.path(sPath).attr(o.params);
		rPiece.hover(rg.o.fnHoverIn, rg.o.fnHoverOut).click(rg.o.fnClick);
		o.data.aBacks = o.aBacks.slice(0);
	}
	if (rg.o.animate){
		var aAnimations = o.aAnimations || oG.aAnimations,
			attr;
		if (o.sPath0) { attr = {path:o.sPath} }
		else { 
			rPiece.attr({transform:'s0'});
			attr = {transform:'s1'};
		}
		aAnimations.push({
			elem:rPiece,
			attr:attr
		});
	}
	if (o.rPiece) {
		for (var i=0; i<rPiece.items.length; i++){
			ids.push(rPiece.items[i].id);
		}
	} else {
		rPiece.id = Raphael.createUUID();
		ids.push(rPiece.id);
	}
	for (var i=0; i<ids.length; i++) {
		o.aBacks.unshift(ids[i]);
	}
	//o.aBacks = ids.concat(o.aBacks);
	for (var sAttr in o.data){
		rPiece.data(sAttr, o.data[sAttr]);
	}
	rPiece.oG = oG;
	oG.rData.push(rPiece);
	return rPiece;
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
function Rect(x, y, w, h){
	var x1 = x + w,
		y1 = y + h;
	return 'M'+x+' '+y+'L'+x+' '+y1+'L'+x1+' '+y1+'L'+x1+' '+y+'L'+x+' '+y+'Z';
}
function fnDonut(x, y, innerRadius, outerRadius) {
  y -= outerRadius;
  return 'M'+x+' '+y+'a'+outerRadius+' '+outerRadius+' 0 1 0 1 0m-1 '+(outerRadius - innerRadius)+'a'+innerRadius+' '+innerRadius+' 0 1 1 -1 0';
};
function fnWedge(cx, cy, r, startAngle, endAngle) {
	var rad = Math.PI / 180,
		x1 = cx + r * Math.sin(startAngle * rad),
		x2 = cx + r * Math.sin(endAngle * rad),
		y1 = cy - r * Math.cos(startAngle * rad),
		y2 = cy - r * Math.cos(endAngle * rad),
		sPath, path;
	if (endAngle - startAngle == 360) {
		sPath = 'M {{cx}}, {{cy}} m -{{r}}, 0 a {{r}},{{r}} 0 1,0 {{2r}},0 a {{r}},{{r}} 0 1,0 -{{2r}},0'.format({cx:cx, cy:cy, r:r, '2r':2*r});
	} else {
		var large;
		if (endAngle - startAngle < 180) { large = 0; }
		else { large = 1; }
		sPath = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, large, 1, x2, y2, "Z"];
	}
	return sPath
}	
function fnCrust(cx, cy, r, R, startAngle, endAngle) {
	var rad = Math.PI / 180,
		dr = R - r,
		x1 = cx + r * Math.sin(startAngle * rad),
		x2 = x1 + dr * Math.sin(startAngle * rad),
		x3 = cx + r * Math.sin(endAngle * rad),
		x4 = x3 + dr * Math.sin(endAngle * rad),
		y1 = cy - r * Math.cos(startAngle * rad),
		y2 = y1 - dr * Math.cos(startAngle * rad),
		y3 = cy - r * Math.cos(endAngle * rad),
		y4 = y3 - dr * Math.cos(endAngle * rad),
		large, sPath;
	if (endAngle - startAngle < 180) { large = 0 }
	else { large = 1 }
	if (endAngle - startAngle == 360) {
		sPath = fnDonut(cx, cy, r, R);
	} else {
		sPath = ["M", x1,y1, "L", x2,y2, "A", R, R, 0, large, 1, x4,y4, "L", x3,y3, "A", r, r, 0, large, 0, x1,y1, "Z" ];
	}
	return sPath
}
function gradStrip(o){
	var base = o.paper.path(Rect(o.x-o.w/2, o.y-o.h1, o.w, o.h1)).attr({fill:o.color, 'stroke-width':0, 'stroke-opacity':0}),
		uncertain = o.paper.path(Doll(o.x, o.y-o.h1, o.w, o.h2-o.h1)).attr({fill:'90-'+o.color+'-#FFF', 'stroke-width':0, 'stroke-opacity':0}),
		border = o.paper.path(Doll(o.x, o.y, o.w, o.h2)).attr({stroke:'#000', opacity:1}),
		strip = o.paper.set();
	function fnIn(){
		if (!border.mouseIn){
			o.paper.rg.o.fnHoverIn.call(border);
			base.toFront(); uncertain.toFront();
			border.toFront(); border.rBox.toFront();
		}
	}
	function fnOut(){
		o.paper.rg.o.fnHoverOut.call(border);
	}
	base.hover(fnIn, fnOut);
	uncertain.hover(fnIn, fnOut);
	border.hover(fnIn, fnOut).click(o.paper.rg.o.fnClick);
	base.id = Raphael.createUUID();
	uncertain.id = Raphael.createUUID();
	border.id = Raphael.createUUID();
	o.aBacks.unshift(base.id); o.aBacks.unshift(uncertain.id);
	border.data('aBacks', o.aBacks.slice(0));
	o.aBacks.unshift(border.id);
	strip.push(base, uncertain, border);
	return strip
}
function fnTotal(){
	var oG = this,
		rg = oG.o.rg;
	oG.total = 0;
	oG.catTotals = [];
	// single nightengale level== go frame and aNightengale level
	oG.fnIter({a:oG.o.aData, scope:'cat',
		fn1:function(aVars, i, sCat){
			if (oG.oExcludes.cat.indexOf(sCat) < 0){
				var catTotal = 0;
				oG.fnIter({a:aVars, scope:'var',
					fn1:tooFar,
					fn2:function(val, j, sVar){
						if (rg.o.additive){
							if (oG.oExcludes.var.indexOf(sVar) < 0){
								oG.total += val;
								catTotal += val;
							}
						} else {
							if (oG instanceof BarGroup){
								rg.min = Math.min(val, rg.min);
								rg.max = Math.max(val, rg.max);
							} else {
								if (j == 0) {
									oG.total += val;
									oG.catTotals.push(val);
								} else if (!oG.TOTAL && oG instanceof Nightengale) {
									var maxRatio = val/oG.catTotals[i];
									if (!isNaN(maxRatio) && maxRatio !== Infinity){
										oG.maxRatio = Math.max(oG.maxRatio, maxRatio);
									}
								}
								
							}
							
						}
					}
				});
				if (rg.o.additive){ 
					oG.catTotals.push(catTotal); 
					if (oG instanceof BarGroup){
						rg.min = Math.min(catTotal, rg.min);
						rg.max = Math.max(catTotal, rg.max);
					}
				}
			} else { oG.catTotals.push(0); }
		},
		fn2:function(val, i, sCat){
			if (oG.oExcludes.cat.indexOf(sCat) < 0){
				oG.total += val;
				oG.catTotals.push(val);
				if (oG instanceof BarGroup){
					rg.min = Math.min(val, rg.min);
					rg.max = Math.max(val, rg.max);
				}
			} else { oG.catTotals.push(0); }
		}
	});
	if (['pie', 'donut'].indexOf(rg.o.type) >= 0) {
		oG.o.subtitle = rg.formatNo(oG.total, rg.o.sigFigs) + ' ' + rg.o.units;
		if (!oG.TOTAL) { // set on init, not on subsequent filters
			oG.TOTAL = oG.total; // total without filters applied
			rg.maxTotal = Math.max(oG.total, rg.maxTotal);
			rg.maxRatio = Math.max(oG.maxRatio, rg.maxRatio);
		}
	}
	return oG;
}

function fnTitles(){
	var oG = this,
		rg, titleAttr, subTitleAttr;
	if (oG instanceof RaphaGraph) {
		rg = oG;
		titleAttr = rg.text.titleAttr;
		subTitleAttr = rg.text.subTitleAttr;
		oG.plotY += oG.o['title-padding-top'];
		oG.plotH0 -= oG.o['title-padding-top'];
	} else { 
		rg = oG.o.rg;
		titleAttr = rg.text.groupTitle;
		subTitleAttr = rg.text.groupSubTitle;
	}
	// title
	if (oG.o.title){
		var n = (oG.o.title.match(/\n/g) ? oG.o.title.match(/\n/g).length : 0) + 1,
			cx = oG.o.w/2, 
			cy, delta;
		if (oG instanceof RaphaGraph) { // RaphaGraph
			cy = oG.plotY + titleAttr['font-size']*n/2;
			delta = cy + titleAttr['font-size']*n/2 + oG.o['title-padding-bottom'];
		} else {
			cx += oG.o.dx;
			cy = oG.o.dy + titleAttr['font-size']*n/2;
			delta = titleAttr['font-size']*n + 4;
		}
		if (!oG.rTitle) oG.rTitle = rg.o.paper.text(cx, cy, oG.o.title).attr(titleAttr);
		oG.plotY += delta;
		oG.plotH0 -= delta;
	}
	// subtitle
	if (oG.o.subtitle){
		var n = (oG.o.subtitle.match(/\n/g) ? oG.o.subtitle.match(/\n/g).length : 0) + 1,
			cx = oG.o.w/2, 
			cy, delta;
		if (oG instanceof RaphaGraph) { // RaphaGraph
			cy = oG.plotY+oG.o['subtitle-padding-top']+subTitleAttr['font-size']*n/2;
			delta = oG.o['subtitle-padding-top'] + subTitleAttr['font-size']*n + oG.o['subtitle-padding-bottom'];
		} else {
			cx += oG.o.dx;
			cy = oG.plotY + subTitleAttr['font-size']*n/2;
			delta = subTitleAttr['font-size']*n + 4;
		}
		if (!oG.rSubTitle) oG.rSubTitle = rg.o.paper.text(cx, cy, oG.o.subtitle).attr(subTitleAttr);
		oG.plotY += delta;
		oG.plotH0 -= delta;
	}
	return oG
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

function fnBlank(){}

function fnErase(){
	this.rData.remove();
}

// Flexible Iteration Function
function fnIter(o){
	var oG = this, //graph object
		rg = oG instanceof RaphaGraph ? oG : oG.o.rg,
		cont = true;
	if (o.a[0] instanceof Array){
		for (var i=0; i<o.a.length; i++){
			var name = rg.o.names[o.scope][i];
			cont = o.fn1(o.a[i], i, name);
			if (cont === false) { break }
		}
	} else if (o.a[0] instanceof Object) {
		for (var i=0; i<o.a.length; i++){
			var name = o.a[i].name || rg.o.names[o.scope][i];
			if (o.a[i].value) {
				cont = o.fn2(o.a[i].value, i, name);
			} else {
				cont = o.fn1(o.a[i].data, i, name);
			}
			if (cont === false) { break }
		} 
	} else if (typeof(o.a[0]) == 'number'){
		for (var i=0; i<o.a.length; i++){
			var name = rg.o.names[o.scope] instanceof Array ? rg.o.names[o.scope][i] : undefined;
			cont = o.fn2(o.a[i], i, name);
			if (cont === false) { break }
		}
	}
}

// Create text box
function fnBox(o){
	o.boxAttr = $.extend({
		opacity:1,
		fill:'#FFFFFF',
		'stroke-width':5,
		stroke:'#000',
		cursor:'pointer'
	}, o.boxAttr);
	oAttr = $.extend({
		'font-size':14
	}, o.textAttr);
	var _div = document.createElement('div'),
		maxWidth = 0,
		height = 0,
		width = 0;
	_div.innerHTML = o.s;
	var rBox = this.paper.set(),
		aNodes = _div.childNodes;
	this.paper.setStart();
	for (var i=0; i<aNodes.length; i++){
		var oTextAttr = $.extend({}, oAttr);
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
			if ((i == 0 && j == 0) || j > 0){
				height += oTextAttr['font-size'] + 3;
			}
			//if (!text) { text = ' '; }
			rText.attr({
				x:width + BBox.width/2,
				y:height - oTextAttr['font-size']/2
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
	// if running off of right margin, move to right
	if (maxWidth+26 > this.paper.width){
		scale = this.paper.width/(maxWidth+26);
	} 
	// if box is greater than paper height
	if (height+20 > this.paper.height){
		scale = Math.min(scale, this.paper.height/(oBBox.height+20));
	}
	height = scale*height;
	maxWidth = scale*maxWidth;
	var pad = 26;
	if (oBBox.x - pad > maxWidth){ // room to left
		o.x = oBBox.x - maxWidth - pad/2;
	} else if (this.paper.width - oBBox.x2 - pad > width ) { // room to right
		o.x = oBBox.x2 + pad/2; //+ maxWidth/2 ;
	} else if (oBBox.y - pad < height) { // room on top
		o.y = oBBox.y - pad/2;
	} else if (this.paper.height - oBBox.y2 - pad > height) { // room on bottom
		o.y = oBBox.y2 + pad/2
	}
	
	// Cut off at Right
	if (o.x + maxWidth+pad > this.paper.width){
		o.x -= (maxWidth+pad) + o.x - this.paper.width;
	}
	// Cut off at Bottom
	if (o.y + (height+pad) > this.paper.height){
		o.y -= (height+pad) + o.y - this.paper.height;
	}
	
	var rText = this.paper.setFinish(),
		rOutline = this.paper.rect(o.x-10, o.y-9, maxWidth+20, height+20, 4).attr(o.boxAttr);
	rText.transform('t'+o.x+','+o.y+'s'+scale).toFront();
	rBox.push(rOutline, rText);
	rBox.container = rOutline;
	rOutline.rPiece = this;
	
	return rBox
}

function fnHoverIn(){
	var self = this,
		rg = self.paper.rg;
	if (!self.mouseIn){
		self.mouseIn = true;
		rg.rBoxes.items.forEach(function(rBox){ rBox.fnOut(); });
		self.attr({stroke:'white', 'stroke-width':'2'});
		self.toFront();
		var s = rg.o.fnS.call(self);
		self.rBox = fnBox.call(self, {
			textAttr: rg.o.textAttr,
			boxAttr:({stroke:self.data('color'), 'stroke-width':2}),
			s: s
		});
		self.rBox.click = function(){
			this.paper.rg.o.fnClick.call(this.rPiece);
		}
		self.fnOut = function(){
			if (self.mouseIn){
				self.mouseIn = false;
				self.attr({stroke:'black', 'stroke-width':'1'});
				self.toBack();
				var aBacks = self.data('aBacks') || [];
				for (var i=0; i<aBacks.length; i++){
					self.paper.getById(aBacks[i]).toBack();
				}
				rg.rPlot.toBack();
				self.rBox.remove();
				rg.rBoxes.exclude(self);
			}
		}
		self.rBox.container.hover(
			fnBlank, 
			function(e) {
				setTimeout(function(){
					var oPos = currentMousePos.offset(self.paper.rg.o.container);
					if (!self.isPointInside(oPos.x, oPos.y) &&
					!self.rBox.container.isPointInside(oPos.x, oPos.y)){
						self.fnOut();
					}
				}, 200);
			}
		);
		rg.rBoxes.push(self);
	}
}
function fnHoverOut(e){
	var self = this;
	if (this.mouseIn){
		setTimeout(function(){
			var oPos = currentMousePos.offset(self.paper.rg.o.container);
			if (!self.isPointInside(oPos.x, oPos.y) && !self.rBox.container.isPointInside(oPos.x, oPos.y)){
				self.fnOut();
			}
		}, 200);
	}
}

/*
 * Errors
 */
function RaphaGraphError(message) {
	this.name = "RaphaGraph Error";
    this.message = (message || "");
}
RaphaGraphError.prototype = Error.prototype;
function tooFar() { var e = new RaphaGraphError('Your data has too much depth. Either set groups to true, add frames, or decrease data depth.'); throw e }

/*
 * Create Legend
 */
function fnLegend(o){
	var rg = this,
		maxW = .8*rg.o.w,
		legendX = rg.o.w/2,
		legendY = 0,
		legendYo = legendY,
		lines = 1,
		labelSpace = 5,
		markerH = 12,
		markerW = 12,
		markerSpace = 10,
		maxLineW = 0,
		lineW = 0,
		paper = rg.o.paper || rg.o.paper,
		rLine = paper.set(),
		rLegend = paper.set(),//.hide(),
		lines = 0;
	if (!o.fnClick){
		o.fnClick = function(){
			rg.rBoxes.items.forEach(function(rBox){ rBox.fnOut(); });
			var text = this.data('text');
			if (this.data('on')) {
				this.data('on', false);
				this.attr({fill:'#BDBDBD'});
				if (rg.oExcludes[o.scope].indexOf(text) < 0) {
					rg.oExcludes[o.scope].push(text);
				}
				rg.filter();
			} else {
				this.data('on', true);
				this.attr({fill:this.data('color')});
				rg.oExcludes[o.scope].splice(rg.oExcludes[o.scope].indexOf(text), 1);
				rg.filter();
			}
		}
	}
	
	function fnLegendItem(text, color){
		var rMarker = paper.rect(legendX, legendY, markerH, markerW, 3),
			rLabel = paper.text(legendX, legendY, text).attr(rg.text.legendAttr),
			labelW = rLabel.getBBox().width,
			setW = markerSpace + markerW + labelSpace + labelW;
		rMarker.attr({color:color, 'stroke-width':0});
		if (lineW + setW >= maxW) {
			rLegend.push(rLine);
			rLine = paper.set();
			legendY += rg.text.legendAttr['font-size']/2 + 8;
			lineW = 0;
			lines++;
		}
		var lineTransform = -setW/2,
			markerX = legendX + lineW/2 + markerSpace - setW/2,
			labelX = markerX + markerW/2 + markerSpace + labelW/2,
			rItem = paper.set();
		rLabel.attr({x:labelX, y:legendY, cursor:'pointer'});
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
		});
		rItem.push(rLabel);
		rItem.push(rMarker);
		rLine.transform('...t'+lineTransform+',0');
		rLine.push(rItem);
		lineW += setW - markerSpace;
		maxLineW = Math.max(lineW, maxLineW);
	}
	// Iterate at color-scope to display legend
	rg.fnIter({a:o.aData, scope:o.scope, 
		fn2:function(aData, i, name, color, data){
			if (!color) { color = rg.o.oColors[name] || rg.o.aColors[i] }
			if (rg.o.gradient === o.scope) { color = fnLighten(color, 1-Math.pow(.8, i)) }
			fnLegendItem(name, color);
		}, 
		fn1:function(aData, i, name){
			var color = rg.o.oColors[name] || rg.o.aColors[i];
			if (rg.o.gradient === o.scope) { color = fnLighten(color, 1-Math.pow(.8, i)) }
			fnLegendItem(name, color);
		}
	});
	rLegend.push(rLine);
	var font = rg.text.legendAttr['font-size'],
		rLegendBox = paper.rect(
			legendX - (maxLineW+40)/2 - labelSpace, 
			- font/2 - 4,
			maxLineW + 40 + labelSpace, 
			(lines+1)*(font+2)+8, 
			5
		);
	rLegendBox.attr(rg.o.legendBoxAttr);
	rLegend.push(rLegendBox);
	rg.legendHeight = rLegendBox.getBBox().height;
	rLegend.transform('...t0 '+(rg.o.h - rg.legendHeight + font/2 + 4)).show();
	rg.legendHeight += 20;
	rg.plotH0 -= rg.legendHeight;
}

/*
 * Execute Animation Array
 */
function fnAnimate(o){
	var oG = this, rg;
	if (oG instanceof RaphaGraph) rg = oG;
	else rg = oG.o.rg;
	setTimeout(function(){
		var rAnimation = Raphael.animation(o.aAnimation[0].attr, rg.o.animationLength, o.easing || 'elastic'),
			elem = o.aAnimation[0].elem;
		for (var i=1; i<o.aAnimation.length; i++){
			o.aAnimation[i].elem.animateWith(rAnimation, elem, o.aAnimation[i].attr, rg.o.animationLength, o.easing || 'elastic');
		}
		elem.animate(rAnimation);
	}, o.delay);
}
	
/*
 * RaphaGraph Object
 */
window.RaphaGraph = function(o){
	var rg = this;
	if (!o.type) o.type = 'bar';
	rg.depth = 0;
	if (o.frames) o.aData = o.frames.aData[0];
	var a = o.aData;
	while (a instanceof Array) {
		rg.depth++;
		a = a[0].data || a[0];
	}
	rg.o = {
		legend:true,
		frames:false,
		frameInterval:4000,
		animate:true,
		animationLength:1000,
		gradient:'var',
		opacity:false, // 'cat', 'var', false
		'color-scope':'cat',
		oColors:false,
		aColors:[
			'rgb(255,189,35)',
			'rgb(61,147,33)',
			'rgb(0,128,166)',
			'rgb(120,64,176)',
			'rgb(236,48,48)',
			'rgb(6,28,124)'
		],
		chartBackground:false,
		plotBackground:false,
		fnHoverIn: fnHoverIn,
		fnHoverOut: fnHoverOut,
		fnClick: fnBlank,
		fnS: function(){
			var s;
			if (this.paper.rg.depth == 1 && rg.o.groups) {
				s = '<b>' + this.data('group') + '</b>\n'
			} else {
				s = this.data('cat') ? '<b>'+this.data('cat')+'- ' : '<b>';
				s += this.data('var') ? this.data('var') + ':</b>\n' : '</b>\n';
			}
			s += rg.formatNo(this.data('val'));
			s += ' ' + this.paper.rg.o.units;
			return s;
		},
		type:'bar', // pie, bar
		additive:false,
		groups: true,
		legend: true,
		dx:0,
		dy:0,
		title:false,
		subtitle:false,
		units: '',
		'title-padding-top': 5,
		'title-padding-bottom': 7,
		'subtitle-padding-top': 3,
		'subtitle-padding-bottom': 10,
		'legend-padding-x': 3,
		'legend-padding-y': 3,
		'legend-padding-top': 3,
		'legend-padding-bottom': 3,
		textAttr:{
			'font-family': '"Trebuchet MS", Helvetica, sans-serif',
			'font-size':14
		},
		titleAttr:{'font-size':16},
		subTitleAttr:{},
		legendAttr: {'font-size':16, cursor:'pointer'},
		legendBoxAttr: {'stroke-width':1, color:'black'}
	};
	rg.o.w = document.getElementById(o.container).offsetWidth;
	
	if (['pie', 'donut'].indexOf(o.type) >= 0){
		if (rg.depth == 1) {
			rg.o['color-scope'] = 'group';
		}
		$.extend(true, rg.o, {
			dy:0,// shift coordinates up or down
			dx:0,// shift coordinates left or right
			dataAttr:{},
			crustAttr:{},
			wedgeAttr:{},
			groupTitle: {},
			groupSubTitle: {},
			variables:'radial',
			closed:true,
			categories:'wedges'
		}, o);
		rg.crustAttr = $.extend(true, {}, rg.o.dataAttr, rg.o.crustAttr);
		rg.wedgeAttr = $.extend(true, {}, rg.o.dataAttr, rg.o.wedgeAttr);
	} else if (['bar', 'tabs'].indexOf(o.type) >= 0){
		if (rg.depth == 1 && rg.o.groups) {
			rg.o['color-scope'] = 'group';
		}
		var options = {
			'x-label-padding-left': 3,
			'x-label-padding-right': 3,
			'x-label-padding-top': 3,
			'x-label-padding-bottom': 3,
			'y-label-padding-left': 5,
			'y-label-padding-right': 5,
			'x-axis-label-rotate':0,
			'x-axis-padding': 15,
			'y-axis-padding': 10,
			'x-axis-label-scope':'group', // 'cat', 'group'
			gridAttr: {'stroke-dasharray':'. ', 'stroke-width':1, stroke:'black'},
			originAttr: {'stroke-width':2, stroke:'black'},
			xLabels: {'font-size':14},
			yLabels: {'font-size':14},
			xLabelTitle: {'font-size':16},
			yLabelTitle: {'font-size':16},
			groupPadding:10,
			catPadding:5
		};
		if (o.minMax) {
			options.fnS =  function(){
				var s = this.data('cat') ? '<b>'+this.data('cat')+' ' : '<b>';
				s += this.data('var') ? this.data('var') + ':</b>\n' : '</b>\n';
				s += 'low: ' + rg.formatNo(this.data('lo')) + ' ' + rg.o.units + '\n';
				s += 'high: ' + rg.formatNo(this.data('hi')) + ' ' + rg.o.units;
				return s;
			}
		}
		$.extend(true, rg.o, options, o);
	}
	if (!rg.o.groups && !rg.o.names.group) { rg.o.names.group = ['']; }
	
	if (!rg.o.h) { rg.o.h = rg.o.w*.75; }
	document.getElementById(rg.o.container).innerHTML = '';
	
	rg.oG = o.type == 'bar' ? o.minMax ? Tabs : BarGroup :
		rg.o.variables == 'concentric' ? Nightengale : Donut;
	
	var aAttrs = ['titleAttr', 'subTitleAttr', 'legendAttr', 'xLabelTitle', 'yLabelTitle', 'xLabels', 'yLabels', 'groupTitle', 'groupSubTitle'];
	rg.text = {};
	aAttrs.forEach(function(sAttr){
		rg.text[sAttr] = $.extend({}, rg.o.textAttr, rg.o[sAttr]); 
	});
	
	if (o.paper) { rg.o.paper = o.paper; }
	else { rg.o.paper = Raphael(rg.o.container, rg.o.w, rg.o.h); }
	rg.o.paper.rg = rg;
	
	// set to track all tooltips
	rg.rBoxes = rg.o.paper.set();
	
	// Array of groups, categories, and variables to not include in totals and graphs
	rg.oExcludes = {group:[], cat:[], var:[]};
	rg.rData = rg.o.paper.set();
	
	rg.total().chart().plotArea();
	
	if (rg.o.frames){
		rg.setFrames();
	} else {
		rg.plot();
	}
	return rg;
}

RaphaGraph.prototype.total = function(){
	var rg = this;
	if (['pie'].indexOf(rg.o.type) >= 0) {
		rg.maxTotal = 0;
		rg.maxRatio = 1;
	} else if (['bar'].indexOf(rg.o.type) >= 0){
		rg.min = 0;
		rg.max = 0;
	}
	if (rg.o.groups){
		function createG(aCats, i, sGroup){
			var options = {
					title: sGroup,
					rg: rg,
					aData: aCats,
					index: i
				}, 
				oG = new rg.oG(options);
			oG.fnTotal();
			return oG;
		}
		function createFrame(aGroups){
			var a = [];
			rg.fnIter({scope:'group', a:aGroups,
				fn1:function(aCats, i, sGroup){
					a.push(createG(aCats, i, sGroup));
				},
				fn2:function(val, i, sGroup){
					a.push(createG([val], i, sGroup));
				}
			});
			return a;
		}
		if (rg.o.frames){
			rg.o.frames.a = [];
			for (var i=0; i<rg.o.frames.aData.length; i++){
				rg.o.frames.a.push(createFrame(rg.o.frames.aData[i]));
			}
			rg.a = rg.o.frames.a[0];
		} else {
			rg.a = createFrame(rg.o.aData);
		}
	} else {
		if (rg.o.frames){
			rg.o.frames.a = [];
			for (var i=0; i<rg.o.frames.aData.length; i++){
				var options = {
						rg: rg,
						title: rg.o.names.group[0] || '',
						aData: rg.o.frames.aData[i],
						index: 0
					},
					oG = new rg.oG(options);
				rg.o.frames.a.push([oG]);
				oG.fnTotal();
			}
			rg.a = rg.o.frames.a[0];
		} else {
			var options = {
					rg: rg,
					title: rg.o.names.group[0] || '',
					aData: rg.o.aData,
					index: 0
				},
				oG = new rg.oG(options);
			rg.a = [oG];
			oG.fnTotal();
		}
	}
	return rg;
}
RaphaGraph.prototype.chart = function(){
	var rg = this;
	rg.legendHeight = 0;
	rg.plotH0 = rg.o.h;
	rg.plotY = 0;
	// legend
	if (rg.o.legend){
		var aGroups = rg.o.aData;
		if (!rg.o.groups){
			aGroups = [aGroups];
		}
		var aData = rg.o['color-scope'] == 'group' ? 
				aGroups : rg.o['color-scope'] == 'cat' ? 
				aGroups[0].data || aGroups[0] : 
				(aGroups[0].data || aGroups[0])[0].data || (aGroups[0].data || aGroups[0])[0];
		rg.fnLegend({
			scope:rg.o['color-scope'],
			aData: aData
		});
	}
	rg.titles();
	return rg;
}
RaphaGraph.prototype.plotArea = function(){
	var rg = this,
		paper = rg.o.paper,
		plotH = rg.plotH0,
		plotY = rg.plotY;
	// labels, axes and outer circles
	if (['bar', 'tabs'].indexOf(rg.o.type) >= 0){
		paper.setStart();
		/*
		 * X Axis Labels
		 */
		var axLabels = [],
			labelScope,
			xLabelHeight = 0;
		if (rg.o['x-axis-label-scope'] == 'cat'){
			labelScope = 'cat';
		} else if (rg.o['x-axis-label-scope'] == 'group'){
			labelScope = 'group';
		}
		for (var i=0; i<rg.o.names[labelScope].length; i++){
			var name = rg.o.names[labelScope][i];
			if (rg.oExcludes[labelScope].indexOf(name) < 0) {
				var rText = paper.text(10, 10, name).transform('r-'+rg.o['x-axis-label-rotate']);
				rText.attr(rg.text.xLabels);
				xLabelHeight = Math.max(rText.getBBox().height, xLabelHeight);
				axLabels.push(rText);
			}
		}
		plotH -= xLabelHeight + rg.o['x-label-padding-top'];
		rg.axLabels = axLabels;
		/*
		 * Y Axis Labels
		 */
		var oGrid = getIntervals(rg.min, rg.max, plotH, rg.text.yLabelTitle['font-size']+10), 
			y = 0,
			aAnimations = [],
			ayLabels = [];
		rg.o.yLabelWidth = 0;
		for (var i=0; i<oGrid.labels.length; i++){
			var rText = paper.text(rg.o.w/2, rg.o.h/2, rg.formatNo(oGrid.labels[i])).attr(rg.text.yLabels);
			rg.o.yLabelWidth = Math.max(rText.getBBox().width, rg.o.yLabelWidth);
			ayLabels.push(rText);
		}
		
		/*
		 * Calculate Plot Horizontal Dimensions
		 */
		var	plotX = rg.o['y-label-padding-left']+rg.o['y-label-padding-right']+rg.text.xLabelTitle['font-size']+rg.o['y-axis-padding'] + rg.o.yLabelWidth,
			plotW = rg.o.w - plotX - 20;
		// x-Axis Label
		var rXLabel = paper.text(
			rg.o.w/2, 
			plotY + plotH + rg.o['x-axis-padding'] + rg.text.xLabelTitle['font-size'],
			rg.o['x-label'] || ''
		).attr(rg.text.xLabelTitle);
		
		/*
		 * Display Y-Axis Labels
		 */
		for (var i=0; i<ayLabels.length; i++){
			var rLabel = ayLabels[i].show(),
				y = plotY + plotH - i*oGrid['pixel-interval'],
				rGrid = paper.path('M'+plotX+' '+y+'L'+(plotX+plotW)+' '+y+'Z');
			rLabel.attr({x:plotX-rLabel.getBBox().width/2-2, y:y});
			if (oGrid.labels[i] == 0) {
				rGrid.attr(rg.o.originAttr);
			} else {
				rGrid.attr(rg.o.gridAttr);
			}
		};
		// Y-Axis Label
		var yLabel = rg.o['y-label'] || rg.o.units,
			yn = (yLabel.match(/\n/g) ? yLabel.match(/\n/g).length : 0)+1,
			rYLabel = paper.text(
				rg.o['y-label-padding-left']+rg.text.yLabelTitle['font-size']*yn/2, 
				plotY + plotH/2,
				yLabel
			).transform('r-90').attr(rg.text.yLabelTitle);
		/*
		 * Display x-Axis Labels
		 */
		rg.groupW = plotW/(rg.a.length - rg.oExcludes.group.length);
		var groupW = rg.groupW,
			groupInnerW = groupW - 2*rg.o.groupPadding,
			x = plotX + groupW/2,
			scale = oGrid.scale;
		
		var yXAxisLabels = plotY + plotH + rg.o['x-label-padding-top'] + xLabelHeight/2,
			xX = plotX + groupW/2,
			groupI = 0;
		if (rg.o.groups){
			rg.fnIter({a:rg.o.aData, scope:'group',
				fn1:function(aCats, i, name){
					if (rg.oExcludes.group.indexOf(name) < 0){
						var groupX = xX + groupW*groupI;
						if (rg.o['x-axis-rotate']){ groupX -= axLabels[groupI].getBBox().width/2; }
						if (rg.o['x-axis-label-scope'] == 'group'){
							axLabels[groupI].attr({x:groupX, y:yXAxisLabels}).show();
						} else {
							var len = aCats.length - rg.oExcludes.cat.length,
								catW = (groupInnerW - rg.o.catPadding)/len,
								catI = 0;
							rg.fnIter({a:aCats, scope:'group',
								fn1:function(aVars, j, sCat){
									if (rg.oExcludes.cat.indexOf(sCat) < 0){
										var catX = groupX + (2*catI+1-len)/2*catW;
										axLabels[groupI].attr({x:catX, y:yXAxisLabels}).show();
										catI++;
									}
								},
								fn2:function(val, j, name, color, data){
									if (rg.oExcludes.cat.indexOf(sCat) < 0){
										var catX = groupX + (2*catI+1-len)/2*catW;
										axLabels[groupI].attr({x:catX, y:yXAxisLabels}).show();
										catI++;
									}
								}
							});
						}
						groupI++;
					}
				},
				fn2:function(val, i, name, color, data){
					if (rg.oExcludes.group.indexOf(name) < 0){
						var groupX = xX+groupW*groupI;
						if (rg.o['x-axis-rotate']){ groupX -= axLabels[groupI].getBBox().width/2; }
						if (rg.o['x-axis-label-scope'] == 'group'){
							axLabels[groupI].attr({x:groupX, y:yXAxisLabels}).show();
						} 
						groupI++;
					}
				}
			});
		} else {
			if (rg.o['x-axis-rotate']){ xX -= axLabels[0].getBBox().width/2; }
			if (rg.o['x-axis-label-scope'] == 'group'){
				axLabels[0].attr({x:xX, y:yXAxisLabels}).show();
			} 
		}
		
		/*
		 *  Cache References
		 */
		rg.groupInnerW = groupInnerW;
		rg.plotX = plotX;
		rg.plotY = plotY;
		rg.plotH = plotH;
		rg.plotW = plotW;
		rg.oGrid = oGrid;
		rg.y0 = y;
		rg.rPlot = paper.setFinish();
	} else {
		rg.rPlot = rg.o.paper.set();
		rg.R = 0;
		rg.scale = Infinity;
		if (rg.o.groups){
			// Get width/height (s) and offsets for individual Nightengales
			var len = rg.o.aData.length,
				s = Math.sqrt(rg.plotH0*rg.o.w/len),
				maxCol = Math.floor(rg.o.w/s),
				maxRow = Math.floor(rg.plotH0/s),
				nTotal = maxRow*maxCol;
			while (nTotal < len){
				s--;
				maxCol = Math.floor(rg.o.w/s);
				maxRow = Math.floor(rg.plotH0/s);
				nTotal = maxRow*maxCol;
			}
			var rowGap = (rg.plotH0 - maxRow*s)/(maxRow + 1),
				nCol = 0,
				nRow = 0,
				colGap;
			if (nRow+1 == maxRow){
				colGap = (rg.o.w - s*(len - maxCol*nRow))/(len - maxCol*nRow + 1);
			} else { colGap = (rg.o.w - s*maxCol)/(maxCol + 1); }
			
			function setN1(N){
				N.o.dx = colGap*(nCol+1) + s*nCol;
				N.o.dy = rg.plotY + rowGap*(nRow+1) + s*nRow;
				N.o.w = s;
				N.o.h = s;
				N.plotArea();
				rg.scale = Math.min(N.scale, rg.scale);
				nCol++;
				if (nCol == maxCol) {
					nCol = 0;
					nRow++;
				}
			}
			if (rg.o.frames){
				for (var i=0; i<rg.o.frames.a.length; i++){
					nCol = 0; 
					nRow = 0;
					for (var j=0; j<rg.o.frames.a[i].length; j++){
						setN1(rg.o.frames.a[i][j]);
					}
				}
			} else {
				for (var i=0; i<rg.a.length; i++){
					setN1(rg.a[i]);
				}
			}
		} else {
			function setN2(N){
				N.o.w = rg.o.w;
				N.o.h = rg.plotH0;
				N.o.dy = rg.plotY;
				N.plotArea();
				rg.scale = Math.min(N.scale, rg.scale);
				rg.R = Math.max(N.R, rg.R);
			}
			if (rg.o.frames){
				for (var i=0; i<rg.o.frames.a.length; i++){
					setN2(rg.o.frames.a[i][0]);
				}
			} else {
				setN2(rg.a[0]);
			}
		}
		rg.R = Math.sqrt(rg.scale*rg.maxTotal/Math.PI);
		rg.rPlot.attr({r:rg.R}).show();
	}
	return rg;
}
RaphaGraph.prototype.plot = function(){
	var rg = this,
		paper = rg.o.paper;
	if (['pie', 'donut'].indexOf(rg.o.type) >= 0){
		function plotN(N, i){
			N.R = rg.R;
			N.scale = rg.scale;
			N.plot();
			if (rg.o.animate){
				N.animate({
					delay:i*rg.o.animationLength,
					aAnimation:N.aAnimations
				});
			}
		}
		rg.a.forEach(plotN);
	} else if (['bar', 'tabs'].indexOf(rg.o.type) >= 0) {
		var groupI = 0;
		rg.aAnimations = [];
		function plotBG(BG, i){
			if (rg.oExcludes.group.indexOf(BG.o.title) < 0) {
				BG.groupI = groupI;
				BG.plot();
				groupI++;
			}
		}
		rg.a.forEach(plotBG);
		if (rg.o.animate){
			for (var i=0; i<rg.aAnimations.length; i++){
				rg.animate({
					aAnimation: rg.aAnimations[i],
					delay: i*rg.o.animationLength,
					easing:'<>'
				});
			}
		}
	}
	return rg;
}
RaphaGraph.prototype.setFrames = function(){
	var rg = this;
	rg.o.animate = false;
	for (var i=0; i<rg.o.frames.a.length; i++){
		// rg.o.aData = rg.o.frames.aData[i];
		rg.a = rg.o.frames.a[i];
		rg.plot().hide();
	}
	rg.a = rg.o.frames.a[0];
	rg.show();
	
	rg.o.frames.fnPre = rg.o.frames.fnPre ? rg.o.frames.fnPre : fnBlank;
	rg.o.frames.fnPost = rg.o.frames.fnPost ? rg.o.frames.fnPost : fnBlank;
	var frame = 1,
		motion = true;
	function goToFrame(){
		if (!motion) { return }
		rg.rBoxes.items.forEach(function(rBox){ rBox.fnOut(); });	
		rg.o.frames.fnPre(frame);
		rg.hide();
		rg.a = rg.o.frames.a[frame];
		rg.show();
		rg.o.frames.fnPost(frame);
		if (frame == rg.o.frames.aData.length - 1){
			frame = 0;
		} else { frame++; }
		motion = true;
	}
	var SI = setInterval(goToFrame, rg.o.frameInterval);
	rg.pause = function(idx){
		if (parseInt(idx) >= 0) { motion=true;frame = idx;goToFrame(); }
		motion = false;
		return rg;
	}
	rg.resume = function(){
		motion = true; return rg;
	}
	rg.stop = function(){
		clearInterval(SI); return rg;
	}
	return rg;
}
RaphaGraph.prototype.erase = function(){
	this.rData.remove();
}
RaphaGraph.prototype.titles = fnTitles;
RaphaGraph.prototype.fnIter = fnIter;
RaphaGraph.prototype.fnLegend = fnLegend;
RaphaGraph.prototype.animate = fnAnimate;
RaphaGraph.prototype.show = function(){
	for (var i=0; i<this.a.length; i++){
		this.a[i].show();
	}
	return this;
};
RaphaGraph.prototype.hide = function(){
	for (var i=0; i<this.a.length; i++){
		this.a[i].hide();
	}
};
RaphaGraph.prototype.filter = function(){
	var rg = this;
	rg.o.animate = false;
	rg.rPlot.remove();
	rg.plotArea();
	if (rg.o.frames){
		rg.pause().erase();
		for (var i=0; i<rg.o.frames.a.length; i++){
			var groupI = 0;
			rg.o.frames.a[i].forEach(function(oG){
				oG.oExcludes = rg.oExcludes;
				if (rg.oExcludes.group.indexOf(oG.o.title) < 0){
					oG.groupI = groupI;
					groupI++;
					oG.fnTotal().plot().hide();
				}
			});
		}
		rg.show().resume();
	} else {
		rg.erase();
		var groupI = 0;
		rg.a.forEach(function(oG){
			oG.oExcludes = rg.oExcludes;
			if (rg.oExcludes.group.indexOf(oG.o.title) < 0){
				oG.groupI = groupI;
				groupI++;
				oG.fnTotal().plot();
			}
		});
	}
	return rg;
};
RaphaGraph.prototype.getColor = function(o){
	var rg = this,
		idx = o[o.scope],
		params = {};
	if (rg.o.oColors) {
		params.fill = rg.o['color-scope'] == 'group' ? rg.o.oColors[o.sGroup] :
			rg.o['color-scope'] == 'cat' ? rg.o.oColors[o.sCat] :
			rg.o.oColors[o.sVar];
	} else {
		var colorIdx = o[rg.o['color-scope']] || 0;
		params.fill = rg.o.aColors[colorIdx];
	}
	if (o[rg.o.gradient]){
		params.fill = fnLighten(params.fill, 1-Math.pow(.8, o[rg.o.gradient]));
	}
	if (o[rg.o.opacity]) {
		params['fill-opacity'] = Math.pow(.8, o[rg.o.opacity]);
	}
	return params
}
RaphaGraph.prototype.fnSigFigs = function(n, sig) {
    var sign = n < 0 ? -1 : 1;
	n = Math.abs(n);
	var mult = Math.pow(10,
			sig - Math.floor(Math.log(n) / Math.LN10) - 1);
	if (mult == 1) {
		return Math.round(n)*sign
	} else if (mult < 1) {
		return Math.round(n * mult) * Math.round(1/mult) * sign;
	} else {
		return Math.round(n * mult) / mult * sign;
	}
}
RaphaGraph.prototype.formatNo = function(val){
	if (val == 0) { return '0' }
	if (this.o.sigFigs){
		val = this.fnSigFigs(val, this.o.sigFigs);
	}
	var aVal = val.toString().split('.'),
		ints = parseInt(aVal[0] || 0), decs = parseInt(aVal[1] || 0);
	if (ints) {
		while (/(\d+)(\d{3})/.test(ints.toString())){
		  ints = ints.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		}
		val = ints;
	} else { val = '0'; }
	if (decs) {
		val += '.';
		while (/(\d+)(\d{3})/.test(decs.toString())){
		  decs = decs.toString().replace(/(\d+)(\d{3})/, '$1'+' '+'$2');
		}
		val += decs;
	}
	return val;
}

var Nightengale = function(o){
	var N = this;
	N.o = o;
	N.o.dx = 0;
	N.o.dy = 0;
	N.maxRatio = 1;
	N.oExcludes = {cat:[], var:[]};
	N.rBoxes = N.o.rg.o.paper.set();
	return N
}
Nightengale.prototype.fnTotal = fnTotal;
Nightengale.prototype.plotArea = function(){
	var N = this;
	N.plotH0 = N.o.h || rg.plotH0;
	N.plotY = N.o.dy;
	N.titles();
	if (N.rTitle) N.rTitle.hide();
	if (N.rSubTitle) N.rSubTitle.hide();
	N.maxR = N.plotH0/2;
	if (!N.scale) N.scale = Math.pow(N.maxR, 2)*Math.PI/(N.TOTAL*N.maxRatio);// px^2/val
	N.R = Math.sqrt(N.scale*N.TOTAL/Math.PI);
	N.o.cx = N.o.dx + N.o.w/2;
	N.o.cy = N.plotY + N.plotH0/2;
	N.rPlot = N.o.rg.o.paper.circle(N.o.cx, N.o.cy, N.R).attr({'stroke-dasharray':'- '}).hide();
	N.o.rg.rPlot.push(N.rPlot);
	return N
}
Nightengale.prototype.plot = function(){
	var N = this,
		rg = N.o.rg,
		startAngle = 0;
	N.aAnimations = [];
	N.rData = rg.o.paper.set();
	if (N.rTitle) N.rTitle.show();
	N.rSubTitle.attr({text: rg.formatNo(N.total) + ' ' + rg.o.units});
	N.rSubTitle.show();
	N.fnIter({a:N.o.aData, scope:'cat',
		fn1:function(aVars, i, sCat){
			if (N.oExcludes.cat.indexOf(sCat) < 0){
				var delta = N.catTotals[i]/N.total*360,
					r0 = 0,
					aBacks = [];
				N.fnIter({a:aVars, scope:'var',
					fn1:tooFar,
					fn2:function(val, j, sVar){
						if (N.oExcludes.var.indexOf(sVar) < 0){
							var params = rg.getColor({sCat:sCat, sVar:sVar, group:N.o.index, cat:i, var:j, scope:'var'}),
								sPath, rPiece,
								r = Math.sqrt(N.scale*val*360/delta/Math.PI + Math.pow(r0, 2));
							if (rg.o.additive) {
								if (j == 0){
									sPath = fnWedge(N.o.cx, N.o.cy, r, startAngle, startAngle+delta);
								} else {
									sPath = fnCrust(N.o.cx, N.o.cy, r0, r, startAngle, startAngle+delta);
								}
								r0 += r - r0;
							} else {
								var r = Math.sqrt(N.scale*val*360/delta/Math.PI);
								sPath = fnWedge(N.o.cx, N.o.cy, r, startAngle, startAngle+delta);
							}
							N.fnPiece({
								params:params,
								aBacks:aBacks,
								sPath:sPath,
								data: {val:val, cat:sCat, var:sVar}
							});
						}
					}
				});
				startAngle += delta;
			}
		},
		fn2:function(val, i, sCat){
			if (N.oExcludes.cat.indexOf(sCat) < 0){
				var params = rg.getColor({sCat:sCat, cat:i, sGroup:N.o.title, group:N.o.index, scope:'cat'}),
					delta = N.catTotals[i]/N.total*360,
					r = Math.sqrt(N.total*N.scale/Math.PI),
					sPath = fnWedge(N.o.cx, N.o.cy, r, startAngle, startAngle+delta);
				N.fnPiece({
					sPath:sPath,
					params:params,
					aBacks:[],
					data:{val:val, cat:sCat}
				});
				startAngle += delta;
			}
		}
	});
	rg.rData.push(N.rData);
	return N
}
Nightengale.prototype.hide = function(){
	var N = this;
	if (N.rTitle) N.rTitle.hide();
	if (N.rSubTitle) N.rSubTitle.hide();
	N.rData.hide();
	N.rPlot.hide();
	N.rBoxes.clear();
	return N;
}
Nightengale.prototype.show = function(){
	var N = this;
	if (N.rTitle) N.rTitle.show();
	if (N.rSubTitle) N.rSubTitle.show();
	N.rData.show();
	N.rPlot.show();
	return N;
}
Nightengale.prototype.erase = function(){
	var N = this;
	if (N.rTitle) N.rTitle.remove();
	if (N.rSubTItle) N.rSubtitle.remove();
	N.rData.remove();
	N.rPlot.remove();
	N.rBoxes.remove();
	return N;
}
Nightengale.prototype.titles = fnTitles;
Nightengale.prototype.fnIter = fnIter;
Nightengale.prototype.animate = fnAnimate;
Nightengale.prototype.fnPiece = fnPiece;

var Donut = function(o){
	if (!o.rg.o.additive) { o.rg.o.additive = true; }
	this.o = o;
	this.catTotals = [];
	this.total = 0;
	this.o.dx = 0;
	this.o.dy = 0;
	this.oExcludes = {cat:[], var:[]};
	this.rBoxes = this.o.rg.o.paper.set();
	this.maxRatio = 1;
	if (o.rg.o.categories == 'rings') o.rg.o.closed = false;
	return this;
	
}
Donut.prototype.plotArea = function(){
	var D = this,
		rg = D.o.rg;
	D.plotH0 = D.o.h || rg.plotH0;
	D.plotY = D.o.dy;
	D.titles();
	if (D.rTitle) D.rTitle.hide();
	if (D.rSubTitle) D.rSubTitle.hide();
	D.maxR = D.plotH0/2;
	if (!D.scale) D.scale = Math.pow(D.maxR, 2)*Math.PI/D.TOTAL;
	D.R = Math.sqrt(D.scale*D.TOTAL/Math.PI);
	D.o.cx = D.o.dx + D.o.w/2;
	D.o.cy = D.plotY + D.plotH0/2;
	D.rPlot = D.o.rg.o.paper.circle(D.o.cx, D.o.cy, D.R).attr({'stroke-dasharray':'- '}).hide();
	rg.rPlot.push(D.rPlot);
	return D
};
Donut.prototype.plot = function(){	
	var D = this,
		rg = D.o.rg,
		startAngle = 0;
	
	if (D.rTitle) D.rTitle.show();
	if (D.rSubTitle) { 
		D.rSubTitle.attr({text: rg.formatNo(D.total) + ' ' + rg.o.units});
		D.rSubTitle.show();
	}
	D.r = [];
	var len;
	if (rg.o.categories == 'wedges'){ len = 2; }
	else {
		if (D.o.aData[0] instanceof Array) { len = D.o.aData.length; } 
		else { len = 1; }
		len -= D.oExcludes.cat.length;
	}
	var R = Math.sqrt(D.scale*D.total/Math.PI),
		delta = R/len/2;
	
	for (var i=0; i<=len; i++){
		D.r.push(R/2 + delta*i);
	}
	D.aAnimations = [];
	D.rData = rg.o.paper.set();
	var catI = 0;
	
	D.fnIter({a:D.o.aData, scope:'cat',
		fn1:function(aVars, i, sCat){
			if (D.oExcludes.cat.indexOf(sCat) < 0){
				var aBacks = [],
					delta1 = D.catTotals[i]/D.total*360,
					params1 = rg.getColor({sCat:sCat, group:D.o.index, cat:i, var:0, scope:'var'}),
					sPath;
				if (rg.o.categories == 'wedges') {
					var r1;
					if (aVars.length == 1) { r1 = D.r[2]; }
					else { r1 = D.r[1]; }
					if (rg.o.closed) {
						sPath = fnWedge(D.o.cx, D.o.cy, r1, startAngle, startAngle+delta1);
					} else {
						sPath = fnCrust(D.o.cx, D.o.cy, D.r[0], r1, startAngle, startAngle+delta1);
					}
					D.fnPiece({
						sPath0: ['M', D.o.cx, D.o.cy], sPath: sPath,
						params: params1,
						data: {val:D.catTotals[i], cat:sCat},
						aBacks: aBacks
					});
					if (aVars.length == 1) { startAngle += delta; }
				} else { startAngle = 0; }
				D.fnIter({a:aVars, scope:'var',
					fn1:tooFar,
					fn2:function(val, j, sVar){
						if (D.oExcludes.var.indexOf(sVar) < 0){
							var sPath1, params;
							if (rg.o.categories !== 'wedges') {
								var params = rg.getColor({sCat:sCat, sVar:sVar, group:D.o.index, cat:i, var:j, scope:'var'}),
									delta = val/D.catTotals[i]*360;
								if (rg.o.closed && catI==0) {
									sPath1 = fnWedge(D.o.cx, D.o.cy, D.r[catI+1], startAngle, startAngle+delta);
								} else {
									sPath1 = fnCrust(D.o.cx, D.o.cy, D.r[catI], D.r[catI+1], startAngle, startAngle+delta);
								}
								startAngle += delta;
							} else if (aVars.length > 1) {
								var params = rg.getColor({sCat:sCat, sVar:sVar, group:D.o.index, cat:i, var:j+1, scope:'var'}),
									subDelta = val/D.total*360;
								sPath1 = fnCrust(D.o.cx, D.o.cy, D.r[1], D.r[2], startAngle, startAngle+subDelta);
								startAngle += subDelta;
							}
							if (sPath1){
								D.fnPiece({
									sPath0: ['M', D.o.cx, D.o.cy], sPath: sPath1,
									params: params,
									data: {val:val, var:sVar, cat:sCat, group:rg.o.names.group[0] || D.o.title},
									aBacks: aBacks
								});
							}
						}
					}
				});
				catI++;
			}
		},
		fn2:function(val, i, sCat){
			if (D.oExcludes.cat.indexOf(sCat) < 0){
				var params = rg.getColor({sCat:sCat, cat:i, sGroup:D.o.title, group:D.o.index, scope:'cat'}),
					delta = val/D.total*360,
					sPath;
				if (rg.o.categories == 'wedges') {
					if (val == D.total) { 
						sPath = rg.o.closed ? 
							fnWedge(D.o.cx, D.o.cy, D.r[2], 0, 360) : 
							fnDonut(D.o.cx, D.o.cy, D.r[0], D.r[2]);
					} else {
						sPath = rg.o.closed ?
							fnWedge(D.o.cx, D.o.cy, D.r[2], startAngle, startAngle+delta) :
							fnCrust(D.o.cx, D.o.cy, D.r[0], D.r[2], startAngle, startAngle+delta);
					}
				} else {
					sPath = fnDonut(D.o.cx, D.o.cy, D.r[catI], D.r[catI+1]);
				}
				D.fnPiece({
					sPath: sPath,
					params: params,
					data: {val:val, cat:sCat, group:rg.o.names.group[0] || D.o.title},
					aBacks: []
				});
				startAngle += delta;
				catI++;
			}
		}
	});
	rg.rData.push(D.rData);
	return D
}
Donut.prototype.show = function(){
	var D = this;
	if (D.rTitle) D.rTitle.show();
	if (D.rSubTitle) D.rSubTitle.show();
	D.rData.show();
	D.rPlot.show();
	return D;
}
Donut.prototype.hide = function(){
	var D = this;
	if (D.rTitle) D.rTitle.hide();
	if (D.rSubTitle) D.rSubTitle.hide();
	D.rData.hide();
	D.rPlot.hide();
	D.rBoxes.clear();
	return D;
}
Donut.prototype.fnTotal = fnTotal;
Donut.prototype.titles = fnTitles;
Donut.prototype.animate = fnAnimate;
Donut.prototype.fnIter = fnIter;
Donut.prototype.fnPiece = fnPiece;

var BarGroup = function(o){
	this.o = o;
	this.oExcludes = {cat:[], var:[]};
	this.rBoxes = this.o.rg.o.paper.set();
	return this;
}
BarGroup.prototype.fnTotal = fnTotal;
BarGroup.prototype.plot = function(){
	var BG = this,
		rg = this.o.rg,
		paper = rg.o.paper,
		groupInnerW = rg.groupInnerW,
		plotX = rg.plotX,
		groupW = rg.groupW,
		scale = rg.oGrid.scale,
		y0 = rg.plotY + rg.plotH,
		groupI = BG.groupI;
	BG.rData = rg.o.paper.set();
	// draw doll for given piece of data
	function draw(o){
		var sGroup = BG.o.title || rg.o.names.group[BG.o.index],
			params = rg.getColor({sCat:o.data.cat, sVar:o.data.var, sGroup:sGroup, group:BG.o.index, cat:o.j, var:o.k, scope:o.scope}),
			varH = o.val*scale,
			sPath, sPath0,
			idx = rg.o.additive ? 0 : o.k || 0;
		if (rg.o.additive){
			sPath = Rect(o.x-o.varW/2, o.y-varH, o.varW, varH);
			sPath0 = 'M'+o.x+' '+(o.y-varH)+'L'+o.x+' '+o.y+'L'+(o.x+2)+' '+o.y+'L'+(o.x+2)+' '+(o.y-varH)+'L'+o.x+' '+(o.y-varH)+'Z';
		} else {
			sPath = Doll(o.x, y0, o.varW, varH);
			sPath0 = 'M'+o.x+' '+y0+'Z';
		}
		BG.fnPiece({
			sPath: sPath, sPath0: sPath0,
			params: params,
			aBacks: o.aBacks,
			data: { val:o.val, cat:o.data.cat, var:o.data.var, group:sGroup },
			aAnimations: rg.aAnimations[idx]
		});
	}

	if (BG.o.aData instanceof Array) {
		var groupX = plotX + groupW/2 + groupW*groupI,
			len = BG.o.aData.length - rg.oExcludes.cat.length,
			catW = (groupInnerW - rg.o.catPadding)/len,
			catInnerW = catW - 2*rg.o.catPadding,
			catI = 0;
		rg.fnIter({a:BG.o.aData, scope:'cat', 
			fn1:function(aVars, j, sCat){
				if (rg.oExcludes.cat.indexOf(sCat) < 0) {
					var x = groupX + (2*catI+1-len)/2*catW,
						y = y0,
						aBacks = [];
					rg.fnIter({a:aVars, scope:'var', 
						fn2:function(val, k, sVar){
							if (groupI==0 && j==0) { 
								if (!rg.o.additive || k==0) { rg.aAnimations.push([]); }
							}
							if (rg.oExcludes.var.indexOf(sVar) < 0) {
								draw({
									x:x, 
									y:y,
									val:val, 
									j:j, k:k,
									name:sVar,
									varW: rg.o.additive ? catInnerW : catInnerW*Math.pow(.75, k), 
									scope:'var',
									aBacks:aBacks,									
									data:{ group:BG.o.title, cat:sCat, var:sVar, val:val }
								});
								if (rg.o.additive) { y -= val*scale; }
							}
						}, 
						fn1:tooFar
					});
					catI++;
				}
			},
			fn2:function(val, j, sCat){
				if (groupI==0 && j==0) { rg.aAnimations.push([]); };
				if (rg.oExcludes.cat.indexOf(sCat) < 0) {
					var x = groupX + (2*catI+1-len)/2*catW;
					draw({
						x:x, y:y0,
						val:val, 
						j:j, 
						name:name, 
						varW:catInnerW, 
						scope:'cat', aBacks: [],
						data:{ group:BG.o.title, cat:sCat, val:val }
					});
					catI++;
				}
			}
		});
	} else {
		if (groupI==0) { rg.aAnimations.push([]); };
		var groupX = plotX + groupW/2 + groupW*groupI;
		draw({
			x:groupX, y:y0,
			val: BG.o.aData, 
			name: name, 
			varW: groupInnerW,
			scope: 'group',
			aBacks:[],
			data: { group:BG.o.title, val:val }
		});
	}
	rg.rData.push(BG.rData);
	return BG;
}
BarGroup.prototype.fnIter = fnIter;
BarGroup.prototype.hide = function(){
	this.rData.hide();
	this.rBoxes.clear();
}
BarGroup.prototype.show = function(){
	this.rData.show();
}
BarGroup.prototype.fnPiece = fnPiece;

var Tabs = function(o){
	if (o.rg.o.additive) {
		var e = new RaphaGraphError('minMax bar graphs cannot be stacked. Set "additive" to false.');
		throw e;
	}
	if (o.rg.o.animate) {
		var e = new RaphaGraphError('minMax bar graphs cannot be animated. Set "animate" to false.');
		throw e;
	}
	this.o = o;
	this.oExcludes = {cat:[], var:[]};
	this.rBoxes = this.o.rg.o.paper.set();
	return this;
}
Tabs.prototype.fnTotal = function(){
	var T = this,
		rg = T.o.rg;
	T.total = 0;
	T.fnIter({a:T.o.aData, scope:'cat',
		fn1:function(aVars, i, sCat){
			if (T.oExcludes.cat.indexOf(sCat) < 0){
				if (typeof(aVars[0]) == 'number'){
					var hi = aVars[1];
					rg.min = Math.min(hi, rg.min);
					rg.max = Math.max(hi, rg.max);
					T.total += hi;
				} else {
					T.fnIter({a:aVars, scope:'var',
						fn1:function(aVals, j, sVar){
							if (T.oExcludes.cat.indexOf(sCat) < 0){
								var hi = aVals[1];
								if (j == 0) { T.total += hi; }
								rg.min = Math.min(hi, rg.min);
								rg.max = Math.max(hi, rg.max);
							}
						}
					});
				}
			}
		},
		fn2: tooFar
	});
	return T;
}
Tabs.prototype.plot = function(){
	var T = this,
		rg = this.o.rg,
		paper = rg.o.paper,
		groupInnerW = rg.groupInnerW,
		plotX = rg.plotX,
		groupW = rg.groupW,
		scale = rg.oGrid.scale,
		y0 = rg.plotY + rg.plotH,
		groupI = T.groupI,
		sGroup = T.o.title || rg.o.names.group[T.o.index],
		groupX = plotX + groupW/2 + groupW*groupI,
		len = T.o.aData.length - rg.oExcludes.cat.length,
		catW = (groupInnerW - rg.o.catPadding)/len,
		catInnerW = catW - 2*rg.o.catPadding,
		catI = 0;
	T.rData = rg.o.paper.set();
	if (T.o.aData[0] instanceof Array){
		rg.fnIter({a:T.o.aData, scope:'cat',
			fn1:function(aVars, j, sCat){
				if (rg.oExcludes.cat.indexOf(sCat) < 0) {
					var x = groupX + (2*catI+1-len)/2*catW,
						y = y0,
						aBacks = [];
					if (typeof(aVars[0]) == 'number'){
						var lo = aVars[0],
							hi = aVars[1];
						if (groupI==0 && j==0) { rg.aAnimations.push([]); }
						var params = rg.getColor({sCat:sCat, sGroup:sGroup, group:T.o.index, cat:j, scope:'cat'}),
							options = {
								//sPath0: 'M'+x+' '+y0+'Z',
								params: params, aBacks:[],
								data: { lo:lo, hi:hi, cat:sCat, group:sGroup },
								aAnimations: rg.aAnimations[0]
							};
						if (lo != hi){
							options.rPiece = gradStrip({paper: rg.o.paper, x:x, y:y0, w:catInnerW, h1:lo*scale, h2:hi*scale, color:params.fill, aBacks:aBacks})
						} else {
							options.sPath = Doll(x, y0, catInnerW, lo*scale);
							options.aBacks = aBacks;
						}
						T.fnPiece(options);
					} else {
						varI = 0;
						rg.fnIter({a:aVars, scope:'var', 
							fn1:function(aVals, k, sVar){
								if (typeof(aVals[0]) == 'number'){
									if (T.oExcludes.var.indexOf(sVar) < 0){
										if (groupI==0 && j==0) { 
											rg.aAnimations.push([]);
										};
										var lo = aVals[0],
											hi = aVals[1],
											params = rg.getColor({sVar:sVar, sCat:sCat, sGroup:sGroup, group:T.o.index, cat:j, var:k, scope:'cat'}),
											options = {
												//sPath0: 'M'+x+' '+y0+'Z',
												params: params, aBacks:[],
												data: { lo:lo, hi:hi, var:sVar, cat:sCat, group:sGroup },
												aAnimations: rg.aAnimations[varI]
											};
										if (lo != hi){
											options.rPiece = gradStrip({paper: rg.o.paper, x:x, y:y0, w:catInnerW*Math.pow(.75, k), h1:lo*scale, h2:hi*scale, color:params.fill, aBacks:aBacks});
										} else {
											options.sPath = Doll(x, y0, catInnerW*Math.pow(.75, k), lo*scale);
											options.aBacks = aBacks;
										}
										T.fnPiece(options);
									}
									varI++;
								}
								else { tooFar(); }
							}
						});
					}
					catI++;
				}
			}
		});
	} else {
		if (rg.oExcludes.group.indexOf(sGroup) <0){
			if (groupI==0) { rg.aAnimations.push([]); }
			var lo = T.o.aData[0],
				hi = T.o.aData[1],
				params = rg.getColor({sGroup:sGroup, group:T.o.index, scope:'group'}),
				options = {
					//sPath0: 'M'+groupX+' '+y0+'Z',
					params: params,
					data: { lo:lo, hi:hi, group:sGroup },
					aAnimations: rg.aAnimations[0]
				};
			if (lo != hi){
				options.rPiece = gradStrip({paper: rg.o.paper, x:groupX, y:y0, w:groupInnerW, h1:lo*scale, h2:hi*scale, color:params.fill, aBacks:[]});
			} else {
				options.sPath = Doll(groupX, y0, groupInnerW, lo*scale);
				options.aBacks = [];
			}
			T.fnPiece(options);
		}
	}
	rg.rData.push(T.rData);
	return T;
}
Tabs.prototype.fnIter = fnIter;
Tabs.prototype.hide = function(){
	this.rData.hide();
	this.rBoxes.clear();
}
Tabs.prototype.show = function(){
	this.rData.show();
}
Tabs.prototype.fnPiece = fnPiece;