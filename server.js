#!/usr/bin/env node

var http = require('http');
var querystring = require('querystring');
var util = require('util'),
    zlib = require('zlib');
const ipip = require('ipip')();
const detector = require("detector");

const PORT=8080; 

function handleRequest(req, res){

    var post = '',
        chunks = [],
        encoding = req.headers['content-encoding'];

    if( encoding === 'undefined' ){
        req.setEncoding('utf-8'); 
    }

    req.on('data', function(chunk){
        // post += chunk;
        chunks.push(chunk);
    });

    req.on('end', function() {
        var buffer = Buffer.concat(chunks);
        if (encoding == 'gzip') {
            zlib.gunzip(buffer, function (err, decoded) {
                if (!err) {
                    post = decoded.toString();
                    doPost(post, req, res);
                }
            });
        } else if (encoding == 'deflate') {
            zlib.inflate(buffer, function (err, decoded) {
                if (!err) {
                    post = decoded.toString();
                    doPost(post, req, res);
                }
            });
        } else {
            post = buffer.toString();
            doPost(post, req, res);
        }
    });

	// var query = require('url').parse(request.url,true).query;

}

function doPost(post, req, res) {
    post = querystring.parse(post);
    if ( post.ua ) {
        parserUa(post.ua, req, res);
    }else if ( post.ip ) {
        parserIp(post.ip, req, res);
    }else{
        var query = require('url').parse(req.url,true).query;
        if ( query.ua ) {
            parserUa(query.ua, req, res);
        }else if ( query.ip ) {
            parserIp(query.ip, req, res);
        }
    }
}

function parserUa(uastr, req, res) {
	var arrUa = uastr.split("^^").map(function (item) {
        if ( item ) {
            // item = decodeURIComponent(item);
            const tan = detector.parse(item);
            var dict1 = {};
            dict1['Device']   = tan.device.name + "@" + tan.device.fullVersion;
            dict1['Os']   = tan.os.name + "@" + tan.os.fullVersion;
            dict1['Browser']  = tan.browser.name + "@" + tan.browser.fullVersion;
            dict1['Engine']   = tan.engine.name + "@" + tan.engine.fullVersion;
            dict1['Nettype']  = tan.nettype.value.toLowerCase();
            dict1['Language'] = tan.language.value.toLowerCase();
            return {ua:item, json:dict1};
        }
	});
	// console.log(arrUa);
    // res.end(JSON.stringify(arrUa));
    result = JSON.stringify(arrUa);
    var encoding = req.headers['content-encoding'];
    if (encoding == 'gzip') {
        zlib.gzip(result, function(err, result){
           if (!err) {
                res.writeHead(200, { 'content-encoding': 'gzip' });
                res.end(result);
           }
        });
    } else if (encoding == 'deflate') {
        zlib.deflate(result, function(err, result) {
           if (!err) {
                res.writeHead(200, { 'content-encoding': 'deflate' });
                res.end(result);
           }
        });
    } else {
        res.writeHead(200, {});
        res.end(result);
    }     
}

function parserIpMaxMind(item, ipjson) {
    var mmdbreader = require('maxmind-db-reader');
    var countries = mmdbreader.openSync('./data/GeoLite2-City.mmdb');
    var geodata = countries.getGeoDataSync(item);
    if ( geodata ) {
        if (geodata.hasOwnProperty('country'))
            if (geodata.country.hasOwnProperty('names'))
                if (geodata.country.names.hasOwnProperty('zh-CN'))
                    ipjson.country = geodata.country.names['zh-CN'];
        for(var i in geodata.subdivisions)
            if (geodata.subdivisions[i].hasOwnProperty('names')) {
                if (geodata.subdivisions[i].names.hasOwnProperty('zh-CN')) {
                    ipjson.province = geodata.subdivisions[i].names['zh-CN']; 
                    if (ipjson.province.endsWith('省') || ipjson.province.endsWith('市'))
                        ipjson.province = ipjson.province.substr(0, ipjson.province.length-1);
                }
            }
        if (geodata.hasOwnProperty('city'))
            if (geodata.city.hasOwnProperty('names'))
                if (geodata.city.names.hasOwnProperty('zh-CN')) {
                    ipjson.city = geodata.city.names['zh-CN'];
                    if (ipjson.city.endsWith('市'))
                        ipjson.city = ipjson.city.substr(0, ipjson.city.length-1);
                    // ipjson.city = ipjson.city.substr(-1, 1).replace(/市/g, "");
                }
    }
    // console.log(geodata);
    if (ipjson.country == '')
        ipjson.country = 'N/A';
    if (ipjson.province == '')
        ipjson.province = 'N/A';
    if (ipjson.city == '')
        ipjson.city = 'N/A'; 

    return ipjson;
}

function parserIp(ipstr, req, res) {
    
    var arrIp = ipstr.split(",").map(function (item) {
        if ( item ) {
        	var ipjson = ipip(item);
            // if ( ipjson.city == 'N/A' || ipjson.city == '' || ipjson.province == 'N/A' || ipjson.province == '' ) {
            //     ipjson = parserIpMaxMind(item, ipjson);
            // }
            return {ip:item, json:ipjson};
        }
    });
    // console.log(arrIp);
    // res.end(JSON.stringify(arrIp));
    result = JSON.stringify(arrIp);
    var encoding = req.headers['content-encoding'];
    if (encoding == 'gzip') {
        zlib.gzip(result, function(err, result){
           if (!err) {
                res.writeHead(200, { 'content-encoding': 'gzip' });
                res.end(result);
           }
        });
    } else if (encoding == 'deflate') {
        zlib.deflate(result, function(err, result) {
           if (!err) {
                res.writeHead(200, { 'content-encoding': 'deflate' });
                res.end(result);
           }
        });
    } else {
        res.writeHead(200, {});
        res.end(result);
    } 
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
