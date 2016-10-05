/*
 * imageload_blur.js
 * Permission to use by Benjamin
 * 
 * Thanks to <a href="http://potrace.sourceforge.net/">Potrace</a> by Peter Selinger.<br />
Based on the javascript version by <a href="http://www.h2.dion.ne.jp/~defghi/img2svg/potraceHtml.htm">DEFGHI1977</a> and <a href="http://d.hatena.ne.jp/project_the_tower2/20110724/1311473645">George Nagaoka</a>, <a href="http://www.libspark.org/wiki/nitoyon/PotrAs">Nitoyon</a> (AS3 version).<br /> 
Also based on <a href="http://createjs.com/#!/EaselJS">EaselJS</a> example.<br />
Put together by
<a href="http://thingiverse.com/Benjamin">Benjamin</a> as suggested by <a href="http://plus.google.com/+KurtMeister/">Kurt Meister.</a>
 *
 */
var MAX_IMG_WIDTH = 512;
var MAX_IMG_HEIGHT = 384;
var img;
var stage;
var bmp;
var DELTA_INDEX;
var blurSlider, thresholdSlider;
var blurFilter;
var greyFilter;
var slideInterval = -1;
var scaleImg = 1;
var outputJSCAD;

function init_img_load() {
    if (window.top != window) {
        document.getElementById("header").style.display = "none";
    }
    document.getElementById("loader").className = "loader";

    img = new Image();
    img.onload = handleImageLoad;
    img.src = "assets/void.png";
    
    document.getElementById("file").onchange = function(e){
        $("#svg").empty();
        document.getElementById("selectBtn").style.display = "none";
        document.getElementById("outputText").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("settingsTable").style.display = "none";
        /*document.getElementById("outputSettings").style.display = "none";*/
        
        document.getElementById("invertcb").checked = false;
        
        var files = e.target.files;
        if(files.length == 0){
            return;
        }
        var file = files[0];
        
        if(!file.type.match(/image\/.+/)){
            return;
        }
        
        if(file.type == "image/svg+xml"){
            return;
        }
        var reader = new FileReader();
        reader.onload = function(){
            displayImage(reader.result);
        };
        reader.readAsDataURL(file);
        
        document.getElementById("settingsTable").style.display = "block";
        $('.tools').css("display", "inline-block");
        /*document.getElementById("outputSettings").style.display = "inline";   */
        
    };
    
    $('#invertcb').change(function() {
            invertImg();
    });


} // init

function handleImageLoad() {
    document.getElementById("loader").className = "";           

    var canvas = document.getElementById("imgCanvas");
    var iRatio = img.width / img.height;
                
    if (iRatio >= MAX_IMG_WIDTH/MAX_IMG_HEIGHT) {
        canvas.width = Math.min(MAX_IMG_WIDTH, img.width);
        canvas.height = canvas.width / iRatio;
        scaleImg = Math.min(1, canvas.width / img.width);
    } else {
        canvas.height =  Math.min(MAX_IMG_HEIGHT, img.height);
        canvas.width = canvas.height * iRatio;
        scaleImg = Math.min(1, canvas.height / img.height);
    }
    
    if (img.src.split("void.png").length > 1) {
        $('#tracing').css("height", "28px");
        $('.tools').css("display", "none");
    } else {
        $("#tracing").css("height", (384 + 60) + "px");
        $("#tracing").css("width", (canvas.width + 512 + 10) + "px");
        
        $("#imgCanvas").css("display", "block");
        $("#svg").css("display", "block");
        $("#settingsTable").css("display", "inline-block");
        $('.tools').css("display", "inline-block");
    }
    
    stage = new createjs.Stage(canvas);

    bmp = new createjs.Bitmap(img);
    bmp.scaleX = bmp.scaleY = scaleImg;
    bmp.cache(0,0,img.width,img.height);
    stage.addChild(bmp);            

    $(".blurSlider").slider({
        value: 1,
        min: 0,
        max: 12,
        disabled:false,
        change:handleChange,
        slide: handleSlide
    });
    
    $(".thresholdSlider").slider({
        value: 40,
        min: 0,
        max: 100,
        disabled:false,
        change:handleChange,
    });

    $("#selectBtn").click(selectOutput);
    $("input[name='outputversion']").change(function(){traceImage();});
    applyEffect();
}

