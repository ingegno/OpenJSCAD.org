// NOTE: changes here must be done in js/headerjscad.js also, as that creates a new js based on image

function getParameterDefinitions() {
return [
    { name:'stamp_width', caption: 'Stempel Breedte:', captionEN: 'Stamp width:', type: 'float', initial: 40.0 },
    { name:'stamp_elevation', caption: 'Stempel Hoogte:', captionEN: 'Stamp elevation:', type: 'float', initial: 1.5 },
    { name:'margin', caption: 'Marge:', captionEN: 'Margin:', type: 'float', initial: 0.5 },
    { name:'base_thickness', caption: 'Dikte Basis:', captionEN: 'Base thickness:', type: 'float', initial: 1.5 }
];
}

function main(params) {
    
    paths_array = paths_array = [[256, 256, 1],[1,[[150.23,33.5],[134.96,18.5],[134.73,46.5],[134.5,74.5],[71.75,74.75],[9,75],[9,128],[9,181],[71.75,181.25],[134.5,181.5],[135,209.08],[135.5,236.66],[191,182.91],[191,182.91],[212.574,161.97],[230.283,144.7],[246.79,128.33],[246.79,128.33],[243.679,124.89],[235.007,116.141],[206.29,88],[206.29,88],[189.244,71.481],[172.995,55.698],[150.23,33.5]]]];
    
    var input_width = paths_array[0][0];
    var input_height = paths_array[0][1];
    var tVersion = paths_array[0][2];

    var dispo_width = params.stamp_width - 2*params.margin;
    var sTrace = dispo_width/input_width;
    var stamp_height = input_height*sTrace + 2*params.margin;
    
    var i, len, j, l, poly;
    var stamp = new CSG();
    
    for (i=1, len=paths_array.length; i < len; i++) {
        poly = [paths_array[i][1][0]];
        for (j=1, l=paths_array[i][1].length; j < l; j++) {
            point = paths_array[i][1][j];
            if (point[0] === undefined && point[1] === undefined) continue;
            if (point[0] == poly[poly.length -1][0] && point[1] == poly[poly.length -1][1]) continue;
            
            if (! alreadyInPath(poly, point)) {
                poly.push(point);   
            }
        }
        
        if (paths_array[i][0] == 1) {
            stamp = stamp.union(scale(sTrace, linear_extrude({height:(params.stamp_elevation+params.base_thickness)/sTrace}, polygon(poly))));
        } else {
            stamp = stamp.subtract(scale(sTrace, linear_extrude({height:(params.stamp_elevation+params.base_thickness)/sTrace}, polygon(poly))));
        }
    }
    
    stamp = stamp.translate([-sTrace*input_width/2, -sTrace*input_height/2, 0]);
    stamp = stamp.setColor(0.5, 0.5, 0.6);
    stamp = stamp.scale([-1, -1, 1]);

    var base = CSG.cube({radius: [params.stamp_width/2, stamp_height/2, params.base_thickness/2]});
    base = base.translate([0, 0, params.base_thickness/2]);
    base = base.setColor(0.75, 0.75, 0.85);
    
    return base.union(stamp); 
}

function alreadyInPath(pArray, pPoint) {
    for (var i=0, l=pArray.length; i < l; i++) {
        if (pPoint[0] == pArray[i][0] && pPoint[1] == pArray[i][1]) {
            return true;        
        }
    }
    return false;
}
