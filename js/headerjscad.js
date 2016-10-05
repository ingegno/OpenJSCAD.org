
var headerJSCAD = "function getParameterDefinitions() {";
headerJSCAD += "return [ \
    { name:'stamp_width', caption: 'Stempel Breedte:', captionEN: 'Stamp width:', type: 'float', initial: 40.0 }, \
    { name:'stamp_elevation', caption: 'Stempel Hoogte:', captionEN: 'Stamp elevation:', type: 'float', initial: 1.5 }, \
    { name:'margin', caption: 'Marge:', captionEN: 'Margin:', type: 'float', initial: 0.5 }, \
    { name:'base_thickness', caption: 'Dikte Basis:', captionEN: 'Base thickness:', type: 'float', initial: 1.5 } \
]; \
}\
";

headerJSCAD += " ";
headerJSCAD += "function main(params) { ";

var footerJSCAD = "var input_width = paths_array[0][0];";
footerJSCAD += "	var input_height = paths_array[0][1];";
footerJSCAD += "	var tVersion = paths_array[0][2];";

footerJSCAD += "	var dispo_width = params.stamp_width - 2*params.margin;";
footerJSCAD += "	var sTrace = dispo_width/input_width;";
footerJSCAD += "	var stamp_height = input_height*sTrace + 2*params.margin;";
	
footerJSCAD += "	var i, len, j, l, poly;";

footerJSCAD += "	var stamp = new CSG();";
footerJSCAD += "	for (i=1, len=paths_array.length; i < len; i++) {";
footerJSCAD += "		poly = [paths_array[i][1][0]];";
footerJSCAD += "		for (j=1, l=paths_array[i][1].length; j < l; j++) {";
footerJSCAD += "			point = paths_array[i][1][j];";
footerJSCAD += "			if (point[0] === undefined && point[1] === undefined) continue;";
footerJSCAD += "			if (point[0] == poly[poly.length -1][0] && point[1] == poly[poly.length -1][1]) continue;";
			
footerJSCAD += "			if (! alreadyInPath(poly, point)) {";
footerJSCAD += "				poly.push(point);";	
footerJSCAD += "			}";
footerJSCAD += "		}";
		
footerJSCAD += "		if (paths_array[i][0] == 1) {";
footerJSCAD += "			stamp = stamp.union(scale(sTrace, linear_extrude({height:(params.stamp_elevation+params.base_thickness)/sTrace}, polygon(poly))));";
footerJSCAD += "		} else {";
footerJSCAD += "			stamp = stamp.subtract(scale(sTrace, linear_extrude({height:(params.stamp_elevation+params.base_thickness)/sTrace}, polygon(poly))));";
footerJSCAD += "		}";
footerJSCAD += "	}";


footerJSCAD += "	stamp = stamp.translate([-sTrace*input_width/2, -sTrace*input_height/2, 0]);";
footerJSCAD += "	stamp = stamp.setColor(0.5, 0.5, 0.6);";
footerJSCAD += "	stamp = stamp.scale([-1, -1, 1]);";

footerJSCAD += "	var base = CSG.cube({radius: [params.stamp_width/2, stamp_height/2, params.base_thickness/2]});";
footerJSCAD += "	base = base.translate([0, 0, params.base_thickness/2]);";
footerJSCAD += "	base = base.setColor(0.75, 0.75, 0.85);";
	
footerJSCAD += "	return base.union(stamp); ";
footerJSCAD += "}";
footerJSCAD += " ";
footerJSCAD += "function alreadyInPath(pArray, pPoint) {";
footerJSCAD += "	for (var i=0, l=pArray.length; i < l; i++) {";
footerJSCAD += "		if (pPoint[0] == pArray[i][0] && pPoint[1] == pArray[i][1]) {";
footerJSCAD += "			return true;";		
footerJSCAD += "		}";
footerJSCAD += "	}";
footerJSCAD += "	return false;";
footerJSCAD += "}";	