function invertImg() {
    var c=document.getElementById("imgSrc");
    var ctx=c.getContext("2d");
    var imgData=ctx.getImageData(0,0,img.width,img.height);
    for (var i=0;i<imgData.data.length;i+=4) {
        imgData.data[i]=255-imgData.data[i];
        imgData.data[i+1]=255-imgData.data[i+1];
        imgData.data[i+2]=255-imgData.data[i+2];
        imgData.data[i+3]=255;
        }
    ctx.putImageData(imgData,0,0);
    
    stage.removeChild(bmp);
    bmp = new createjs.Bitmap(c);
    bmp.scaleX = bmp.scaleY = scaleImg;
    bmp.cache(0,0,img.width,img.height);
    stage.addChild(bmp);
    updateImage();
    traceImage();
}
        
function selectOutput() {
    $("#outputText").focus();
    $("#outputText").select();
    $("#tracing").css("height", "28px");
    $("#imgCanvas").css("display", "none");
    $("#svg").css("display", "none");
    $("#settingsTable").css("display", "none");
    $('.tools').css("display", "none");
    updateJsCad();
}

function updateJsCad (){
    updateSolidFromString(headerJSCAD + outputJSCAD + footerJSCAD);
    //$('#inputJsCad').val(headerJSCAD + outputJSCAD + footerJSCAD);
    //updateSolid();
}
function handleSlide() {
    if (slideInterval == -1) {
        slideInterval = setInterval(applyEffect, 250);
    }
}

function handleChange() {
    clearInterval(slideInterval);
    slideInterval = -1;
    applyEffect();
    traceImage();
}

function applyEffect() {
    var blurValue = $(".blurSlider").slider("option", "value");
    blurFilter = new createjs.BlurFilter(blurValue,  blurValue, 2);
    
    var greyscale = new createjs.ColorMatrix().adjustSaturation(-100);
    greyFilter = new createjs.ColorMatrixFilter(greyscale);
    
    updateImage();
}

function updateImage() {
    bmp.filters = [blurFilter, greyFilter];
    bmp.updateCache();
    stage.update();
}

function displayImage(data){
    img.src = data; 
    var cSrc = document.getElementById('imgSrc');
    var imgS = new Image();
    imgS.src = data;
    imgS.onload = function () {
        cSrc.width = this.width;
        cSrc.height = this.height;
        cSrc.getContext('2d').drawImage(this,0,0);
    }       
}

function traceImage() {
    $("#svg").empty();
    
    var timer = document.getElementById("timer")
    timer.innerHTML = "";
    var divText = document.getElementById("outputText");
    divText.innerHTML = "";
    
    var start = new Date();
    
    var potimg = document.getElementById("imgCanvas");
    var potwidth = potimg.width;
    var potheight = potimg.height;

    var svg = document.getElementById("svg");
    svg.setAttribute("width", potwidth);
    svg.setAttribute("height", potheight);
    svg.setAttribute("viewBox", [0,0,potwidth,potheight].join(" "));

    var thresholdValue = $(".thresholdSlider").slider("option", "value")/100;

    Potrace.setParam({
        threshold: thresholdValue,
        turdSize:3,
        turnPolicy:1,
        alphamax:0.9,
        precision:2
    });
    //var outputVersion = $("input:radio[name=outputversion]:checked").val();   
    
    var outputVersion = "stamp";
    var gElem = Potrace.trace(potimg, outputVersion).toPathElements();
    svg.appendChild(gElem);

    var gText = Potrace.outputScad();   
    divText.innerHTML = gText;
    outputJSCAD = gText;
    
    var end = new Date();
    timer.innerHTML =  (end.getTime() - start.getTime()) + " ms";
    
    document.getElementById("selectBtn").style.display = "block";
    /*document.getElementById("outputText").style.display = "block";
    document.getElementById("timer").style.display = "block";*/
}
